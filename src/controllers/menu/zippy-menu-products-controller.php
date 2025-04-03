<?php

namespace Zippy_Booking\Src\Controllers\Menu;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();

class Zippy_Menu_Products_Controller
{
  private $table_name = 'zippy_menu_products';

  private static function validate_request($required_fields, WP_REST_Request $request)
  {
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    return empty($validate) ? null : Zippy_Response_Handler::error($validate, 400);
  }

  private static function check_menu_exists($id)
  {
    global $wpdb;
    return (bool) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}zippy_menus WHERE id = %d", $id));
  }

  private static function check_product_exists($menu_id)
  {
    global $wpdb;
    return (bool) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}zippy_menu_products WHERE id_menu = %d", $menu_id));
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

  /**
   * GET PRODUCTS IN MENU
   */
  public static function get_products_in_menu(WP_REST_Request $request)
  {
    global $wpdb;
    $product_menu_table = $wpdb->prefix . 'zippy_menu_products';

    if ($error = self::validate_request([
      "menu_id" => ["data_type" => "number", "required" => true],
    ], $request)) {
      return $error;
    }

    try {
      // Sanitize and format input values
      $menu_id = sanitize_text_field($request['menu_id']);

      if (!self::check_menu_exists($menu_id)) {
        return Zippy_Response_Handler::error("Menu not found.", 404);
      }

      if (!self::check_product_exists($menu_id)) {
        return Zippy_Response_Handler::error("Don't have product in this menu.", 404);
      }

      // Fetch products in the menu
      $query = $wpdb->prepare(
        "SELECT pm.id_product as id, 
                p.post_title as name, 
                GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') as categories
         FROM {$wpdb->prefix}zippy_menu_products as pm
         LEFT JOIN {$wpdb->prefix}posts as p ON pm.id_product = p.ID
         LEFT JOIN {$wpdb->prefix}term_relationships as tr ON p.ID = tr.object_id
         LEFT JOIN {$wpdb->prefix}term_taxonomy as tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'product_cat'
         LEFT JOIN {$wpdb->prefix}terms as t ON tt.term_id = t.term_id
         WHERE pm.id_menu = %d
         AND p.post_type = 'product'
         GROUP BY pm.id_product
         ORDER BY MIN(t.name) ASC;",
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
   * ADD PRODUCTS TO MENU
   */
  public static function add_products_to_menu(WP_REST_Request $request)
  {
    global $wpdb;
    $product_menu_table = $wpdb->prefix . 'zippy_menu_products';

    $required_fields = [
      "menu_id" => ["data_type" => "number", "required" => true],
      "product_ids" => ["data_type" => "array", "required" => true],
    ];

    if ($error = self::validate_request($required_fields, $request)) {
      return $error;
    }

    $menu_id = (int) $request['menu_id'];
    $product_ids = array_map('intval', $request['product_ids']);

    if (!self::check_menu_exists($menu_id)) {
      return Zippy_Response_Handler::error("Menu not found.", 404);
    }

    $result = self::execute_db_transaction(function () use ($wpdb, $product_menu_table, $menu_id, $product_ids) {
      if (empty($product_ids)) {
        return false;
      }

      $values = [];
      $placeholders = [];
      foreach ($product_ids as $product_id) {
        $placeholders[] = "(%d, %d, %s)";
        $values[] = $menu_id;
        $values[] = $product_id;
        $values[] = current_time('mysql');
      }

      $query = "INSERT INTO $product_menu_table (id_menu, id_product, created_at) VALUES " . implode(',', $placeholders);
      return $wpdb->query($wpdb->prepare($query, ...$values));
    });

    return is_string($result)
      ? Zippy_Response_Handler::error($result, 500)
      : Zippy_Response_Handler::success(null, "Products added to menu successfully.");
  }


  /**
   * REMOVE PRODUCTS FROM MENU
   */
  public static function remove_products_from_menu(WP_REST_Request $request)
  {
    global $wpdb;
    $product_menu_table = $wpdb->prefix . 'zippy_menu_products';

    // Define validation rules
    $required_fields = [
      "menu_id"      => ["data_type" => "number", "required" => true],
      "product_ids"  => ["data_type" => "array", "required" => true],
    ];

    // Validate request fields
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    $menu_id = sanitize_text_field($request['menu_id']);
    $product_ids = array_map('intval', $request->get_param('product_ids'));
    $product_ids_placeholder = implode(',', array_fill(0, count($product_ids), '%d'));

    if (empty($product_ids)) {
      return Zippy_Response_Handler::error("No products provided for removal.", 400);
    }

    // Check if the products exist in the menu
    $existing_products = $wpdb->get_col($wpdb->prepare(
      "SELECT id_product FROM $product_menu_table WHERE id_menu = %d AND id_product IN ($product_ids_placeholder)",
      array_merge([$menu_id], $product_ids)
    ));

    if (empty($existing_products)) {
      return Zippy_Response_Handler::error("None of the provided products exist in menu '$menu_id'.", 404);
    }

    $query = $wpdb->prepare("DELETE FROM $product_menu_table WHERE id_menu = %d AND id_product IN ($product_ids_placeholder)", $menu_id, ...$product_ids);
    $result = self::execute_db_transaction(fn() => $wpdb->query($query));

    return is_string($result)
      ? Zippy_Response_Handler::error("Failed to remove products from menu.", 500)
      : Zippy_Response_Handler::success(null, "Selected products removed from menu successfully.");
  }
}
