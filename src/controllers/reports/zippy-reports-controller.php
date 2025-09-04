<?php

namespace Zippy_Booking\Src\Controllers\Reports;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Dompdf\Dompdf;
use Dompdf\Options;

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
    if ($file_type == 'csv') {
      $file_content = self::generate_csv($order_rows, $product_summary, $fulfilment_date);
    } else {
      $file_content = self::generate_pdf($order_rows, $product_summary, $fulfilment_date);
    }

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
      'meta_query'   => [
        [
          'key'     => BILLING_DATE,
          'value'   => $date,
          'compare' => '=',
        ],
        [
          'key'     => BILLING_TIME,
        ],
      ],
      'orderby'      => 'meta_value',
      'meta_key'     => BILLING_TIME,
      'order'        => 'ASC',
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
    $total  = $item->get_total();
    $tax_total  = $item->get_total_tax();

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
      'time'           => self::format_time_slot($order->get_meta(BILLING_TIME)),
      'item'           => $name,
      'quantity'       => $qty,
      'total_price' => html_entity_decode(strip_tags(wc_price($total + $tax_total))),
      'payment_status' =>  $order->get_transaction_id() ? 'Paid' : 'Pending Payment'
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
        $total_addon  =  html_entity_decode(strip_tags(wc_price($add_on_product->get_price())));

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
          'total_price' => $total_addon,
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
    fputcsv($output, ['Order Number', 'Phone', 'Mode', 'Time', 'Items', 'Quantity', 'Total $','Payment Status'], ',');

    $current_order_id = null;
    foreach ($order_rows as $row) {
      if ($row['order_number'] !== $current_order_id) {
        fputcsv($output, [$row['order_number'], $row['phone'], $row['mode'], $row['time'], $row['item'], $row['quantity'], $row['total_price'], $row['payment_status']], ',');
        $current_order_id = $row['order_number'];
      } else {
        fputcsv($output, ['', '', '', '', $row['item'], $row['quantity'], $row['total_price']], ',');
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


  private static function generate_pdf($order_rows, $product_summary, $fulfilment_date)
  {

    $options = new Options();
    $options->set('isHtml5ParserEnabled', true);
    $options->set('isRemoteEnabled', true);
    $dompdf = new Dompdf($options);

    // Start building HTML content
    $html = '<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h2 { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>';

    // Table 1: Orders
    $html .= '<h2>Fulfilment Date: ' . esc_html($fulfilment_date) . '</h2>';
    $html .= '<table>
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Phone</th>
                    <th>Mode</th>
                    <th>Time</th>
                    <th>Items</th>
                    <th>Quantity</th>
                    <th>Total $</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>';

    $current_order_id = null;
    foreach ($order_rows as $row) {
      if ($row['order_number'] !== $current_order_id) {
        $html .= '<tr>
                        <td>' . esc_html($row['order_number']) . '</td>
                        <td>' . esc_html($row['phone']) . '</td>
                        <td>' . esc_html($row['mode']) . '</td>
                        <td>' . esc_html($row['time']) . '</td>
                        <td>' . esc_html($row['item']) . '</td>
                        <td>' . esc_html($row['quantity']) . '</td>
                        <td>' . esc_html($row['total_price']) . '</td>
                        <td>' . esc_html($row['payment_status']) . '</td>
                      </tr>';
        $current_order_id = $row['order_number'];
      } else {
        $html .= '<tr>
                        <td></td><td></td><td></td><td></td>
                        <td>' . esc_html($row['item']) . '</td>
                        <td>' . esc_html($row['quantity']) . '</td>
                        <td>' . esc_html($row['total_price']) . '</td>
                        <td></td>
                      </tr>';
      }
    }

    $html .= '</tbody></table>';

    // Table 2: Product Summary
    $html .= '<h2>Summary</h2>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>';

    foreach ($product_summary as $product => $qty) {
      $html .= '<tr>
                    <td>' . esc_html($product) . '</td>
                    <td>' . esc_html($qty) . '</td>
                  </tr>';
    }

    $html .= '</tbody></table>';

    $html .= '</body></html>';

    $dompdf->loadHtml($html);

    $dompdf->setPaper('A4', 'portrait');

    // Render PDF
    $dompdf->render();

    return $dompdf->output();
  }

  private static function format_time_slot($slot)
  {
    return  preg_replace('/^From\s+/i', '', $slot);
  }
}
