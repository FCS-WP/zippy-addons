<?php

namespace Zippy_Booking\Src\Controllers\Orders;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Dompdf\Dompdf;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\Services\Zippy_Handle_Product_Add_On;
use Zippy_Booking\Src\Services\Zippy_Handle_Product_Tax;
use Zippy_Booking\Src\Services\Zippy_Handle_Shipping;
use WC_Coupon;
use WC_Tax;
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;
use Zippy_Booking\Src\Services\Zippy_Datetime_Helper;
use Zippy_Booking\Src\Woocommerce\Admin\Zippy_Woo_Manual_Order;
use Zippy_Booking\Utils\Zippy_Wc_Calculate_Helper;

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
        $order_id = intval($request->get_param('order_id'));
        $order    = wc_get_order($order_id);
        if (!$order) {
            return Zippy_Response_Handler::error('Order not found.');
        }

        $user_id = $order->get_user_id() ?? 0;
        $products = $request->get_param('products');
        if (empty($products) || !is_array($products)) {
            return Zippy_Response_Handler::error('No products provided.');
        }

        $added_items = [];
        foreach ($products as $product) {
            $added_item = self::add_single_product_to_order($order, $product, $user_id);
            if (!empty($added_item)) {
                $added_items[] = $added_item;
            }
        }

        self::handle_free_shipping($order_id);

        return Zippy_Response_Handler::success([
            'order_id' => $order_id,
            'items'    => $added_items,
            'message'  => 'Products added to order successfully',
        ]);
    }

    // private static function add_single_product_to_order($order, $product, $user_id)
    // {
    //     $added_items = [];
    //     $product_id = intval($product['parent_product_id'] ?? 0);
    //     $quantity   = max(1, intval($product['quantity'] ?? 1));
    //     $packing_instructions = sanitize_text_field($product['packing_instructions'] ?? '');
    //     $addons     = $product['addons'] ?? [];

    //     $product = wc_get_product($product_id);
    //     if (!$product) {
    //         return Zippy_Response_Handler::error('Product not found.');
    //     }

    //     $product_type = $product->get_type();
    //     if ($product_type == 'variable') {
    //         $variation_id = $addons[0]['item_id'] ?? 0;
    //         $product = wc_get_product($variation_id);
    //         if (!$product) {
    //             return Zippy_Response_Handler::error('Variation product not found.');
    //         }
    //     }

    //     //Get product price for 1 unit (In calculation of tax function => product_price * quantity)
    //     $product_price = get_product_pricing_rules($product, 1, $user_id);
    //     if (is_null($product_price)) {
    //         return Zippy_Response_Handler::error('Failed to get product pricing by user.');
    //     }

    //     // Add product to order
    //     $item_id = $order->add_product($product, $quantity);
    //     if (is_wp_error($item_id)) {
    //         return Zippy_Response_Handler::error('Failed to add product to order.');
    //     }

    //     $item = $order->get_item($item_id);
    //     if (!$item) {
    //         return Zippy_Response_Handler::error('Failed to retrieve added order item.');
    //     }

    //     $added_items = [
    //         'product_id' => $product_id,
    //         'quantity'   => $quantity,
    //         'item_id'    => $item_id,
    //     ];

    //     // Handle addons
    //     $addon_meta = [];
    //     if (!empty($addons) && is_array($addons) && $product_type != 'variable') {
    //         $addon_meta = Zippy_Handle_Product_Add_On::build_addon_data($addons, $quantity, $user_id);
    //         self::handleUpdateOrderAddons($item, $quantity, $product, $addon_meta, $product_price);
    //         $added_items['addons'] = $addon_meta;
    //     } else {
    //         // Set tax for simple product
    //         Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $product_price, $quantity);
    //     }

    //     self::updateMetaData($order, $item_id, 'packing_instructions', $packing_instructions);

    //     return $added_items;
    // }

    private static function add_single_product_to_order($order, $productData, $user_id)
    {
        $product_id = intval($productData['parent_product_id'] ?? 0);
        $product    = wc_get_product($product_id);

        if (!$product) {
            return Zippy_Response_Handler::error('Product not found.');
        }

        $type = $product->get_type();
        switch ($type) {
            case 'variable':
                return self::add_variable_product_to_order($order, $productData, $user_id);

            default:
                if (!empty($productData['addons']) && is_array($productData['addons'])) {
                    return self::add_add_on_product_to_order($order, $productData, $user_id);
                }

                return self::add_simple_product_to_order($order, $productData, $user_id);
        }
    }

    private static function add_simple_product_to_order($order, $productData, $user_id)
    {
        $product_id = intval($productData['parent_product_id'] ?? 0);
        $quantity   = max(1, intval($productData['quantity'] ?? 1));
        $packing_instructions = sanitize_text_field($productData['packing_instructions'] ?? '');

        $product = wc_get_product($product_id);
        $product_price = get_product_pricing_rules($product, 1, $user_id);
        if (is_null($product_price)) {
            return Zippy_Response_Handler::error('Failed to get product pricing.');
        }

        $item_id = $order->add_product($product, $quantity);
        if (is_wp_error($item_id)) {
            return Zippy_Response_Handler::error('Failed to add product to order.');
        }

        $item = $order->get_item($item_id);
        Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $product_price, $quantity);

        self::updateMetaData($order, $item_id, 'packing_instructions', $packing_instructions);

        return [
            'product_id' => $product_id,
            'quantity'   => $quantity,
            'item_id'    => $item_id,
        ];
    }

    private static function add_variable_product_to_order($order, $productData, $user_id)
    {
        $addons = $productData['addons'] ?? [];
        $variation_id = $addons[0]['item_id'] ?? 0;
        $quantity     = max(1, intval($productData['quantity'] ?? 1));
        $packing_instructions = sanitize_text_field($productData['packing_instructions'] ?? '');

        $variation = wc_get_product($variation_id);
        if (!$variation) {
            return Zippy_Response_Handler::error('Variation product not found.');
        }

        $product_price = get_product_pricing_rules($variation, 1, $user_id);
        if (is_null($product_price)) {
            return Zippy_Response_Handler::error('Failed to get pricing for variation.');
        }

        $item_id = $order->add_product($variation, $quantity);
        if (is_wp_error($item_id)) {
            return Zippy_Response_Handler::error('Failed to add variation to order.');
        }

        $item = $order->get_item($item_id);
        Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $product_price, $quantity);
        self::updateMetaData($order, $item_id, 'packing_instructions', $packing_instructions);

        return [
            'product_id' => $variation_id,
            'quantity'   => $quantity,
            'item_id'    => $item_id,
        ];
    }

    private static function add_add_on_product_to_order($order, $productData, $user_id)
    {
        $product_id = intval($productData['parent_product_id'] ?? 0);
        $quantity   = max(1, intval($productData['quantity'] ?? 1));
        $addons     = $productData['addons'] ?? [];

        $packing_instructions = sanitize_text_field($productData['packing_instructions'] ?? '');

        $product = wc_get_product($product_id);

        if (!$product) {
            return Zippy_Response_Handler::error('Product not found.');
        }


        $product_price = get_product_pricing_rules($product, 1, $user_id);
        if (is_null($product_price)) {
            return Zippy_Response_Handler::error('Failed to get product pricing.');
        }

        $item_id = $order->add_product($product, $quantity);
        if (is_wp_error($item_id)) {
            return Zippy_Response_Handler::error('Failed to add product to order.');
        }

        $item = $order->get_item($item_id);
        if (empty($addons)) {
            return Zippy_Response_Handler::error('No addons found.');
        }
        //Extra price
        $min_max_options = get_field('min_max_options', $product_id);

        $extra_price = 0;

        if (is_array($addons) && is_array($min_max_options)) {
            $price_map = array_column($min_max_options, 'extra_price', 'value');

            $totalQuantity = array_sum(array_column($addons, 'quantity'));

            $extra_price =  $price_map[$totalQuantity] * $quantity;

            self::updateMetaData($order, $item_id, 'combo_extra_price', '$' . $extra_price);
        }


        $addon_meta = Zippy_Handle_Product_Add_On::build_addon_data($addons, $quantity, $user_id);

        self::handleUpdateOrderAddons($item, $quantity, $product, $addon_meta, $product_price, $extra_price);

        self::updateMetaData($order, $item_id, 'packing_instructions', $packing_instructions);


        return [
            'product_id' => $product_id,
            'quantity'   => $quantity,
            'item_id'    => $item_id,
            'addons'     => $addon_meta,
        ];
    }

    private static function updateMetaData($order, $item_id, $key, $value)
    {
        if (empty($value)) {
            return;
        }

        $item = $order->get_item($item_id);
        if ($item) {
            $item->update_meta_data($key, $value);
            $item->save();
        }
    }

    private static function handleUpdateOrderAddons($item, $quantity, $product, $addon_meta, $product_price,  $combo_extra_price = 0)
    {
        if (empty($item) || empty($addon_meta)) {
            return false;
        }

        $item->update_meta_data('akk_selected', $addon_meta);
        // Set tax for no composite product
        if (
            !is_composite_product($product)
            || (
                is_composite_product($product)
                && Zippy_Handle_Product_Add_On::is_baby_shower_product($product)
            )
        ) {
            $total = Zippy_Handle_Product_Add_On::calculate_addon_total($addon_meta, $combo_extra_price);
            $tax   = Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $total);
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
        if (empty($order)) {
            return Zippy_Response_Handler::error('Order not found.');
        }

        $items = $order->get_items();
        $shipping_items = $order->get_items('shipping');
        $fee = $order->get_items('fee');
        $coupon_items = $order->get_items('coupon');

        $result = [];

        [$result['products'], $subtotalOrder, $taxTotalOrder] = self::get_products_info($items);
        [$result['shipping'], $totalShipping, $taxShipping] = self::get_shipping_info($shipping_items);
        [$result['fees'], $totalFee, $taxFee] = self::get_fees_info($fee);
        [$result['coupons'], $totalCoupon] = self::get_coupons_info($coupon_items);

        $taxTotal = Zippy_Wc_Calculate_Helper::round_price_wc($taxTotalOrder + $taxShipping + $taxFee);
        $totalCalculated = Zippy_Wc_Calculate_Helper::round_price_wc(
            ($subtotalOrder + $totalShipping + $totalFee - $totalCoupon)
        );

        $result['order_info'] = [
            'subtotal'   => $subtotalOrder,
            'tax_total'  => $taxTotal,
            'total'      => $totalCalculated,
        ];

        return Zippy_Response_Handler::success($result);
    }

    public static function update_user_id_and_price_product(WP_REST_Request $request)
    {
        $required_fields = [
            "order_id" => ["required" => true, "data_type" => "integer"],
            "user_id"  => ["required" => true, "data_type" => "integer"],
            "action"   => ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $order_id = intval($request->get_param('order_id'));
        $order    = wc_get_order($order_id);
        if (empty($order)) {
            return Zippy_Response_Handler::error('Order not found.');
        }

        //Update Customer ID To Order
        $user_id = $request->get_param('user_id');
        self::updateCustomerForOrder($order, $user_id);

        if (!self::validate_condition_update_price_by_user($order)) {
            return Zippy_Response_Handler::success([], 'Not enough conditions to update price by user.');
        }

        // Update price again
        $items = $order->get_items();
        foreach ($items as $item_id => $item) {
            $product = $item->get_product();
            $quantity = $item->get_quantity();

            $product_price = get_product_pricing_rules($product, 1, $user_id);
            if (is_null($product_price)) {
                return Zippy_Response_Handler::error('Failed to get product pricing by user.');
            }

            $akk_selected = maybe_unserialize($item->get_meta('akk_selected', true));
            $addons = [];
            if (!empty($akk_selected)) {
                foreach ($akk_selected as $addon_id => $values) {
                    $addons[] = [
                        'item_id' => $addon_id,
                        'quantity' => $values[0] / $quantity,
                    ];
                }
            }

            if (!empty($addons) && is_array($addons)) {
                $addon_meta = Zippy_Handle_Product_Add_On::build_addon_data($addons, $quantity, $user_id);
                self::handleUpdateOrderAddons($item, $quantity, $product, $addon_meta, $product_price);
            } else {
                // Set tax for simple product
                Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $product_price, $quantity);
            }
        }

        self::handle_free_shipping($order_id);

        return Zippy_Response_Handler::success(['status' => 'success'], 'Update price product by user successfully.');
    }

    public static function validate_condition_update_price_by_user($order)
    {
        if ($order->get_meta('is_manual_order') !== 'yes') {
            return false;
        }

        $status = $order->get_status();
        if (!in_array($status, [Zippy_Woo_Manual_Order::ON_HOLD, Zippy_Woo_Manual_Order::PENDING])) {
            return false;
        }

        $billing_date = $order->get_meta(BILLING_DATE);
        if (empty($billing_date)) {
            return false;
        }

        $billing_time = $order->get_meta(BILLING_TIME);

        if (!empty($billing_time)) {
            $billing_date = Zippy_Datetime_Helper::merge_date_and_time($billing_date, $billing_time);
        }

        $billing_timestamp = Zippy_Datetime_Helper::convert_to_singapore_timestamp_from_date_string($billing_date);
        $current_time = current_time('timestamp');

        if ($billing_timestamp < $current_time) {
            return false;
        }

        return true;
    }

    public static function updateCustomerForOrder($order, $user_id)
    {
        if (empty($order)) {
            return false;
        }

        $order->set_customer_id($user_id);
        $order->save();

        return true;
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

        self::handle_free_shipping($order_id);

        return Zippy_Response_Handler::success([
            'order_id' => $order_id,
            'item_id'  => $item_id,
        ], 'Order item deleted successfully.');
    }

    public static function update_meta_data_order_item(WP_REST_Request $request)
    {
        $order_id = $request->get_param('order_id');
        $item_id  = $request->get_param('item_id');
        $quantity = $request->get_param('quantity');
        $addons   = $request->get_param('addons');

        if (empty($order_id) || empty($item_id) || !is_numeric($quantity)) {
            return Zippy_Response_Handler::error('Missing or invalid parameters.');
        }

        $order = wc_get_order($order_id);
        if (empty($order)) {
            return Zippy_Response_Handler::error('Order not found.');
        }

        $user_id = $order->get_user_id() ?? 0;
        $item = $order->get_item($item_id);
        if (empty($item)) {
            return Zippy_Response_Handler::error('Order item not found.');
        }

        // Set quantity
        $item->set_quantity($quantity, true);

        $product = $item->get_product();
        if (empty($product)) {
            return Zippy_Response_Handler::error('Product not found.');
        }

        $product_price = get_product_pricing_rules($product, 1, $user_id);
        if (is_null($product_price)) {
            return Zippy_Response_Handler::error('Failed to get product pricing by user.');
        }

        //Extra price
        $extra_value = get_field('extra_price', $product->get_id());

        if (isset($extra_value) && !empty($extra_value)) {
            $extra_price = floatval($extra_value) * $quantity;
            $item->update_meta_data('combo_extra_price', '$' . $extra_price);
        }

        $addon_meta = [];
        if (!empty($addons) && is_array($addons)) {
            $addon_meta = Zippy_Handle_Product_Add_On::build_addon_data($addons, $quantity, $user_id);
            self::handleUpdateOrderAddons($item, $quantity, $product, $addon_meta, $product_price, $extra_price);
        } else {
            // Set tax for simple product
            Zippy_Handle_Product_Tax::set_order_item_totals_with_wc_tax($item, $product_price, $quantity);
        }

        self::handle_free_shipping($order_id);

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

    public static function apply_coupon_to_order(WP_REST_Request $request)
    {
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

            $item_id = $order->apply_coupon($coupon_code);
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

    public static function update_order_status(WP_REST_Request $request)
    {
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

    public static function move_to_trash(WP_REST_Request $request)
    {
        $order_ids = $request->get_param('order_ids');

        if (empty($order_ids)) {
            return Zippy_Response_Handler::error('Missing order_ids.');
        }

        $trashed = [];

        foreach ($order_ids as $order_id) {
            $order = wc_get_order($order_id);

            if ($order) {
                $order->delete(false);
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

    public static function get_list_customers()
    {
        $users = get_users([
            'orderby' => 'display_name',
            'order'  => 'ASC',
        ]);

        $customers = [];

        foreach ($users as $user) {
            $customers[] = [
                'id'    => $user->ID,
                'label' => $user->display_name,
                'email' => $user->user_email,
                'roles' => $user->roles,
            ];
        }

        return Zippy_Response_Handler::success($customers);
    }

    private static function handle_free_shipping($order_id)
    {
        $new_order = wc_get_order($order_id);
        $new_order->calculate_totals();
        $new_order->save();

        Zippy_Handle_Shipping::process_free_shipping($order_id);
    }

    private static function get_products_info($items)
    {
        $products = [];
        $subtotal = 0;
        $taxTotal = 0;
        foreach ($items as $item_id => $item) {
            $akk_selected = maybe_unserialize($item->get_meta('akk_selected', true));
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

                $combo_extra_price = maybe_unserialize($item->get_meta('combo_extra_price', true));
                if (!empty($combo_extra_price)) {
                    $platter_plate  = [
                        "name" => "Platter plate",
                        "quantity" => $item->get_quantity(),
                        "price" =>  $combo_extra_price
                    ];
                    $addons[] = $platter_plate;
                }
            }


            $product = $item->get_product();
            $price_total = Zippy_Wc_Calculate_Helper::round_price_wc($item->get_subtotal());
            $tax_total = $item->get_subtotal_tax();

            $products[$item_id] = [
                'product_id'        => $product ? $product->get_id() : 0,
                'name'              => $product ? $product->get_name() : '',
                'img_url'           => $product ? wp_get_attachment_url($product->get_image_id()) : '',
                'sku'               => $product ? $product->get_sku() : '',
                'quantity'          => $item->get_quantity(),
                'addons'            => $addons,
                'price_total'       => $price_total,
                'tax_total'         => $tax_total,
                'price_per_item'    => Zippy_Wc_Calculate_Helper::round_price_wc($item->get_subtotal() / max(1, $item->get_quantity())),
                'tax_per_item'      => Zippy_Wc_Calculate_Helper::round_price_wc($item->get_subtotal_tax() / max(1, $item->get_quantity())),
                'packing_instructions' => $item->get_meta('packing_instructions', true),
                // 'min_order'         => get_post_meta($product->get_id(), '_custom_minimum_order_qty', true) ?: 0,
                'min_order'         =>  0,
            ];

            $subtotal += ($price_total + Zippy_Wc_Calculate_Helper::round_price_wc($tax_total));
        }

        $taxSubtotal = Zippy_Wc_Calculate_Helper::get_tax($subtotal);
        $subtotal = Zippy_Wc_Calculate_Helper::round_price_wc($subtotal);

        $products = self::sort_products_by_category($products);

        return [$products, $subtotal, $taxSubtotal];
    }

    private static function sort_products_by_category($products)
    {
        uasort($products, function ($a, $b) {
            $product_a = wc_get_product($a['product_id']);
            $product_b = wc_get_product($b['product_id']);
            $a_terms = wp_get_post_terms($product_a->get_id(), 'product_cat', ['orderby' => 'name']);
            $b_terms = wp_get_post_terms($product_b->get_id(), 'product_cat', ['orderby' => 'name']);

            $a_cat = !empty($a_terms) ? $a_terms[0]->name : '';
            $b_cat = !empty($b_terms) ? $b_terms[0]->name : '';

            $cmp = strcmp($a_cat, $b_cat);
            if ($cmp !== 0) {
                return $cmp;
            }
            return $product_a->get_menu_order() <=> $product_b->get_menu_order();
        });

        return $products;
    }

    private static function get_shipping_info($shipping_items)
    {
        $shipping = [];
        $total = 0;
        $tax = 0;

        foreach ($shipping_items as $ship_id => $item) {
            $amount = floatval($item->get_total());
            $taxItem = Zippy_Wc_Calculate_Helper::get_tax_by_price_exclude_tax($amount);

            $amount += $taxItem;
            $shipping[] = [
                'method'       => $item->get_name(),
                'total'        => $amount,
                'tax_shipping' => $taxItem,
            ];

            $total += $amount;
            $tax += $taxItem;
        }

        return [$shipping, $total, $tax];
    }

    private static function get_fees_info($fee_items)
    {
        $fees = [];
        $total = 0;
        $tax = 0;

        foreach ($fee_items as $fee_id => $item) {
            $amount = floatval($item->get_total());
            $taxItem = Zippy_Wc_Calculate_Helper::get_tax_by_price_exclude_tax($amount);

            $amount += $taxItem;
            $fees[] = [
                'name'     => $item->get_name(),
                'total'    => $amount,
                'tax_fee'  => $taxItem,
            ];

            $total += $amount;
            $tax += $taxItem;
        }

        return [$fees, $total, $tax];
    }

    private static function get_coupons_info($coupon_items)
    {
        $coupons = [];
        $total = 0;

        foreach ($coupon_items as $coupon_id => $item) {
            $amount = floatval($item->get_discount());
            $coupons[] = ['total' => $amount];
            $total += $amount;
        }

        return [$coupons, $total];
    }

    public static function get_admin_name_from_order(WP_REST_Request $request)
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
        if (empty($order)) {
            return Zippy_Response_Handler::error('Order not found.');
        }

        $admin_name = $order->get_meta('name_admin_created_order');
        return Zippy_Response_Handler::success([
            'admin_name' => $admin_name,
        ]);
    }
}
