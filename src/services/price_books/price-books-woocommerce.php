<?php

namespace Zippy_Booking\Src\Services\Price_Books;

use Zippy_Booking\Src\Services\Price_Books\Price_Books_Helper;

class Price_Books_Woocommerce
{
  protected $active_rules = null;


  protected $current_pricebook_data = null;


  /**
   * Gets the active pricing rules applicable to the current user's role.
   * Fetches and caches the data on the first call per request.
   * @return array Array of rules (e.g., [product_id => rule_data, ...]).
   */
  protected function get_active_rules_for_current_user()
  {
    if ($this->active_rules !== null) {
      return $this->active_rules;
    }

    $user_id = get_current_user_id();
    if (! $user_id) {
      // Not logged in
      $current_role = 'customer';
    } else {
      $user = get_userdata($user_id);

      if (! empty($user->roles)) {
        // Get first role
        $current_role = array_values($user->roles)[0];
        // If admin, treat as customer
        if ($current_role === 'administrator') {
          $current_role = 'customer';
        }
      } else {
        // Fallback role
        $current_role = 'customer';
      }
    }

    $this->current_pricebook_data = $this->get_active_price_book_id_by_role($current_role);
    if (! $this->current_pricebook_data) {
      $this->active_rules = [];
      return $this->active_rules;
    }

    $rules_list = $this->get_all_rules_by_price_book_id($this->current_pricebook_data);

    // Cache the results
    $this->active_rules = $rules_list;
    return $this->active_rules;
  }

  public function get_price_book_pricing($product)
  {
    $original_price = floatval($product->get_regular_price());

    $product_id = $product->get_id();

    $rules = $this->get_active_rules_for_current_user();

    if (! isset($rules[$product_id])) {
      return $original_price; // No rule for this product
    }

    $rule = $rules[$product_id];

    $new_price = $this->calculate_discounted_price($original_price, $rule);

    // Ensure price is not negative
    return max(0, round($new_price, wc_get_price_decimals()));
  }

  public function apply_custom_pricing($price, $product)
  {
    if (did_action('woocommerce_product_get_price') > 1) {
      return $price;
    }

    $product_id = $product->get_id();
    $rules = $this->get_active_rules_for_current_user();
    if (! isset($rules[$product_id])) {
      return $price; // No rule for this product
    }

    $rule = $rules[$product_id];
    $original_price = floatval($product->get_regular_price());

    $new_price = $this->calculate_discounted_price($original_price, $rule);

    // Ensure price is not negative
    return max(0, round($new_price, wc_get_price_decimals()));
  }

  public function control_product_visibility($is_visible, $product_id)
  {
    // Force trigger the cache fetch
    $rules = $this->get_active_rules_for_current_user();
    if (empty($this->current_pricebook_data)) {
      return $is_visible;
    }

    $is_exclusive = (bool)$this->current_pricebook_data['is_exclusive'];

    if ($is_exclusive) {
      return isset($rules[$product_id]);
    }

    if (isset($rules[$product_id]) && $rules[$product_id]['visibility'] === 'hide') {
      return false;
    }

    return $is_visible;
  }

  /**
   * Filters the WooCommerce product query to hide products based on the Price Book visibility rules.
   * This hook runs on product archive pages (shop, categories, search).
   *
   * @param array $meta_query The existing meta query array.
   * @param object $query The WP_Query object.
   * @return array The modified meta query array.
   */
  public function filter_search_results($meta_query, $query)
  {
    if (is_admin() || ! ($query instanceof \WP_Query)) {
      return $meta_query;
    }
    // Only apply this filter to the main product query on the frontend
    if (is_admin() || ! $query->is_main_query()) {
      return $meta_query;
    }

    $rules = $this->get_active_rules_for_current_user();

    if (empty($rules)) {
      return $meta_query;
    }

    $hidden_product_ids = [];
    foreach ($rules as $product_id => $rule) {
      if (isset($rule['visibility']) && $rule['visibility'] === 'hide') {
        $hidden_product_ids[] = intval($product_id);
      }
    }

    if (empty($hidden_product_ids)) {
      return $meta_query;
    }

    $existing_exclusions = $query->get('post__not_in');
    if (! is_array($existing_exclusions)) {
      $existing_exclusions = [];
    }

    // Merge our hidden IDs with any existing exclusions
    $new_exclusions = array_merge($existing_exclusions, $hidden_product_ids);

    // Set the modified array back to the query
    $query->set('post__not_in', $new_exclusions);

    return $meta_query;
  }

