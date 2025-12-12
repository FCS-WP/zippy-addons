<?php

namespace Zippy_Booking\Src\Services\Price_Books;

use Zippy_Booking\Utils\Zippy_DateTime_Helper;

class Price_Books_Service
{
  public static function get_pricebooks()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'pricebook_containers';

    $pricebooks = $wpdb->get_results("SELECT * FROM {$table_name} ORDER BY id DESC", ARRAY_A);

    if ($pricebooks === null) {
      return [];
    }

    $formatted_pricebooks = array_map(function ($book) {
      $book['start_date'] = $book['start_date'] ? date('c', strtotime($book['start_date'])) : null;
      $book['end_date']   = $book['end_date'] ? date('c', strtotime($book['end_date'])) : null;
      return $book;
    }, $pricebooks);

    return $formatted_pricebooks;
  }

  /**
   * Inserts a new Price Book container into the database.
   * @param array $data Array containing name, role, start_date, end_date.
   * @return int|bool The new ID on success, or false on failure.
   */
  public static function create_pricebook(array $data)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'pricebook_containers';

    $insert_data = array(
      'name'          => sanitize_text_field($data['name']),
      'role_id'       => sanitize_key($data['role']),
      'start_date'    => ! empty($data['start_date']) ? Zippy_DateTime_Helper::parse_iso_to_mysql($data['start_date']) : null,
      'end_date'      => ! empty($data['end_date']) ? Zippy_DateTime_Helper::parse_iso_to_mysql($data['end_date']) : null,
      'status'        => 'active',
    );

    $formats = array('%s', '%s', '%s', '%s', '%s');

    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
      return false;
    }

    return $wpdb->insert_id;
  }
  /**
   * Retrieves a single Price Book container by ID.
   * @param int $id
   */
  public static function get_pricebook_by_id(int $id)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'pricebook_containers';

    $book = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", $id), ARRAY_A);

    if ($book) {
      $book['start_date'] = $book['start_date'] ? date('c', strtotime($book['start_date'])) : null;
      $book['end_date']   = $book['end_date'] ? date('c', strtotime($book['end_date'])) : null;
      return $book;
    }

    return null;
  }
  /**
   * Update pricebook
   *
   */

  public static function update_pricebook(int $id, array $data)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'pricebook_containers';

    // Prepare data for updating
    $update_data = array(
      'name'          => sanitize_text_field($data['name']),
      'role_id'       => sanitize_key($data['role']),
      'start_date'    => Zippy_DateTime_Helper::parse_iso_to_mysql($data['start_date']),
      'end_date'      => Zippy_DateTime_Helper::parse_iso_to_mysql($data['end_date']),
      'status'        => sanitize_key($data['status']), // Assuming status can also be updated
    );

    $formats = array('%s', '%s', '%s', '%s', '%s');
    $where_format = array('%d');

    $result = $wpdb->update(
      $table_name,
      $update_data,
      array('id' => $id),
      $formats,
      $where_format
    );

    return $result !== false;
  }

  /**
   * Inserts a new Product Rule into the database.
   * @param int $pricebook_id The parent Price Book ID.
   * @param array $data
   * @return int|bool
   */
  public static function create_product_rule(int $pricebook_id, array $data)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'pricebook_product_relations';

    $price_value = (float) $data['priceValue'];

    $insert_data = array(
      'pricebook_id'  => $pricebook_id,
      'product_id'    => (int) $data['productId'],
      'price_type'    => sanitize_key($data['priceType']),
      'price_value'   => $price_value,
      'visibility'    => sanitize_key($data['visibility']),
    );

    $formats = array('%d', '%d', '%s', '%f', '%s');

    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
      return false;
    }

    return $wpdb->insert_id;
  }

  /**
   * Retrieves all Product Rules for a given Price Book ID.
   * NOTE: This requires joining with WooCommerce product tables (wp_posts) to get the product name.
   * @param int $pricebook_id The ID of the parent Price Book.
   * @return array|null List of product rules, or empty array/null if none found.
   */
  public static function get_product_rules(int $pricebook_id)
  {
    global $wpdb;
    $rules_table = $wpdb->prefix . 'pricebook_product_relations';
    $posts_table = $wpdb->prefix . 'posts';

    // SQL query to join the rules table with the WooCommerce product table (wp_posts)
    $sql = $wpdb->prepare(
      "SELECT 
              r.id AS rule_id, 
              r.product_id, 
              r.price_type, 
              r.price_value, 
              r.visibility, 
              p.post_title AS product_name
          FROM {$rules_table} r
          LEFT JOIN {$posts_table} p ON r.product_id = p.ID
          WHERE r.pricebook_id = %d
          ORDER BY p.post_title ASC",
      $pricebook_id
    );

    $rules = $wpdb->get_results($sql, ARRAY_A);

    return $rules ?: [];
  }

  /**
   * Deletes a specific Product Rule by its rule ID.
   * @param int $rule_id The ID of the rule to delete.
   * @return int|bool Number of rows deleted (1) on success, or false on failure.
   */
  public static function delete_product_rule(int $rule_id)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'pricebook_product_relations';

    // Use $wpdb->delete for safe deletion
    $result = $wpdb->delete(
      $table_name,
      array('id' => $rule_id), // WHERE clause
      array('%d') // Format for WHERE clause
    );

    // $wpdb->delete returns the number of rows deleted (0 or 1) or false on error
    return $result !== false;
  }
}
