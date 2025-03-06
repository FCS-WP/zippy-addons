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
  public static function get_booking_args()
  {
    return array(
      'booking_id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
      'email' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_email($param);
        }
      ),
      'product_id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
    );
  }

  public static function create_booking_args()
  {
    return array(
      'product_id' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
      'user_id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
      'email' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_email($param);
        }
      ),
      'booking_start_date' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return strtotime($param) !== false;
        }
      ),
      'booking_end_date' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return strtotime($param) !== false;
        }
      ),
    );
  }
  public static function get_remove_booking_args()
  {
    return array(
      'booking_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param) && intval($param) > 0;
        },
      ),
      'user_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param) && intval($param) > 0;
        },
      ),
    );
  }

  public static function get_update_booking_args()
  {
    return array(
      'booking_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param) && intval($param) > 0;
        },
      ),
      'booking_start_date' => array(
        'required' => false,
        'sanitize_callback' => 'sanitize_text_field',
      ),
      'booking_end_date' => array(
        'required' => false,
        'sanitize_callback' => 'sanitize_text_field',
      ),
      'booking_status' => array(
        'required' => false,
        'sanitize_callback' => 'sanitize_text_field',
      ),
    );
  }
  public static function get_bookings_args()
  {
    return array(
      'product_id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_numeric($param);
          return true;
        }
      ),
      'booking_status' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_string($param);
          return true;
        }
      ),
      'booking_start_date' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return Zippy_Request_Validation::validateDate($param);
          return true;
        }
      ),
      'booking_end_date' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return Zippy_Request_Validation::validateDate($param);
          return true;
        }
      ),
      'email' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_email($param);
          return true;
        }
      ),
      'user_id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_string($param);
          return true;
        }
      ),
    );
  }
  public static function get_support_booking_products_args()
  {
    return array(
      'products' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          if (!is_array($param)) {
            return false;
          }
          foreach ($param as $product) {
            if (!isset($product['items_id']) || !is_numeric($product['items_id'])) {
              return false;
            }
            if (!isset($product['mapping_type']) || !is_string($product['mapping_type']) || $product['mapping_type'] !== 'product') {
              return false;
            }
          }
          return true;
        },
      ),
    );
  }

  public static function get_support_booking_product_args()
  {
    return array(
      'items_id' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_numeric($param) && $param > 0;
        },
      ),
      'mapping_type' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_string($param) && $param === 'product';
        },
      ),
    );
  }
  public static function get_support_booking_categories_args()
  {
    return array(
      'categories' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          if (!is_array($param)) {
            return false;
          }
          foreach ($param as $category) {
            if (!isset($category['items_id']) || !is_numeric($category['items_id'])) {
              return false;
            }
            if (!isset($category['mapping_type']) || !is_string($category['mapping_type']) || $category['mapping_type'] !== 'category') {
              return false;
            }
          }
          return true;
        },
      ),
    );
  }

  public static function get_support_booking_category_args()
  {
    return array(
      'items_id' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_numeric($param) && $param > 0;
        },
      ),
      'mapping_type' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_string($param) && $param === 'category';
        },
      ),
    );
  }

  public static function get_delete_category_args()
  {
    return array(
      'items_ids' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_array($param);
        },
      ),
    );
  }

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
  public static function booking_report_args()
  {
    return array(
      'start-date' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'end-date' => array(
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
