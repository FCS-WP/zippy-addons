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
   * @param array $data Array containing name, role, startDate, endDate.
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
}
