<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models\Menus;

defined('ABSPATH') or die();

class Zippy_Api_Menu_Model
{
  public static function get_menu_args()
  {
    return array(
      'id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
    );
  }

  public static function set_menu_args()
  {
    return array(
      'name' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'start_date' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'end_date' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'days_of_week' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          return is_array($param);
        }
      ),
    );
  }

  public static function update_menu_args()
  {
    return array(
      'name' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'start_date' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'end_date' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'days_of_week' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_array($param);
        }
      ),
    );
  }

  public static function delete_menu_args()
  {
    return array(
      'ids' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_array($param);
        }
      ),
    );
  }


  public static function add_products_menu_args()
  {
    return array(
      'name' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'start_date' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'end_date' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
      'days_of_week' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_string($param);
        }
      ),
    );
  }
  public static function get_products_menu_args()
  {
    return array(
      'menu_id' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
    );
  }
  public static function add_product_to_menu_args()
  {
    return array(
      'menu_id' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
      'product_ids' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_array($param);
        }
      ),
    );
  }
  public static function delete_product_in_menu_args()
  {
    return array(
      'menu_id' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_numeric($param);
        }
      ),
      'product_ids' => array(
        'required' => true,
        'validate_callback' => function ($param) {
          return is_array($param);
        }
      ),
    );
  }
}
