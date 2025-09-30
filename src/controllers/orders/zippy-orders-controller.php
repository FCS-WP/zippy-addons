<?php

namespace Zippy_Booking\Src\Controllers\Orders;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Dompdf\Dompdf;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\Services\Zippy_Handle_Product_Add_On;
use Zippy_Booking\Src\Services\Zippy_Handle_Product_Tax;
use WC_Coupon;

defined('ABSPATH') or die();

class Zippy_Orders_Controller
{
  public static function export_orders(WP_REST_Request $request)
  {

    $required_fields = [
      "file_type" => ["required" => true, "data_type" => "range", "allowed_values" => ["csv", "pdf"]],
      "customer_id" => ["required" => true, "data_type" => "string"],
    ];

    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate);
    }

    $file_type = sanitize_text_field($request->get_param('file_type'));
    $customer_id = sanitize_text_field($request->get_param('customer_id'));
    $from_date = sanitize_text_field($request->get_param('from_date'));
    $to_date = sanitize_text_field($request->get_param('to_date'));

    $args = array(
      'status' => array('completed', 'processing'),
      'limit' => -1,
      'customer_id' => $customer_id
    );

    if (!empty($from_date) && !empty($to_date)) {
      $from_timestamp = strtotime($from_date);
      $to_timestamp = strtotime($to_date);
      if ($from_timestamp == false || $to_timestamp == false) {
        return Zippy_Response_Handler::error('Invalid date format for from_date or to_date');
      }
      $args['date_created'] = date('Y-m-d 00:00:00', $from_timestamp) . '...' . date('Y-m-d 23:59:59', $to_timestamp);
    }

    $orders = wc_get_orders($args);

    // Return if no completed order
    if (empty($orders)) {
      return Zippy_Response_Handler::success([], 'No completed orders found');
    }

    $order_data = [];
    foreach ($orders as $order) {
      $quantity = 0;
      foreach ($order->get_items() as $item) {
        $quantity += $item->get_quantity();
      }

      $payment_status = $order->is_paid() ? 'Paid' : 'Unpaid';

      $billing_date = $order->get_meta('_billing_date');

      //  billing_date to M d, Y
      $formatted_date = '';
      if (!empty($billing_date)) {
        $timestamp = is_numeric($billing_date) ? (int) $billing_date : strtotime($billing_date);
        if ($timestamp !== false) {
          $formatted_date = date_i18n('F j, Y', $timestamp);
        }
      }

      $order_data[] = array(
        'order_date' => $formatted_date ?: 'N/A',
        'order_id' => $order->get_id(),
        'payment_method' => $order->get_payment_method_title(),
        'amount' => "$" . $order->get_total(),
        'payment_status' => $payment_status,
      );
    }

    // Return if no order with transaction id
    if (empty($order_data)) {
      return Zippy_Response_Handler::success([], 'No orders with transaction ID found');
    }

    $file_content = null;

    $timestamp = time();
    $filename = 'orders_with_transaction_' . $timestamp . '.' . $file_type;


    // File Columns
    $columns = [
      'Order Date',
      'Order ID',
      'Payment Method',
      'Amount',
      'Payment Status'
    ];

    if ($file_type == "pdf") {
      $html = '<!DOCTYPE html>';
      $html .= '<html><head><meta charset="UTF-8"></head><body>';
      $html .= '<h1 style="text-align: center">Billing Report</h1>';
      $html .= '<table border="1" style="width:100%; border-collapse: collapse;"><tr>';

      foreach ($columns as $col) {
        $html .= "<th style='padding:10px 0'>$col</th>";
      }

      $html .= '</tr>';

      foreach ($order_data as $data) {
        $html .= '<tr>';
        $html .= '<td style="padding: 5px">' . $data['order_date'] . '</td>';
        $html .= '<td style="padding: 5px">' . $data['order_id'] . '</td>';
        $html .= '<td style="padding: 5px">' . $data['payment_method'] . '</td>';
        $html .= '<td style="padding: 5px">' . $data['amount'] . '</td>';
        $html .= '<td style="padding: 5px">' . $data['payment_status'] . '</td>';
        $html .= '</tr>';
      }

      $html .= '</table></body></html>';

      $dompdf = new Dompdf();
      $dompdf->loadHtml($html);
      $dompdf->setPaper('A4', 'landscape');
      $dompdf->render();

      $file_content = $dompdf->output();
    } else {
      $output = fopen('php://memory', 'w');

      //   UTF-8
      fwrite($output, "\xEF\xBB\xBF");

      // Add Column
      fputcsv($output, $columns, ',');

      // Data
      foreach ($order_data as $data) {
        fputcsv($output, [
          $data['order_date'],
          $data['order_id'],
          $data['payment_method'],
          $data['amount'],
          $data['payment_status'],
        ], ',');
      }

      // CSV Content
      fseek($output, 0);
      $file_content = stream_get_contents($output);
      fclose($output);
    }

    $file_base64 = base64_encode($file_content);

    return Zippy_Response_Handler::success([
      'file_base64' => $file_base64,
      'file_name' => $filename,
      'file_type' => $file_type
    ]);
  }


  public static function add_product_to_order(WP_REST_Request $request) 
  {
    $required_fields = [
        "order_id"           => ["required" => true, "data_type" => "integer"],
        "parent_product_id"  => ["required" => true, "data_type" => "integer"],
        "quantity"           => ["required" => true, "data_type" => "integer"],
        "packing_instructions" => ["required" => false, "data_type" => "string"],
    ];

    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
        return Zippy_Response_Handler::error($validate);
    }

    $order_id = intval($request->get_param('order_id'));
    $order    = wc_get_order($order_id);
    if (!$order) {
        return Zippy_Response_Handler::error('Order not found.');
    }

    $product_id   = intval($request->get_param('parent_product_id'));
    $quantity     = max(1, intval($request->get_param('quantity')));
    $packing_instructions = sanitize_text_field($request->get_param('packing_instructions'));
    $addons       = $request->get_param('addons');

    $product = wc_get_product($product_id);
    if (!$product) {
        return Zippy_Response_Handler::error('Product not found.');
    }

    $product_price = get_product_pricing_rules($product, 1);

    // Add parent product to order
    $item_id = $order->add_product($product, $quantity);
    if (is_wp_error($item_id)) {
        return Zippy_Response_Handler::error('Failed to add product to order.');
    }

    $added_items = [];
    $item        = $order->get_item($item_id);
    $added_items = [
        'product_id' => $product_id,
        'quantity'   => $quantity,
        'item_id'    => $item_id,
    ];

    // Handle addons
    $addon_meta = [];
    if (!empty($addons) && is_array($addons)) {
        $addon_meta = Zippy_Handle_Product_Add_On::build_addon_data($addons, $quantity);
        self::handleUpdateOrderAddons($item, $quantity, $product, $addon_meta, $product_price);
        $added_items['addons'] = $addon_meta;
    } else {
        // Set tax for simple product
        Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $product_price, $quantity);
    }

    self::updateMetaData($order, $item_id, 'packing_instructions', $packing_instructions);

    if (empty($added_items)) {
        return Zippy_Response_Handler::error('No products were added to the order.');
    }

    // $order->calculate_totals();

    return Zippy_Response_Handler::success([
        'order_id' => $order_id,
        'items'    => $added_items,
        'message'  => 'Products added to order successfully',
    ]);
  }

  private static function updateMetaData($order, $item_id, $key, $value) {
      if (empty($value)) {
        return;
      }

      $item = $order->get_item($item_id);
      if ($item) {
          $item->update_meta_data($key, $value);
          $item->save();
      }
  }

  private static function handleUpdateOrderAddons($item, $quantity, $product, $addon_meta, $product_price) 
  {
    if (empty($item) || empty($addon_meta)) {
        return false;
    }

    $item->update_meta_data('akk_selected', $addon_meta);

    // Set tax for no composite product
    if (!is_composite_product($product)) {
        $total = Zippy_Handle_Product_Add_On::calculate_addon_total($addon_meta);
        $tax   = Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $total, $quantity);
        if ($tax === false) {
            return Zippy_Response_Handler::error('Failed to calculate tax for the order item.');
        }
        return true;
    }

    // Set tax for composite product
    Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $product_price, $quantity);
    return true;
  }

  public static function get_order_info(WP_REST_Request $request) 
  {
    $required_fields = [
        "order_id" => ["required" => true, "data_type" => "integer"],
    ];

    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
        return Zippy_Response_Handler::error($validate);
    }

    $order_id = intval($request->get_param('order_id'));
    $order    = wc_get_order($order_id);
    if (!$order) {
        return Zippy_Response_Handler::error('Order not found.');
    }

    $items = $order->get_items();
    $shipping_items = $order->get_items('shipping');
    $fee = $order->get_items('fee');
    $coupon_items = $order->get_items('coupon');

    $result = [];

    foreach ($items as $item_id => $item) {
        $akk_selected = $item->get_meta('akk_selected', true);
        $akk_selected = maybe_unserialize($akk_selected);
        $addons = [];

        if (!empty($akk_selected)) {
            foreach ($akk_selected as $addon_id => $values) {
                $addon_product = wc_get_product($addon_id);
                $addons[] = [
                    'addon_id' => $addon_id,
                    'name'     => $addon_product ? $addon_product->get_name() : '',
                    'quantity' => $values[0] ?? 0,
                    'price'    => $values[1] ?? 0,
                ];
            }
        }
        $product = $item->get_product();
        $result['products'][$item_id] = [
            'product_id'    => $product ? $product->get_id() : 0,
            'name'           => $product ? $product->get_name() : '',
            'img_url'       => $product ? wp_get_attachment_url($product->get_image_id()) : '',
            'sku'           => $product ? $product->get_sku() : '',
            'quantity'       => $item->get_quantity(),
            'addons'         => $addons,
            'price_total'    => wc_format_decimal( $item->get_subtotal(), wc_get_price_decimals() ),
            'tax_total'      => wc_format_decimal( $item->get_subtotal_tax(), wc_get_price_decimals() ),
            'price_per_item' => wc_format_decimal( $item->get_subtotal() / max(1, $item->get_quantity()), wc_get_price_decimals() ),
            'tax_per_item'   => wc_format_decimal( $item->get_subtotal_tax() / max(1, $item->get_quantity()), wc_get_price_decimals() ),
            'parking_instructions' => $item->get_meta('packing_instructions', true)
        ];
    }

    foreach ($shipping_items as $ship_id => $shipping) {
        $result['shipping'][] = [
            'method' => $shipping->get_name(),
            'total'  => $shipping->get_total(),
            'tax_shipping' => $shipping->get_total_tax(),
        ];
    }

    foreach ($fee as $fee_id => $fee_item) {
        $result['fees'][] = [
            'name'  => $fee_item->get_name(),
            'total' => $fee_item->get_total(),
            'tax_fee' => $fee_item->get_total_tax(),
        ];
    }

    foreach ($coupon_items as $coupon_id => $coupon) {
        $result['coupons'][] = [
            'total' => $coupon->get_discount(),
        ];
    }

    return Zippy_Response_Handler::success($result);
  }

  public static function remove_order_item(WP_REST_Request $request) 
  {
    $required_fields = [
        "order_id" => ["required" => true, "data_type" => "integer"],
        "item_id"  => ["required" => true, "data_type" => "integer"],
    ];

    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
        return Zippy_Response_Handler::error($validate);
    }

    $order_id = intval($request->get_param('order_id'));
    $item_id  = intval($request->get_param('item_id'));

    $order = wc_get_order($order_id);
    if (!$order) {
        return Zippy_Response_Handler::error('Order not found.');
    }

    $deleted = wc_delete_order_item($item_id);

    if (!$deleted) {
        // $order->calculate_totals();
        return Zippy_Response_Handler::error('Failed to delete order item.');
    }

    return Zippy_Response_Handler::success([
        'order_id' => $order_id,
        'item_id'  => $item_id,
    ], 'Order item deleted successfully.');
  }

  public static function update_meta_data_order_item(WP_REST_Request $request) {
      $order_id = $request->get_param('order_id');
      $item_id  = $request->get_param('item_id');
      $quantity = $request->get_param('quantity');

      if (empty($order_id) || empty($item_id) || !is_numeric($quantity)) {
          return Zippy_Response_Handler::error('Missing or invalid parameters.');
      }

      $order = wc_get_order($order_id);
      if (!$order) {
          return Zippy_Response_Handler::error('Order not found.');
      }

      $item = $order->get_item($item_id);
      if (!$item) {
          return Zippy_Response_Handler::error('Order item not found.');
      }

      $item->set_quantity($quantity, true);
      $item->save();

      return Zippy_Response_Handler::success([
          'status' => 'success',
          'message' => 'Quantity updated',
          'data' => [
              'order_id' => $order_id,
              'item_id' => $item_id,
              'quantity' => $quantity
          ]
      ], 200);
  }

  public static function apply_coupon_to_order(WP_REST_Request $request) {
    try {
      $order_id = $request->get_param('order_id');
      $coupon_code = $request->get_param('coupon_code');

      if (empty($order_id) || empty($coupon_code)) {
          return Zippy_Response_Handler::error('Missing parameters.');
      }

      $order = wc_get_order($order_id);
      if (!$order) {
          return Zippy_Response_Handler::error('Order not found.');
      }

      $coupon = new WC_Coupon($coupon_code);
      if (!$coupon || !$coupon->get_id()) {
          return Zippy_Response_Handler::error('Invalid coupon code.');
      }

      foreach ($order->get_items('coupon') as $item) {
          if ($item->get_code() === $coupon_code) {
              return Zippy_Response_Handler::error('Coupon already applied to this order.');
          }
      }

      $item_id = $order->add_coupon($coupon_code);
      if (is_wp_error($item_id)) {
          return Zippy_Response_Handler::error('Failed to apply coupon to order.');
      }

      $order = wc_get_order($order_id);
      $order->calculate_totals();

      return Zippy_Response_Handler::success([
          'order_id' => $order_id,
          'coupon_code' => $coupon_code,
          'message' => 'Coupon applied successfully.'
      ]);
    } catch (\Throwable $th) {
      return Zippy_Response_Handler::error('An error occurred while applying the coupon.');
    }
  }

  public static function update_order_status(WP_REST_Request $request) {
      $order_ids = $request->get_param('order_ids');
      $status = $request->get_param('status');

      if (empty($order_ids) || empty($status)) {
          return Zippy_Response_Handler::error('Missing parameters.');
      }

      if (!is_array($order_ids)) {
          return Zippy_Response_Handler::error('Order IDs must be an array.');
      }

      $valid_statuses = wc_get_order_statuses();
      if (!array_key_exists($status, $valid_statuses)) {
          return Zippy_Response_Handler::error('Invalid order status.');
      }

      $updated_orders = [];
      $failed_orders = [];

      foreach ($order_ids as $order_id) {
          $order = wc_get_order($order_id);
          if ($order) {
              $order->update_status($status, 'Order status updated via API', true);
              $updated_orders[] = $order_id;
          } else {
              $failed_orders[] = $order_id;
          }
      }

      return Zippy_Response_Handler::success([
          'updated_orders' => $updated_orders,
          'failed_orders' => $failed_orders,
          'new_status' => $status,
      ], 'Order statuses updated successfully.');
  }

  public static function move_to_trash(WP_REST_Request $request) {
      $order_ids = $request->get_param('order_ids');

      if (empty($order_ids)) {
          return Zippy_Response_Handler::error('Missing order_ids.');
      }

      $trashed = [];

      foreach ($order_ids as $order_id) {
          $order = wc_get_order($order_id);

          if ($order) {
              $order->delete( false );
              $trashed[] = $order_id;
          }
      }

      if (empty($trashed)) {
          return Zippy_Response_Handler::error('No orders were trashed.');
      }

      return Zippy_Response_Handler::success([
          'trashed_orders' => $trashed,
      ], 'Orders moved to trash.');
  }
}