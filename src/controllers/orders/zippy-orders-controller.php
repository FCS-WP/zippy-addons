<?php

namespace Zippy_Booking\Src\Controllers\Orders;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Dompdf\Dompdf;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;

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
            'status' => 'completed',
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

            $billing_date = get_post_meta($order->get_id(), '_billing_date', true);

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
}
