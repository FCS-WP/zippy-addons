<?php

namespace Zippy_Booking\Src\Controllers\Reports;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;

defined('ABSPATH') or die();

class Zippy_Reports_Controller
{
  public static function export_fulfilment_report(WP_REST_Request $request)
  {
    $validate = self::validate_request($request);

    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate);
    }

    $file_type = sanitize_text_field($request->get_param('type'));
    $date      = sanitize_text_field($request->get_param('date'));

    $orders = self::get_orders($date);
    if (empty($orders)) {
      return Zippy_Response_Handler::success([], 'No completed orders found');
    }
    $fulfilment_date = date("M j, Y", strtotime($date));

    [$order_rows, $product_summary] = self::process_orders($orders);

    $file_content = self::generate_csv($order_rows, $product_summary, $fulfilment_date);
    $file_base64  = base64_encode($file_content);

    $filename = 'fulfilment_' . $fulfilment_date . time() . '.' . $file_type;

    return Zippy_Response_Handler::success([
      'file_base64' => $file_base64,
      'file_name'   => $filename,
      'file_type'   => $file_type,
    ]);
  }

  /**
   * Validate API request
   */
  private static function validate_request(WP_REST_Request $request)
  {
    $required_fields = [
      "type" => ["required" => true, "data_type" => "range", "allowed_values" => ["csv", "pdf"]],
      "date" => ["required" => true, "data_type" => "string"],
    ];

    return Zippy_Request_Validation::validate_request($required_fields, $request);
  }

  /**
   * Fetch WooCommerce orders
   */
  private static function get_orders($date)
  {
    $args = [
      'limit' => -1,
      BILLING_DATE => $date,
      'meta_key'      => BILLING_DATE,
      'meta_value'    => $date,
      'meta_compare'  => '=',
      'orderby' => 'meta_value',
      'order'      => 'ASC'
    ];
    return wc_get_orders($args);
  }

  /**
   * Process orders → return rows + summary
   */
  private static function process_orders($orders)
  {
    $product_summary = [];
    $order_rows      = [];

    foreach ($orders as $order) {
      $order_id     = $order->get_id();
      $phone        = $order->get_billing_phone();
      $mode         = $order->get_meta(BILLING_METHOD);

      if (empty($mode)) {
        continue;
      }

      foreach ($order->get_items() as $item) {
        // Handle parent product
        [$row, $product_summary] = self::process_item($order, $item, $phone, $mode, $product_summary);
        $order_rows[] = $row;

        // Handle add-ons
        [$addon_rows, $product_summary] = self::process_addons($order, $item, $phone, $mode, $product_summary);
        $order_rows = array_merge($order_rows, $addon_rows);
      }
    }

    return [$order_rows, $product_summary];
  }

  /**
   * Process a single order item
   */
  private static function process_item($order, $item, $phone, $mode, $product_summary)
  {
    $name = $item->get_name();
    $qty  = $item->get_quantity();

    // Update product summary
    if (!isset($product_summary[$name])) {
      $product_summary[$name] = 0;
    }
    $product_summary[$name] += $qty;

    // Build row
    $row = [
      'order_number'   => '#' . $order->get_id(),
      'phone'          => $phone,
      'mode'           => $mode,
      'time'           => $order->get_meta(BILLING_TIME),
      'item'           => $name,
      'quantity'       => $qty,
      'total_quantity' => $qty,
    ];

    return [$row, $product_summary];
  }

  /**
   * Process item add-ons (akk_selected)
   */
  private static function process_addons($order, $item, $phone, $mode, $product_summary)
  {
    $rows = [];
    $akk_selected = $item->get_meta('akk_selected');

    if (!empty($akk_selected) && is_array($akk_selected)) {
      foreach ($akk_selected as $add_on_id => $add_on_qty) {
        if ($add_on_qty <= 0) {
          continue;
        }

        $add_on_product = wc_get_product($add_on_id);
        if (!$add_on_product) {
          continue;
        }

        $add_on_name = $add_on_product->get_name();

        // Update product summary
        if (!isset($product_summary[$add_on_name])) {
          $product_summary[$add_on_name] = 0;
        }
        $product_summary[$add_on_name] += $add_on_qty;

        // Build row
        $rows[] = [
          'order_number'   => '#' . $order->get_id(),
          'phone'          => $phone,
          'mode'           => $mode,
          'time'           => $order->get_date_created()->date("H:i"),
          'item'           => $add_on_name,
          'quantity'       => $add_on_qty,
          'total_quantity' => $add_on_qty,
        ];
      }
    }

    return [$rows, $product_summary];
  }

  /**
   * Generate CSV output
   */
  private static function generate_csv($order_rows, $product_summary, $fulfilment_date)
  {
    $output = fopen('php://memory', 'w');
    fwrite($output, "\xEF\xBB\xBF"); // UTF-8 BOM

    // Table 1: Orders
    fputcsv($output, ['Fulfilment Date :' . $fulfilment_date], ',');
    fputcsv($output, ['Order Number', 'Phone', 'Mode', 'Time', 'Items', 'Quantity', 'Total Quantity'], ',');

    $current_order_id = null;
    foreach ($order_rows as $row) {
      if ($row['order_number'] !== $current_order_id) {
        fputcsv($output, [$row['order_number'], $row['phone'], $row['mode'], $row['time'], $row['item'], $row['quantity'], $row['total_quantity']], ',');
        $current_order_id = $row['order_number'];
      } else {
        fputcsv($output, ['', '', '', '', $row['item'], $row['quantity'], $row['total_quantity']], ',');
      }
    }

    fputcsv($output, [], ','); // Blank line

    // Table 2: Product Summary
    fputcsv($output, ['Summary'], ',');
    fputcsv($output, ['Product', 'Quantity'], ',');
    foreach ($product_summary as $product => $qty) {
      fputcsv($output, [$product, $qty], ',');
    }

    fseek($output, 0);
    $content = stream_get_contents($output);
    fclose($output);

    return $content;
  }
}
