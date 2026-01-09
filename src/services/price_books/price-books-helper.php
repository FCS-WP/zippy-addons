<?php

namespace Zippy_Booking\Src\Services\Price_Books;

use Zippy_Booking\Src\Services\Zippy_Datetime_Helper;
use Zippy_Booking\Src\Woocommerce\Admin\Zippy_Woo_Manual_Order;
use DateTimeZone;
use DateTime;

/**
 * Price_Books_Helper
 *
 *
 */
class Price_Books_Helper
{

  // Static cache to store rules during a single page load
  protected static $user_rules_cache = null;
  protected static $current_pricebook_data = null;
  /**
   * Retrieves the final price for a given product and user.
   * @return string                     The calculated price.
   */
  public static function get_pricebook_date($date = null)
  {
    $timezone = new DateTimeZone('Asia/Singapore');
    $now      = !empty($date) ?  new DateTime($date, $timezone) : new DateTime('now', $timezone);

    // Default fallback (today at 00:00:00)
    $default_date = $now->format('Y-m-d 00:00:00');

    if (
      isset($_GET['order_id'], $_GET['action']) &&
      $_GET['action'] === Zippy_Woo_Manual_Order::ACTION_ADMIN_EDIT_ORDER
    ) {
      $order = wc_get_order((int) $_GET['order_id']);

      if ($order) {
        $billing_date = $order->get_meta(BILLING_DATE);

        if (!empty($billing_date)) {
          return (new DateTime($billing_date, $timezone))
            ->format('Y-m-d 00:00:00');
        }
      }

      return $default_date;
    }


    if (!empty(WC()->session)) {
      $session_date = WC()->session->get('date');

      if (!empty($session_date)) {
        return (new DateTime($session_date, $timezone))
          ->format('Y-m-d 00:00:00');
      }
    }

    return $default_date;
  }

  /**
   * Get the active Price Book Rules for a specific user.
   * * @param string|null $date Specific date to check (Y-m-d H:i:s). Defaults to now.
   * @param int|null $user_id User ID to check. Defaults to current user.
   * @return array Array of product rules indexed by product_id.
   */
  public function get_active_rules_for_current_user($date = null, $user_id = null,  $target_date = null)
  {
    if (self::$user_rules_cache !== null && $user_id === null) {
      return self::$user_rules_cache;
    }
    $date = self::get_pricebook_date($date);
    global $wpdb;
    $user_id = $user_id ? $user_id : get_current_user_id();
    $user = get_userdata($user_id);
    $role_slug = ($user && !empty($user->roles)) ? array_values($user->roles)[0] : '';
    $query_date = $date ? $date : current_time('mysql');

    $containers_table = $wpdb->prefix . PRICEBOOK_TABLE;
    $relations_table  = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;

    $pricebook = $wpdb->get_row($wpdb->prepare(
      "SELECT id, is_exclusive, start_date, end_date FROM {$containers_table} 
             WHERE (role_id = %s OR role_id = 'all') 
             AND status = 'active' AND deleted_at IS NULL
             AND start_date <= %s AND (end_date >= %s OR end_date IS NULL)
             ORDER BY CASE WHEN role_id = %s THEN 1 ELSE 2 END ASC, start_date DESC LIMIT 1",
      $role_slug,
      $query_date,
      $query_date,
      $role_slug
    ), ARRAY_A);


    if (!$pricebook) {
      self::$user_rules_cache = [];
      return [];
    }

    self::$current_pricebook_data = $pricebook;

    $results = $wpdb->get_results($wpdb->prepare(
      "SELECT product_id, price_value, price_type, visibility
             FROM {$relations_table}
             WHERE pricebook_id = %d AND deleted_at IS NULL",
      $pricebook['id']
    ), ARRAY_A);

    $formatted_rules = [];
    foreach ($results as $row) {
      $formatted_rules[$row['product_id']] = $row;
    }

    self::$user_rules_cache = $formatted_rules;

    return $formatted_rules;
  }

  /**
   * Apply the math logic to convert original price to Price Book price.
   */
  public function apply_rule_to_price($original_price, $rule)
  {
    $value = (float) $rule['price_value'];
    $final_price = (float) $original_price;

    switch ($rule['price_type']) {
      case 'fixed':
        $final_price = $value;
        break;
      case 'percent_off':
        $final_price = $original_price * (1 - ($value / 100));
        break;
      case 'fixed_off':
        $final_price = $original_price - $value;
        break;
    }
    return max(0, $final_price); // Ensure price is never negative
  }

  /**
   * Check if the current user is restricted to an exclusive catalog.
   */
  public function is_exclusive_mode()
  {
    if (self::$user_rules_cache === null) {
      $this->get_active_rules_for_current_user();
    }
    return (self::$current_pricebook_data && self::$current_pricebook_data['is_exclusive'] == 1);
  }

  public function get_preorder_price_info($product_id, $target_date = null)
  {
    $query_date =  self::get_pricebook_date($target_date);
    $rules = $this->get_active_rules_for_current_user($target_date);
    if (!isset($rules[$product_id])) {
      return null;
    }

    $product = wc_get_product($product_id);
    $original_price = (float)$product->get_regular_price();
    $new_price = $this->apply_rule_to_price($original_price, $rules[$product_id]);

    if ($original_price == $new_price) {
      return null;
    }

    return [
      'old_price'  => wc_price($original_price),
      'new_price'  => wc_price($new_price),
      'price_book' => self::$current_pricebook_data
    ];
  }

  /**
   * Check if a product belongs to a restricted category.
   */
  public function is_product_restricted($product_id)
  {
    $restricted_categories = ['combo-6', 'ala-carte-menu', 'festive-menu'];

    return has_term($restricted_categories, 'product_cat', $product_id);
  }
}
