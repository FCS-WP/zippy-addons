<?php

namespace Zippy_Booking\Src\Controllers\Menu;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();

class Zippy_Menu_Controller
{
  /**
   * GET MENUS
   */
  public static function get_menus(WP_REST_Request $request)
  {
    // Define validation rules
    $required_fields = [
      "id" => ["data_type" => "number", "required" => false],
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate);
    }

    try {
      global $wpdb;
      $table_name = $wpdb->prefix . 'zippy_menus';
      $menu_id = $request['id'];

      // Build query with optional menu_id filtering
      if (!empty($menu_id)) {
        $query = $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $menu_id);
        $menus = $wpdb->get_results($query);

        if (empty($menus)) {
          return Zippy_Response_Handler::error("Menu with ID $menu_id does not exist!");
        }
      } else {
        $query = "SELECT * FROM $table_name";
        $menus = $wpdb->get_results($query);

        if (empty($menus)) {
          return Zippy_Response_Handler::error("No menus found!");
        }
      }

      return Zippy_Response_Handler::success($menus, "Menus retrieved successfully");
    } catch (\Throwable $th) {
      $message = $th->getMessage();
      Zippy_Log_Action::log('get_menu', json_encode($request->get_params()), 'Failure', $message);
      return Zippy_Response_Handler::error("An error occurred while fetching menus.");
    }
  }


  /**
   * SET MENU
   */
  public static function set_menu(WP_REST_Request $request)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_menus';

    // Define validation rules
    $required_fields = [
      "name"         => ["data_type" => "string", "required" => true],
      "start_date"   => ["data_type" => "date", "required" => true],
      "end_date"     => ["data_type" => "date", "required" => true],
      "days_of_week" => ["data_type" => "string", "required" => true],
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    try {
      // Sanitize and format input values
      $name         = sanitize_text_field($request['name']);
      $start_date   = sanitize_text_field($request['start_date']);
      $end_date     = sanitize_text_field($request['end_date']);
      $days_of_week = implode(',', array_map('intval', (array) $request['days_of_week']));

      // Check if the name already exists
      $existing_menu = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE name = %s", $name));

      if ($existing_menu > 0) {
        return Zippy_Response_Handler::error("The menu name '$name' already exists. Please choose a different name.", 400);
      }

      $wpdb->query('START TRANSACTION');

      // Insert into the database
      $inserted = $wpdb->insert(
        $table_name,
        [
          'name'         => $name,
          'start_date'   => $start_date,
          'end_date'     => $end_date,
          'days_of_week' => $days_of_week,
          'created_at'   => current_time('mysql')
        ],
        ['%s', '%s', '%s', '%s', '%s']
      );

      if ($inserted === false) {
        throw new Exception("Database insert failed: " . $wpdb->last_error);
      }

      $insert_id = $wpdb->insert_id;
      $wpdb->query('COMMIT');

      return Zippy_Response_Handler::success($insert_id, "Menu created successfully.");
    } catch (Exception $e) {
      $wpdb->query('ROLLBACK');

      $error_message = $e->getMessage();
      Zippy_Log_Action::log('set_menu', json_encode($request->get_params()), 'Failure', $error_message);

      return Zippy_Response_Handler::error("An error occurred while creating the menu. Please try again.", 500);
    }
  }
}
