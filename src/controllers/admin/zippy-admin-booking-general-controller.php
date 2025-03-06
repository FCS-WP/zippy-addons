<?php

/**
 * Admin Booking Controller
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use DateTime;
use Zippy_Booking\Utils\Zippy_Utils_Core;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();


class Zippy_Admin_Booking_General_Controller
{

  /**
   *
   * UPDATE CONFIG WORDPRESS OPTION
   *
   */

  public static function update_option_configs(WP_REST_Request $request)
  {
    // Define validation rules
    $required_fields = [
      "option_name" => ["data_type" => "array", "required" => true],
      "option_data" => ["data_type" => "array", "required" => true]
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate);
    }

    // Get parameters and sanitize
    $query_param = [
      "option_name" => array_map('sanitize_text_field', $request->get_param('option_name')),
      "option_data" => array_map('maybe_serialize', $request->get_param('option_data')) // For complex data
    ];

    if (count($query_param['option_name']) !== count($query_param['option_data'])) {
      $message = 'Option names and Option values must have the same number of items.';
      return Zippy_Response_Handler::error($message);
    }

    $status = [];
    foreach ($query_param['option_name'] as $key => $name) {
      $value = $query_param['option_data'][$key];

      $update_result = update_option($name, $value, false);
      $status[$name] = $update_result ? 'updated' : 'failed';
    }

    // Prepare response
    $response = [
      'status' => $status,
      'data' => $query_param
    ];
    $message = 'Update option successfully';

    return Zippy_Response_Handler::success($response, $message);
  }


  public static function get_option_configs(WP_REST_Request $request)
  {
    // Define validation rules
    $required_fields = [
      "option_name" => ["data_type" => "array", "required" => true],
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate);
    }

    $option_names = array_map('sanitize_text_field', $request->get_param('option_name'));

    $configurations = [];
    foreach ($option_names as $option_name) {
      $configurations[$option_name] = get_option($option_name, null); // `null` as the default value
    }

    // Prepare response
    $response = [
      'data' => $configurations,
    ];

    return Zippy_Response_Handler::success($response);
  }

  public static function signin(WP_REST_Request $request)
  {
      $username = $request->get_param('username');
      $password = $request->get_param('password');

      if (empty($username) || empty($password)) {
          return new Zippy_Response_Handler('Thiếu tên người dùng hoặc mật khẩu.', 400);
      }

      $creds = array(
          'user_login'    => $username,
          'user_password' => $password,
          'remember'      => true,
      );

      $user = wp_signon($creds, false);

      $status = true;

      if (is_wp_error($user)) {
          $status = false;

          $response = [
              'status' => $status,
              'data'   => $user->get_error_message() 
          ];

          return Zippy_Response_Handler::success($response);
      }

      $response = [
          'status' => $status,
          'data'   => [
              'ID'        => $user->ID,
              'email'     => $user->user_email,
          ]
      ];

      return Zippy_Response_Handler::success($response);
  }

  public static function register(WP_REST_Request $request)
  {
      $user_email = $request->get_param('email');
      $user_password = $request->get_param('password');

      if (empty($user_email) || empty($user_password)) {
          return Zippy_Response_Handler::error('Email or password cannot be blank.', 400);
      }

      if (!is_email($user_email)) {
          return Zippy_Response_Handler::error('Invalid email.', 400);
      }

      if (email_exists($user_email)) {
          return Zippy_Response_Handler::error('Email already exists.', 400);
      }

      try {
          $user_login = $user_email;

          $user_id = wp_create_user($user_login, $user_password, $user_email);

          if (is_wp_error($user_id)) {
              return Zippy_Response_Handler::error($user_id->get_error_message(), 400);
          }

          $user = get_userdata($user_id);

          $response = [
              'status' => true,
              'data'   => [
                  'email' => $user->user_email,
                  'id'    => $user->ID,
              ],
          ];

          return Zippy_Response_Handler::success($response);
      } catch (Exception $e) {
          return Zippy_Response_Handler::error('An error occurred while registering: ' . $e->getMessage(), 500);
      }
  }



  /**
   * Generates a booking report based on the provided date range.
   *
   * @param WP_REST_Request $request The REST API request object.
   * @return WP_REST_Response JSON response containing the booking report data.
   */

  public static function booking_report(WP_REST_Request $request)
  {
    // Define validation rules
    $required_fields = [
      "start-date" => ["data_type" => "date", "required" => true],
      "end-date" => ["data_type" => "date", "required" => true],
      "range" => ["data_type" => "string", "required" => false],

    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate);
    }

    $query_param = [
      "start-date" => sanitize_text_field($request->get_param('start-date')),
      "end-date" => sanitize_text_field($request->get_param('end-date')),
      "range" =>  $request->get_param('range') ? sanitize_text_field($request->get_param('range')) : 'day'
    ];

    $results = self::get_bookings($query_param);
    $status = self::get_status($query_param);

    if ($results === false || $status === false) {
      return Zippy_Response_Handler::error('Error retrieving data from the database.');
    }

    $total_revenue = 0;

    $total_bookings = 0;

    $average = 0;

    foreach ($results as $row) {

      $total_revenue += $row->total_revenue;

      $total_bookings += $row->total_bookings;

      $labels[] = date("j M Y", strtotime($row->booking_start_date));
    }

    foreach ($status as $entry) {
      $status = self::convertToCamelCase($entry->status);
      $count = (int)$entry->status_count;

      if (isset($statusCounts[$status])) {
        // Increment the booking total for the existing status
        $statusCounts[$status]['booking_total'] += $count;
      } else {
        // Initialize the array with booking_total and booking_type
        $statusCounts[$status] = [
          'booking_total' => $count,
          'booking_type' =>   $status
        ];
      }
    }

    $currency = get_woocommerce_currency_symbol(get_option('woocommerce_currency'));

    if (count($results) > 0) {
      $average = number_format($total_revenue / count($results), 2) . ' ' . $currency;
    } else {
      $average = '0.00 ' . $currency;
    }

    $response = [
      'overview' => [
        'average_revenue_per_day' => $average,
        'total_bookings' => $total_bookings,
        'total_revenue' => $total_revenue,
      ],
      'dataset' => $results,
      'labels' => $labels,
      'status_breakdown' => $statusCounts,
    ];

    return Zippy_Response_Handler::success($response);
  }

  private static function get_bookings($query_param)
  {
    global $wpdb;
    return $wpdb->get_results(
      $wpdb->prepare(
        "SELECT
            fdb.booking_start_date,
            COUNT(fdb.id) AS total_bookings,
            SUM(wco.total_amount) AS total_revenue
        FROM
            {$wpdb->prefix}bookings fdb
        LEFT JOIN
            {$wpdb->prefix}wc_orders wco
        ON
            fdb.order_id = wco.id
            AND fdb.user_id = wco.customer_id
        WHERE
            fdb.booking_start_date >= %s
            AND fdb.booking_start_date <= %s
        GROUP BY
            fdb.booking_start_date
        ORDER BY
            fdb.booking_start_date",
        $query_param['start-date'],
        $query_param['end-date']
      )
    );
  }

  private static function get_status($query_param)
  {
    global $wpdb;
    return $wpdb->get_results(
      $wpdb->prepare(
        "SELECT
            fdb.booking_start_date,
            wco.status,
            COUNT(wco.status) AS status_count
        FROM
            {$wpdb->prefix}bookings fdb
        LEFT JOIN
            {$wpdb->prefix}wc_orders wco
        ON
            fdb.order_id = wco.id
            AND fdb.user_id = wco.customer_id
        WHERE
            fdb.booking_start_date >= %s
            AND fdb.booking_start_date <= %s
        GROUP BY
            fdb.booking_start_date,
            wco.status
        ORDER BY
            fdb.booking_start_date,
            wco.status",
        $query_param['start-date'],
        $query_param['end-date']
      )
    );
  }
  private static function convertToCamelCase($key, $prefix = "wc-")
  {
    // Remove the prefix
    $cleanedKey = str_replace($prefix, "", $key);

    // Convert to camelCase
    $parts = explode("-", $cleanedKey);
    return lcfirst(implode("", array_map("ucfirst", $parts)));
  }
}
