<?php

namespace Zippy_Booking\Src\Controllers\Products;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;
use Zippy_Booking\Src\Services\Zippy_Handle_Product_Add_On;

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
      'keyword' => sanitize_text_field($request['keyword']),
      'limit' => isset($request['limit']) ? max(1, min(100, intval($request['limit']))) : 10
    ];
  }

  private static function sanitize_product_checking($request)
  {
    return [
      'product_id' => sanitize_text_field($request['product_id']),
      'outlet_id' => sanitize_text_field($request['outlet_id']),
      'current_date' => sanitize_text_field($request['current_date']),
    ];
  }

  private static function check_outlet_exists($outlet_id)
  {
    global $wpdb;
    return (bool) $wpdb->get_var($wpdb->prepare("SELECT COUNT(ID) FROM {$wpdb->prefix}zippy_addons_outlet WHERE id = %s", $outlet_id));
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


  private static function get_active_week_days($jsonString)
  {
    // Decode the JSON string into an array
    $data = json_decode($jsonString);

    if (!$data || !is_array($data) || !isset($data[0]->operating_hours)) {
      return [];
    }

    $operating_hours = $data[0]->operating_hours;
    $active_days = [];

    foreach ($operating_hours as $day) {
      if (!empty($day->open_at)) {
        $active_days[] = array(
          'weekday' => $day->week_day,
          'is_available' => 1
        );
      }
    }
    $response = array(
      'days_of_week' => $active_days,
      'closed_dates' => $data[0]->closed_dates
    );

    return $response;
  }

  private static function get_outlet_operating_date($outlet_id)
  {
    global $wpdb;

    $result = $wpdb->get_results($wpdb->prepare("SELECT operating_hours, closed_dates FROM {$wpdb->prefix}zippy_addons_outlet WHERE id = %s", $outlet_id));

    foreach ($result as $key => $value) {
      $unserialze_fields = [
        "operating_hours",
        "closed_dates",
      ];
      foreach ($unserialze_fields as $field) {
        $result[$key]->{$field} = maybe_unserialize($result[$key]->{$field});
      }
    }

    return json_encode($result);
  }

  private static function get_menus_product_belong_to($product_id, $current_date)
  {
    global $wpdb;

    // Check for overlapping time ranges
    $query = $wpdb->prepare(
      "SELECT m.name, m.start_date, m.end_date, m.days_of_week, m.happy_hours
      FROM `{$wpdb->prefix}zippy_menu_products` as pm 
      LEFT JOIN {$wpdb->prefix}zippy_menus as m ON pm.id_menu = m.id 
      WHERE pm.id_product = %s AND (m.end_date >= %s OR m.end_date IS NULL)
      ORDER BY pm.id_menu",
      $product_id,
      $current_date
    );

    $menu = $wpdb->get_results($query);

    if (empty($menu)) return;
    // // Decode JSON field
    foreach ($menu as $menu_row) {
      $menu_row->days_of_week = !empty($menu_row->days_of_week) ? json_decode($menu_row->days_of_week, true) : [];
      $menu_row->happy_hours = !empty($menu_row->happy_hours) ? json_decode($menu_row->happy_hours, true) : [];
    }

    return $menu;
  }

  /**
   * SEARCH PRODUCTS
   */
  public static function search_products(WP_REST_Request $request)
  {
    global $wpdb;

    // Validate Request
    if ($error = self::validate_request([
      "keyword" => ["data_type" => "string", "required" => true],
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
              p.id,
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
          LIMIT %d
      ", '%' . $wpdb->esc_like($data['keyword']) . '%', $data['limit'])
      );
    });

    // Return Response
    return is_string($result)
      ? Zippy_Response_Handler::error($result, 500)
      : Zippy_Response_Handler::success($result, "Products retrieved successfully.");
  }

  /**
   *  PRODUCTS PLANNING
   */

  public static function product_checking(WP_REST_Request $request)
  {
    global $wpdb;

    // Validate Request
    if ($error = self::validate_request([
      "product_id" => ["data_type" => "number", "required" => true],
      "outlet_id" => ["data_type" => "string", "required" => true],
      "current_date" => ["data_type" => "date", "required" => true],
    ], $request)) {
      return $error;
    }

    $response = array();

    // Sanitize Input
    $data = self::sanitize_product_checking($request);
    if (!self::check_outlet_exists($data['outlet_id'])) {
      return Zippy_Response_Handler::error("Outlet not found.", 404);
    }

    //Step 1 : Check Date Include in Store Available Time or not

    $operation_time = self::get_outlet_operating_date($data['outlet_id']);

    $store_available = self::get_active_week_days($operation_time);

    //Step 2 : Product ID include Which Menu -> Active Time ?

    $menus = self::get_menus_product_belong_to($data['product_id'], $data['current_date']);

    $period_window = get_field('product_period_window', $data['product_id']) ?? 2;

    $response = array(
      'store_operation' => $store_available,
      'menus_operation' => $menus,
      'period_window' => intval($period_window)
    );

    //Step 3: Return the time Available
    return empty($response)
      ? Zippy_Response_Handler::error($response, 500)
      : Zippy_Response_Handler::success($response, "Products retrieved successfully.");
  }

  /**
   *  PRODUCTS
   */

  public static function get_products(WP_REST_Request $request)
  {
    try {
      // Validate Request
      if ($error = self::validate_request([
        "page" => ["data_type" => "number", "required" => true],
        "items" => ["data_type" => "number", "required" => true],
        "search" => ["data_type" => "string", "required" => false],
        "category" => ["data_type" => "number", "required" => false],
      ], $request)) {
        return $error;
      }

      $category = !empty($request['category']);
      $args = self::sanitize_products($request);
      $page = max(1, intval($request['page']));
      $per_page = 50;

      [$products, $total, $max_pages] = self::sort_and_paginate_products($args, $category, $page, $per_page);

      // Build data
      $data = [];
      foreach ($products as $product) {
        $is_composite_product = is_composite_product($product);

        $list_sub_products = get_field('product_combo', $product->get_id());
        // $min_addons        = get_field('min_order', $product->get_id()) ?: 0;
        $min_addons        =  0;
        // $min_order         = get_post_meta($product->get_id(), '_custom_minimum_order_qty', true) ?: 0;
        $min_order         = 0;
        $groups            = get_field('products_group', $product->get_id()) ?: [];
        $grouped_addons    = Zippy_Handle_Product_Add_On::get_grouped_addons($groups);

        $addons_rules = $product->get_type() == 'variable'
          ? self::get_variable_product($product)
          : Zippy_Handle_Product_Add_On::get_list_addons(
            $list_sub_products,
            $is_composite_product,
            $grouped_addons,
            $product
          );

        $data[] = [
          'id'    => $product->get_id(),
          'sku'   => $product->get_sku(),
          'name'  => $product->get_name(),
          'stock' => $product->get_stock_quantity(),
          'img_url' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
          'type'  => $product->get_type(),
          'link'  => admin_url('post.php?post=' . $product->get_id() . '&action=edit'),
          'min_addons' => $min_addons,
          'min_order'  => $min_order,
          'addons'     => $addons_rules,
          'grouped_addons' => $grouped_addons,
          'is_composite_product' => $is_composite_product,
        ];
      }

      $response = [
        'data' => $data,
        'pagination' => [
          'total' => $total,
          'max_num_pages' => $max_pages,
          'page'  => $page,
          'per_page' => $per_page,
        ],
      ];

      return empty($data)
        ? Zippy_Response_Handler::error($data, 500)
        : Zippy_Response_Handler::success($response, "Products retrieved successfully.");
    } catch (\Exception $e) {
      return Zippy_Response_Handler::error('Empty products', 500);
    }
  }

  private static function get_variable_product($product)
  {
    $addons_rules = [];
    $available_variations = $product->get_available_variations();

    foreach ($available_variations as $variation) {
      $variation_id = $variation['variation_id'];

      $addons_rules[] = [
        'id'    => $variation_id,
        'name' => html_entity_decode(get_the_title($variation_id), ENT_QUOTES, 'UTF-8'),
        'sku'   => $variation['sku'],
        'image' => wp_get_attachment_image_url($variation['image_id'], 'thumbnail'),
        'min'   => 0,
        'max'   => null,
      ];
    }

    return $addons_rules;
  }

  private static function sort_and_paginate_products($args, $has_category, $page, $per_page)
  {
    if ($has_category) {
      $results = wc_get_products($args);
      if (empty($results) || empty($results->products)) {
        return [[], 0, 0];
      }

      $products  = Zippy_Booking_Helper::sort_products_by_category($results->products);
      $total     = $results->total;
      $max_pages = $results->max_num_pages;
    } else {
      $args['limit']    = -1;
      $args['paginate'] = false;

      $all_products = wc_get_products($args);
      if (empty($all_products)) {
        return [[], 0, 0];
      }

      $all_products = Zippy_Booking_Helper::sort_products_by_category($all_products);

      $total     = count($all_products);
      $max_pages = ceil($total / $per_page);
      $offset    = ($page - 1) * $per_page;
      $products  = array_slice($all_products, $offset, $per_page);
    }

    return [$products, $total, $max_pages];
  }

  public static function get_product(WP_REST_Request $request)
  {
    try {
      // Validate Request
      if ($error = self::validate_request([
        "productID" => ["data_type" => "number", "required" => true],

      ], $request)) {
        return $error;
      }

      $results = wc_get_product(intval($request['productID']));


      if (empty($results)) return Zippy_Response_Handler::error('No products found. ', 500);

      $is_composite_product = is_composite_product($results);

      $list_sub_products = get_field('product_combo', $results->get_id());
      $min_addons         = 0;
      // $min_addons         = get_field('min_order', $results->get_id()) ?: 0;
      // $min_order         = get_post_meta($results->get_id(), '_custom_minimum_order_qty', true) ?: 0;
      $min_order         =  0;
      $groups            = get_field('products_group', $results->get_id()) ?: [];
      $grouped_addons    = Zippy_Handle_Product_Add_On::get_grouped_addons($groups);
      $minMaxOptions     = get_field('min_max_options', $results->get_id());
      // $comboExtraPrice   = get_field('extra_price', $results->get_id());

      if ($results->get_type() == 'variable') {
        $addons_rules = self::get_variable_product($results);
      } else {
        $addons_rules = Zippy_Handle_Product_Add_On::get_list_addons($list_sub_products, $is_composite_product, $grouped_addons, $results);
      }

      $product_data = array(
        'id'    => $results->get_id(),
        'sku'    => $results->get_sku(),
        'name'  => $results->get_name(),
        'stock'  => $results->get_stock_quantity(),
        'type'  => $results->get_type(),
        'link'  => admin_url('post.php?post=' . $results->get_id() . '&action=edit'),
        'min_addons'    => $min_addons,
        'min_order'    => $min_order,
        'addons' => $addons_rules,
        'grouped_addons' => $grouped_addons,
        'is_composite_product' => $is_composite_product,
        'min_max_options' => $minMaxOptions,
        // 'combo_extra_price' => $comboExtraPrice
      );


      return empty($product_data)
        ? Zippy_Response_Handler::error($product_data, 500)
        : Zippy_Response_Handler::success($product_data, "Products retrieved successfully.");
    } catch (\Exception $e) {
      return Zippy_Response_Handler::error('Empty products', 500);
    }
  }

  /**
   *  CATEGORIES
   */

  public static function get_categories(WP_REST_Request $request)
  {
    try {
      if ($error = self::validate_request([
        "category_id" => ["data_type" => "number", "required" => false],
      ], $request)) {
        return $error;
      }

      $args = self::sanitize_categories($request);

      $results = get_categories($args);

      if (empty($results) || is_wp_error($results)) {
        return Zippy_Response_Handler::error('No categories found.', 500);
      }

      $excluded_tag = ['add-ons'];
      $data = [];

      foreach ($results as $category) {
        $products = wc_get_products([
          'status'    => 'publish',
          'limit'     => -1,
          'category'  => [$category->slug],
          'tax_query' => [
            'relation' => 'AND',
            [
              'taxonomy' => 'product_tag',
              'field'    => 'slug',
              'terms'    => $excluded_tag,
              'operator' => 'NOT IN',
            ],
            [
              'taxonomy' => 'product_visibility',
              'field'    => 'name',
              'terms'    => ['exclude-from-catalog'],
              'operator' => 'NOT IN',
            ],
          ],
        ]);

        $category->count = count($products);
        $data[] = $category;
      }

      return empty($data)
        ? Zippy_Response_Handler::error($data, 500)
        : Zippy_Response_Handler::success($data, "Products categories retrieved successfully.");
    } catch (\Exception $e) {
      return Zippy_Response_Handler::error('Empty categories', 500);
    }
  }


  private static function sanitize_products($request)
  {
    $excluded = [15, 23]; // ['uncategorized', 'add-ons']
    $excluded_tag = ['add-ons'];
    $args = [
      'status'   => 'publish',
      'paginate' => true,
      'order'    => 'asc',
      'orderby'  => 'menu_order',
      'tax_query' => [
        'relation' => 'AND',
        [
          'taxonomy' => 'product_cat',
          'field'    => 'term_id',
          'terms'    => $excluded,
          'operator' => 'NOT IN',
        ],
        [
          'taxonomy' => 'product_tag',
          'field'    => 'slug',
          'terms'    => $excluded_tag,
          'operator' => 'NOT IN',
        ],
        [
          'taxonomy' => 'product_visibility',
          'field'    => 'name',
          'terms'    => ['exclude-from-catalog'],
          'operator' => 'NOT IN',
        ],
      ],
    ];

    if (!empty($request['category'])) {
      $args['limit'] = 20;
      $args['paginate'] = true;
      $args['product_category_id'] = [intval($request['category'])];
      $args['page'] = max(1, intval($request['page']));
    } else {
      $args['limit'] = -1;
      $args['paginate'] = false;
    }

    if (!empty($request['search'])) {
      $args['s'] = sanitize_text_field($request['search']);
    }

    return $args;
  }

  private static function sanitize_categories($request)
  {

    $excluded = [15, 23]; // ['uncategorized', 'add-ons']

    return [
      'taxonomy'     => 'product_cat',
      'category' => intval($request['category']) ?? [],
      'status'   => 'publish',
      "limit" => -1,
      'orderby' => 'name',
      'hide_empty'   => true,
      'show_count'   => 1, // 1 for yes, 0 for no
      'hierarchical' => 1,
      'exclude' => $excluded
    ];
  }
}
