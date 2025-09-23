<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models\Products;

defined('ABSPATH') or die();

use WP_REST_Response;
use Zippy_Booking\App\Models\Zippy_Request_Validation;

class Zippy_Products_Model
{

  public static function search_products_args()
  {
    return array(
      'keyword' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
    );
  }
  public static function product_checking_args()
  {
    return array(
      'outlet_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'product_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        },
      ),
      'current_date' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
    );
  }

  public static function get_product()
  {
    return array(
      'productID' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        },
      ),
    );
  }

  public static function get_products()
  {
    return array(
      'page' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        },
      ),
      'search' => array(
        'required' => false,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'items' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        },
      ),
      'category' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'sort_by' => array(
        'required' => false,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
    );
  }
  public static function get_categories()
  {
    return array(

      'category_id' => array(
        'required' => false,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),

    );
  }
}
