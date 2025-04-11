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
          return new Zippy_Response_Handler('Missing username or password.', 400);
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
      $confirm_password = $request->get_param('confirm_password');
      $first_name = sanitize_text_field($request['first_name']);
      $last_name  = sanitize_text_field($request['last_name']);

      if (empty($user_email) || empty($user_password)) {
          return Zippy_Response_Handler::error('Email or password cannot be blank.', 400);
      }

      if ($confirm_password !== $user_password) {
        return Zippy_Response_Handler::error('Confirm password does not match!', 400);
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
          $update = wp_update_user([
              'ID'         => $user_id,
              'first_name' => $first_name,
              'last_name'  => $last_name,
          ]);
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

}