  /**
   * Finds the ID of the single active price book for the given user role and current date.
   * * @param string $role_slug The user role slug (e.g., 'customer', 'wholesale').
   * @return int|null The active Price Book ID or null if none is found.
   */
  protected function get_active_price_book_id_by_role($role_slug)
  {
    global $wpdb;
    $containers_table = $wpdb->prefix . PRICEBOOK_TABLE;
    $date = Price_Books_Helper::get_pricebook_date();
    $query = $wpdb->prepare(
      "SELECT id, is_exclusive, start_date, end_date FROM {$containers_table} 
             WHERE (role_id = %s OR role_id = 'all') 
             AND status = 'active' AND deleted_at IS NULL
             AND start_date <= %s AND (end_date >= %s OR end_date IS NULL)
             ORDER BY CASE WHEN role_id = %s THEN 1 ELSE 2 END ASC, start_date DESC LIMIT 1",
      $role_slug,
      $date,
      $date,
      $role_slug
    );
    // Later enhancement
    // "ORDER BY
    //     CASE WHEN role_id = %s THEN 1 ELSE 2 END ASC,
    //     priority DESC,
    //     id DESC"

    $pricebook_data = $wpdb->get_row($query, ARRAY_A);
    return is_array($pricebook_data) ? $pricebook_data : null;
  }

  /**
   * Fetches all rules for a given Price Book ID and formats them for quick lookup.
   * * @param int $price_book_id The ID of the container Price Book.
   * @return array Rules list keyed by product_id: [product_id => rule_data, ...].
   */
  protected function get_all_rules_by_price_book_id($price_book_id)
  {
    global $wpdb;
    $rules_table = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;

    if (! $price_book_id) {
      return [];
    }

    $query = $wpdb->prepare(
      "SELECT product_id, price_value, price_type, visibility
            FROM {$rules_table}
            WHERE pricebook_id = %d
            ",
      $price_book_id["id"],
    );

    $rules_data = $wpdb->get_results($query, ARRAY_A);

    if (empty($rules_data)) {
      return [];
    }

    $formatted_rules = [];
    foreach ($rules_data as $rule) {
      $formatted_rules[intval($rule['product_id'])] = $rule;
    }

    return $formatted_rules;
  }

  /**
   * Calculates the new price after applying a pricing rule.
   *
   * @param float $original_price The base price of the item.
   * @param array $rule           The pricing rule array, including 'price_type' and 'rule_value'.
   * @return float The calculated new price.
   */
  public function calculate_discounted_price(float $original_price, array $rule): float
  {

    $new_price = $original_price;
    $rule_value = (float) $rule['price_value'];

    switch ($rule['price_type']) {
      case 'fixed':
        // Override with a fixed price
        $new_price = $rule_value;
        break;
      case 'percent_off':
        // Apply percentage discount
        $discount_amount = $original_price * ($rule_value / 100);
        $new_price = $original_price - $discount_amount;
        break;
      case 'fixed_off':
        // Apply fixed amount discount
        $new_price = $original_price - $rule_value;
        break;
      default:
        // Handle unknown type or no discount
        break;
    }
    return max(0, $new_price);
  }

  public function handle_flatsome_exclusive_visibility($is_visible, $product_id)
  {
    $helper = new Price_Books_Helper();

    $rules = $helper->get_active_rules_for_current_user();
    $is_exclusive_mode = $helper->is_exclusive_mode();

    if ($is_exclusive_mode) {
      return isset($rules[$product_id]);
    }

    // Check if the product belongs to a restricted category
    if ($helper->is_product_restricted($product_id)) {
      return false;
    }

    return $is_visible;
  }
}
