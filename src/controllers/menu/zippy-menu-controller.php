<?php

namespace Zippy_Booking\Src\Controllers\Menu;

use Exception;
use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();

class Zippy_Menu_Controller
{
  private static function validate_request($required_fields, WP_REST_Request $request)
  {
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    return empty($validate) ? null : Zippy_Response_Handler::error($validate, 400);
  }

  private static function check_menu_exists($menu_id)
  {
    global $wpdb;
    return (bool) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}zippy_menus WHERE id = %d", $menu_id));
  }

  private static function sanitize_menu_data($request)
  {
    return [
      'id' => intval($request['id']),
      'name' => sanitize_text_field($request['name']),
      'start_date' => sanitize_text_field($request['start_date']),
      'end_date' => sanitize_text_field($request['end_date']),
      'happy_hours' => json_encode($request['happy_hours']),
      'days_of_week' => json_encode($request['days_of_week'])
    ];
  }

  private static function execute_db_transaction($query_fn)
  {
    global $wpdb;
    try {
      $wpdb->query('START TRANSACTION');
      $result = $query_fn();
      if ($result === false) {
        throw new \Exception("Database operation failed: " . $wpdb->last_error);
      }
      $wpdb->query('COMMIT');
      return $result;
    } catch (\Exception $e) {
      $wpdb->query('ROLLBACK');
      return $e->getMessage();
    }
  }

  private static function check_overlap_menu_time_ranges($data)
  {
    global $wpdb;

    // Check for overlapping time ranges
    $overlap_query = $wpdb->prepare(
      "SELECT COUNT(*) FROM {$wpdb->prefix}zippy_menus 
          WHERE (id <> %d) AND (%s BETWEEN start_date AND end_date OR %s BETWEEN start_date AND end_date OR 
                 start_date BETWEEN %s AND %s OR end_date BETWEEN %s AND %s)",
      $data['id'],
      $data['start_date'],
      $data['end_date'],
      $data['start_date'],
      $data['end_date'],
      $data['start_date'],
      $data['end_date']
    );

    return $wpdb->get_var($overlap_query);
  }

  public static function set_menu(WP_REST_Request $request)
  {
    global $wpdb;

    if ($error = self::validate_request([
      "name"       => ["data_type" => "string", "required" => true],
      "start_date" => ["data_type" => "date", "required" => false],
      "end_date"   => ["data_type" => "date", "required" => false],
      "days_of_week" => ["data_type" => "array", "required" => false],
    ], $request)) {
      return $error;
    }

    $data = self::sanitize_menu_data($request);

    // Check if the menu name already exists
    if ($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}zippy_menus WHERE name = %s", $data['name']))) {
      return Zippy_Response_Handler::error("The menu name '{$data['name']}' already exists.", 400);
    }

    // Proceed with inserting the menu
    $result = self::execute_db_transaction(function () use ($wpdb, $data) {
      return $wpdb->insert(
        "{$wpdb->prefix}zippy_menus",
        array_merge($data, ['created_at' => current_time('mysql')]),
        ['%s', '%s', '%s', '%s', '%s']
      );
    });

    return is_string($result)
      ? Zippy_Response_Handler::error($result, 500)
      : Zippy_Response_Handler::success($wpdb->insert_id, "Menu created successfully.");
  }

  public static function get_menus(WP_REST_Request $request)
  {
    if ($error = self::validate_request(["id" => ["data_type" => "number", "required" => false]], $request)) {
      return $error;
    }

    global $wpdb;
    $menu_id = (int) $request['id'];
    $query = $menu_id
      ? $wpdb->prepare("SELECT * FROM {$wpdb->prefix}zippy_menus WHERE id = %d", $menu_id)
      : "SELECT * FROM {$wpdb->prefix}zippy_menus";

    $menus = $wpdb->get_results($query);

    // // Decode JSON field
    foreach ($menus as &$menu) {
      $menu->days_of_week = !empty($menu->days_of_week) ? json_decode($menu->days_of_week, true) : [];
      $menu->happy_hours = !empty($menu->happy_hours) ? json_decode($menu->happy_hours, true) : [];
    }

    return empty($menus)
      ? Zippy_Response_Handler::error("No menus found!")
      : Zippy_Response_Handler::success($menus, "Menus retrieved successfully");
  }

  public static function update_menu(WP_REST_Request $request)
  {
    global $wpdb;
    if ($error = self::validate_request([
      "id" => ["data_type" => "number", "required" => true],
      "name" => ["data_type" => "string", "required" => true],
      "start_date" => ["data_type" => "date", "required" => true],
      "happy_hours" => ["data_type" => "array", "required" => false],
      "end_date" => ["data_type" => "date", "required" => true],
      "days_of_week" => ["data_type" => "array", "required" => true],
    ], $request)) {
      return $error;
    }

    $id = intval($request['id']);
    if (!self::check_menu_exists($id)) {
      return Zippy_Response_Handler::error("Menu not found.", 404);
    }

    $data = self::sanitize_menu_data($request);


    if ($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}zippy_menus WHERE name = %s AND id != %d", $data['name'], $id))) {
      return Zippy_Response_Handler::error("The menu name '{$data['name']}' already exists.", 400);
    }

    $overlapping_menus = self::check_overlap_menu_time_ranges($data);

    if ($overlapping_menus > 0) {
      return Zippy_Response_Handler::error("The menu dates overlap with an existing menu.", 400);
    }

    $result = self::execute_db_transaction(function () use ($wpdb, $data, $id) {
      return $wpdb->update(
        "{$wpdb->prefix}zippy_menus",
        array_merge($data, ['updated_at' => current_time('mysql')]),
        ['id' => $id],
        ['%s', '%s', '%s', '%s', '%s', '%s'],
        ['%d']
      );
    });

    return is_string($result)
      ? Zippy_Response_Handler::error($result, 500)
      : Zippy_Response_Handler::success($id, "Menu updated successfully.");
  }

  public static function delete_items(WP_REST_Request $request)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_menus';

    $required_fields = [
      "ids" => ["required" => true, "data_type" => "array"],
    ];

    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    try {
      $ids = array_map('intval', $request->get_param('ids'));
      $ids_placeholder = implode(',', array_fill(0, count($ids), '%d'));

      $query = $wpdb->prepare("DELETE FROM $table_name WHERE id IN ($ids_placeholder)", ...$ids);

      $result = self::execute_db_transaction(fn() => $wpdb->query($query));

      return is_string($result)
        ? Zippy_Response_Handler::error($result, 500)
        : Zippy_Response_Handler::success($ids, "Menus has been deleted.");
    } catch (\Exception $e) {
      $error_message = $e->getMessage();
      Zippy_Log_Action::log('create_menu', json_encode($request->get_params()), 'Failure', $error_message);

      return Zippy_Response_Handler::error("An error occurred while delete the menu. Please try again.", 500);
    }
  }
}
