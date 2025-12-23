<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models\Price_Books;

defined('ABSPATH') or die();

use WP_REST_Response;
use Zippy_Booking\App\Models\Zippy_Request_Validation;

class Zippy_Price_Books_Model
{

  public static function get_args()
  {
    return array(
      'id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        },
      ),
    );
  }
  public static function store_args()
  {
    return array(
      'name' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'role' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'start_date' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'end_date' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
    );
  }
  public static function update_product_rule_args()
  {
    return array(
      'pricebook_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        },
      ),
      'rule_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        },
      ),

    );
  }
}
