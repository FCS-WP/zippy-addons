<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models;

defined('ABSPATH') or die();

use WP_REST_Response;
use Zippy_Booking\App\Models\Zippy_Request_Validation;

class Zippy_Api_Booking_Model
{

  public static function get_update_option_args()
  {
    return array(
      'option_name' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_array($param);
        },
      ),
    );
  }

  public static function update_option_args()
  {
    return array(
      'option_name' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_array($param);
        },
      ),
      'option_data' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_array($param);
        },
      ),
    );
  }

  public static function signin_args()
  {
    return array(
      'username' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'password' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
    
    );
  }

  public static function register_args()
  {
    return array(
      'email' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'password' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      
    );
  }
}
