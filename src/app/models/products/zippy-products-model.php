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
      'key_word' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
    );
  }
}
