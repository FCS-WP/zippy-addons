<?php

namespace Zippy_Booking\Src\Services\Price_Books;

use Zippy_Booking\Utils\Zippy_DateTime_Helper;

use WP_Error;
use DateTimeZone;
use DateTime;

class Price_Books_Service
{

  public static function get_pricebooks()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . PRICEBOOK_TABLE;

    $pricebooks = $wpdb->get_results("SELECT * FROM {$table_name} WHERE deleted_at IS NULL ORDER BY name ASC", ARRAY_A);

    if ($pricebooks === null) {
      return [];
    }
    $timezone = new DateTimeZone('Asia/Singapore');
    $datetime = new DateTime('now', $timezone);

    $today_timestamp = $datetime->getTimestamp();

    $formatted_pricebooks = array_map(function ($book) use ($today_timestamp) {

      $start_date_raw = $book['start_date'];
      $end_date_raw   = $book['end_date'];

      $book['start_date'] = $start_date_raw ? date('c', strtotime($start_date_raw)) : null;
      $book['end_date']   = $end_date_raw ? date('c', strtotime($end_date_raw)) : null;
      $status =  $book['status'];

      $start_timestamp = $start_date_raw ? strtotime($start_date_raw) : null;
      $end_timestamp = $end_date_raw ? strtotime($end_date_raw) : PHP_INT_MAX;

      $status_label = 'Expired';

      if ($status == 'active') {
        if ($start_timestamp && $start_timestamp > $today_timestamp) {
          $status_label = 'Upcoming';
        } elseif ($today_timestamp >= $start_timestamp && $today_timestamp <= $end_timestamp) {
          $status_label = 'Ongoing';
        }
      } else {
        $status_label = 'Disabled';
      }

      $book['status_label'] = $status_label;

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
    $table_name = $wpdb->prefix . PRICEBOOK_TABLE;

    $insert_data = array(
      'name'          => sanitize_text_field($data['name']),
      'role_id'       => sanitize_key($data['role']),
      'start_date'    => ! empty($data['start_date']) ? Zippy_DateTime_Helper::parse_iso_to_mysql($data['start_date']) : null,
      'end_date'      => ! empty($data['end_date']) ? Zippy_DateTime_Helper::parse_iso_to_mysql($data['end_date']) : null,
      'status'        => 'active',
      'is_exclusive'  => empty(sanitize_text_field($data['is_exclusive'])) ? 0 : 1,
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
    $table_name = $wpdb->prefix . PRICEBOOK_TABLE;

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
    $table_name = $wpdb->prefix . PRICEBOOK_TABLE;

    // Prepare data for updating
    $update_data = array(
      'name'          => sanitize_text_field($data['name']),
      'role_id'       => sanitize_key($data['role']),
      'start_date'    => Zippy_DateTime_Helper::parse_iso_to_mysql($data['start_date']),
      'end_date'      => Zippy_DateTime_Helper::parse_iso_to_mysql($data['end_date']),
      'status'        => sanitize_key($data['status']), // Assuming status can also be updated
      'is_exclusive'  => empty(sanitize_text_field($data['is_exclusive'])) ? 0 : 1,
    );

    $formats = array('%s', '%s', '%s', '%s', '%s', '%s');
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
   * Delete a pricebook
   *
   */
  public static function delete_pricebook($id)
  {
    global $wpdb;
    $container_table = $wpdb->prefix . PRICEBOOK_TABLE;
    $relations_table = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;
    $now = current_time('mysql');

    $wpdb->query("START TRANSACTION");

    try {
      $wpdb->update(
        $container_table,
        ['deleted_at' => $now, 'status' => 'inactive'], // Also mark inactive for safety
        ['id' => $id],
        ['%s', '%s'],
        ['%d']
      );

      // 2. Soft delete all related product rules
      $wpdb->update(
        $relations_table,
        ['deleted_at' => $now],
        ['pricebook_id' => $id],
        ['%s'],
        ['%d']
      );

      $wpdb->query("COMMIT");
      return true;
    } catch (Exception $e) {
      $wpdb->query("ROLLBACK");
      return false;
    }
  }

  /**
   * Get pricebook Today
   *
   */

  public static function get_todays_active_pricebooks()
  {
    global $wpdb;
    $table = $wpdb->prefix . PRICEBOOK_TABLE;

    $datetime = new DateTime('now', new DateTimeZone('Asia/Singapore'));
    $today = $datetime->format('Y-m-d H:i:s');

    $query = $wpdb->prepare("
        SELECT id, name, role_id, is_exclusive, start_date, end_date
        FROM $table
        WHERE status = 'active'
          AND deleted_at IS NULL
          AND start_date <= %s
          AND (end_date >= %s OR end_date IS NULL)
        ORDER BY
            priority DESC,
            start_date DESC,
            id DESC
    ", $today, $today);

    $results = $wpdb->get_results($query);

    return $results;
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
    $table_name = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;

    $price_value = (float) $data['price_value'];

    $insert_data = array(
      'pricebook_id'  => $pricebook_id,
      'product_id'    => (int) $data['product_id'],
      'price_type'    => sanitize_key($data['price_type']),
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
    $rules_table = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;
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
   * Updates an existing product pricing rule.
   */
  public static function update_product_rule($pricebook_id, $rule_id, $data)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;

    $update_data = [];
    $format = [];

    if (isset($data['product_id'])) {
      $update_data['product_id'] = sanitize_text_field($data['product_id']);
      $format[] = '%s';
    }

    if (isset($data['price_type'])) {
      $update_data['price_type'] = sanitize_text_field($data['price_type']);
      $format[] = '%s';
    }

    if (isset($data['price_value'])) {
      $update_data['price_value'] = floatval($data['price_value']);
      $format[] = '%f';
    }

    if (isset($data['visibility'])) {
      $update_data['visibility'] = sanitize_text_field($data['visibility']);
      $format[] = '%s';
    }

    if (empty($update_data)) {
      return new WP_Error('no_data', 'No valid data provided for update.');
    }

    $updated = $wpdb->update(
      $table_name,
      $update_data,
      [
        'id' => intval($rule_id),
        'pricebook_id' => intval($pricebook_id) // Security check
      ],
      $format,
      ['%d', '%d']
    );

    if ($updated === false) {
      // Database error
      return new WP_Error('db_error', 'Failed to update rule: ' . $wpdb->last_error);
    }

    return true;
  }

  /**
   * Deletes a specific Product Rule by its rule ID.
   * @param int $rule_id The ID of the rule to delete.
   * @return int|bool Number of rows deleted (1) on success, or false on failure.
   */
  public static function delete_product_rule(int $rule_id)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;

    // Use $wpdb->delete for safe deletion
    $result = $wpdb->delete(
      $table_name,
      array('id' => $rule_id), // WHERE clause
      array('%d') // Format for WHERE clause
    );

    // $wpdb->delete returns the number of rows deleted (0 or 1) or false on error
    return $result !== false;
  }

  /**
   * Bulk import Product Rule.
   */
  public static function bulk_import_product_rules($pricebook_id, $file_path)
  {
    global $wpdb;
    $table = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;

    if (!file_exists($file_path) || !is_readable($file_path)) {
      return false;
    }

    $handle = fopen($file_path, 'r');
    fgetcsv($handle); // Skip header

    $imported = 0;
    $skipped  = [];
    $wpdb->query("START TRANSACTION");

    try {
      while (($row = fgetcsv($handle)) !== FALSE) {
        $sku = sanitize_text_field($row[0]);
        if (empty($sku)) continue;

        $product_id = wc_get_product_id_by_sku($sku);

        if (!$product_id) {
          $skipped[] = $sku;
          continue;
        }

        $wpdb->query($wpdb->prepare(
          "INSERT INTO $table (pricebook_id, product_id, price_type, price_value, visibility)
                 VALUES (%d, %d, %s, %f, %s)
                 ON DUPLICATE KEY UPDATE 
                    price_type = VALUES(price_type), 
                    price_value = VALUES(price_value), 
                    visibility = VALUES(visibility),
                    deleted_at = NULL",
          $pricebook_id,
          $product_id,
          sanitize_text_field($row[1]),
          floatval($row[2]),
          sanitize_text_field($row[3] ?? 'show')
        ));
        $imported++;
      }
      $wpdb->query("COMMIT");
      fclose($handle);

      return [
        'imported' => $imported,
        'skipped'  => $skipped,
        'total'    => $imported + count($skipped)
      ];
    } catch (\Exception $e) {
      $wpdb->query("ROLLBACK");
      fclose($handle);
      return false;
    }
  }
}
