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
      "days_of_week" => ["data_type" => "array", "required" => true],
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

  /**
   * GET PRODUCTS IN MENU
   */
  public static function get_products_in_menu(WP_REST_Request $request)
  {
    global $wpdb;
    $menu_table = $wpdb->prefix . 'zippy_menus';
    $product_menu_table = $wpdb->prefix . 'zippy_menu_products';

    // Define validation rules
    $required_fields = [
      "id_menu" => ["data_type" => "number", "required" => true],
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    try {
      // Sanitize and format input values
      $menu_id = sanitize_text_field($request['id_menu']);

      // Check if the menu exists (FIXED)
      $existing_menu = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $menu_table WHERE id = %d", $menu_id));

      if ($existing_menu == 0) { // FIX: Return error if the menu does NOT exist
        return Zippy_Response_Handler::error("The menu ID '$menu_id' does not exist.", 404);
      }

      // Fetch products in the menu
      $query = $wpdb->prepare(
        "SELECT id, id_product, created_at FROM $product_menu_table WHERE id_menu = %d",
        $menu_id
      );

      $products = $wpdb->get_results($query);

      return Zippy_Response_Handler::success($products, "Products retrieved successfully.");
    } catch (Exception $e) {

      $error_message = $e->getMessage();
      Zippy_Log_Action::log('get_products_in_menu', json_encode($request->get_params()), 'Failure', $error_message);

      return Zippy_Response_Handler::error("An error occurred while retrieving the products. Please try again.", 500);
    }
  }

  /**
   * ADD PRODUCT TO MENU
   */
  public static function add_products_to_menu(WP_REST_Request $request)
  {
    global $wpdb;
    $menu_table = $wpdb->prefix . 'zippy_menus';
    $product_menu_table = $wpdb->prefix . 'zippy_menu_products';

    // Define validation rules
    $required_fields = [
      "id_menu"    => ["data_type" => "number", "required" => true],
      "id_product" => ["data_type" => "number", "required" => true],
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    try {
      // Sanitize input values
      $menu_id = sanitize_text_field($request['id_menu']);
      $product_id = sanitize_text_field($request['id_product']);

      // Check if the menu exists
      $existing_menu = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $menu_table WHERE id = %d", $menu_id));
      if ($existing_menu == 0) {
        return Zippy_Response_Handler::error("The menu ID '$menu_id' does not exist.", 404);
      }

      // Check if the product is already in the menu
      $existing_product = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $product_menu_table WHERE id_menu = %d AND id_product = %d",
        $menu_id,
        $product_id
      ));

      if ($existing_product > 0) {
        return Zippy_Response_Handler::error("The product ID '$product_id' is already in menu '$menu_id'.", 400);
      }

      // Insert product into menu
      $inserted = $wpdb->insert(
        $product_menu_table,
        [
          'id_menu'    => $menu_id,
          'id_product' => $product_id,
          'created_at' => current_time('mysql')
        ],
        ['%d', '%d', '%s']
      );

      if ($inserted) {
        return Zippy_Response_Handler::success(null, "Product added to menu successfully.");
      } else {
        return Zippy_Response_Handler::error("Failed to add product to menu.", 500);
      }
    } catch (Exception $e) {

      $error_message = $e->getMessage();
      Zippy_Log_Action::log('add_product_to_menu', json_encode($request->get_params()), 'Failure', $error_message);

      return Zippy_Response_Handler::error("An error occurred while adding the product. Please try again.", 500);
    }
  }
  /**
   * REMOVE PRODUCT FROM MENU
   */
  public static function remove_product_from_menu(WP_REST_Request $request)
  {
    global $wpdb;
    $product_menu_table = $wpdb->prefix . 'zippy_menu_products';

    // Define validation rules
    $required_fields = [
      "id_menu"      => ["data_type" => "number", "required" => true],
      "id_products"  => ["data_type" => "array", "required" => true], // Accepts an array of product IDs
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    try {
      $menu_id = sanitize_text_field($request['id_menu']);
      $product_ids = array_map('sanitize_text_field', $request['id_products']); // Sanitize all product IDs

      if (empty($product_ids)) {
        return Zippy_Response_Handler::error("No products provided for removal.", 400);
      }

      $product_ids_placeholder = implode(',', array_fill(0, count($product_ids), '%d'));

      // Check if the products exist in the menu
      $existing_products = $wpdb->get_col($wpdb->prepare(
        "SELECT id_product FROM $product_menu_table WHERE id_menu = %d AND id_product IN ($product_ids_placeholder)",
        array_merge([$menu_id], $product_ids)
      ));

      if (empty($existing_products)) {
        return Zippy_Response_Handler::error("None of the provided products exist in menu '$menu_id'.", 404);
      }

      $deleted = $wpdb->query($wpdb->prepare(
        "DELETE FROM $product_menu_table WHERE id_menu = %d AND id_product IN ($product_ids_placeholder)",
        array_merge([$menu_id], $product_ids)
      ));

      if ($deleted) {
        return Zippy_Response_Handler::success(null, "Selected products removed from menu successfully.");
      } else {
        return Zippy_Response_Handler::error("Failed to remove products from menu.", 500);
      }
    } catch (Exception $e) {

      $error_message = $e->getMessage();
      Zippy_Log_Action::log('remove_products_from_menu', json_encode($request->get_params()), 'Failure', $error_message);

      return Zippy_Response_Handler::error("An error occurred while removing the products. Please try again.", 500);
    }
  }
}
