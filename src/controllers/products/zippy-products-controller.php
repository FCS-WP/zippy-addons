<?php

namespace Zippy_Booking\Src\Controllers\Products;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;

defined('ABSPATH') or die();

class Zippy_Products_Controller
{

  private static function validate_request($required_fields, WP_REST_Request $request)
  {
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    return empty($validate) ? null : Zippy_Response_Handler::error($validate, 400);
  }

  private static function sanitize_key_word($request)
  {
    return [
      'key_word' => sanitize_text_field($request['key_word']),
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

  /**
   * SEARCH PRODUCTS
   */
  public static function search_product(WP_REST_Request $request)
  {
    global $wpdb;

    // Validate Request
    if ($error = self::validate_request([
      "key_word" => ["data_type" => "string", "required" => true],
    ], $request)) {
      return $error;
    }

    // Sanitize Input
    $data = self::sanitize_key_word($request);

    // Execute Database Query
    $result = self::execute_db_transaction(function () use ($wpdb, $data) {
      return $wpdb->get_results(
        $wpdb->prepare("
          SELECT
              p.ID,
              p.post_title AS name,
              t.term_id AS category_id,
              t.name AS category_name
          FROM {$wpdb->prefix}posts p
          LEFT JOIN {$wpdb->prefix}term_relationships tr ON p.ID = tr.object_id
          LEFT JOIN {$wpdb->prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
          LEFT JOIN {$wpdb->prefix}terms t ON tt.term_id = t.term_id
          WHERE p.post_title LIKE %s
          AND p.post_type = 'product'
          AND tt.taxonomy = 'product_cat'
        ", '%' . $wpdb->esc_like($data['key_word']) . '%')
      );
    });

    // Return Response
    return is_string($result)
      ? Zippy_Response_Handler::error($result, 500)
      : Zippy_Response_Handler::success($result, "Products retrieved successfully.");
  }
}
