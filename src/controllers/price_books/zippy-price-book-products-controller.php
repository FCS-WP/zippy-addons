<?php

namespace Zippy_Booking\Src\Controllers\Price_Books;

use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;
use WP_REST_Request;

class Zippy_Price_Book_Products_Controller
{

  public static function get_products(WP_REST_Request $request)
  {
    try {
      // Validate Request
      if ($error = self::validate_request([
        "search" => ["data_type" => "string", "required" => false],
        "category" => ["data_type" => "number", "required" => false],
      ], $request)) {
        return $error;
      }

      $args = self::sanitize_products($request);

      $products = wc_get_products($args);

      $results  = Zippy_Booking_Helper::sort_products_by_category($products);

      // Build data
      $data = [];

      foreach ($results as $product) {

        $data[] = [
          'id'    => $product->get_id(),
          'sku'   => $product->get_sku(),
          'name'  => $product->get_name(),
          'stock' => $product->get_stock_quantity(),
          'img_url' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
          'type'  => $product->get_type(),
          'link'  => admin_url('post.php?post=' . $product->get_id() . '&action=edit'),
        ];
      }

      return empty($data)
        ? Zippy_Response_Handler::error($data, 500)
        : Zippy_Response_Handler::success($data, "Products retrieved successfully.");
    } catch (\Exception $e) {
      return Zippy_Response_Handler::error('Empty products', 500);
    }
  }

  private static function validate_request($required_fields, WP_REST_Request $request)
  {
    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    return empty($validate) ? null : Zippy_Response_Handler::error($validate, 400);
  }
  private static function sanitize_products($request)
  {
    $excluded_tag = [];

    $args = [
      'status'   => 'publish',
      'paginate' => false,
      'limit' => 100,
      'order'    => 'asc',
      'orderby'  => 'menu_order',
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

    ];

    if (!empty($request['category'])) {
      $args['product_category_id'] = [intval($request['category'])];
    }

    if (!empty($request['search'])) {
      $args['s'] = sanitize_text_field($request['search']);
    }

    return $args;
  }
}
