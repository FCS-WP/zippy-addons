<?php

namespace Zippy_Booking\Src\Routers\Products;

use Zippy_Booking\Src\App\Models\Products\Zippy_Products_Model;

use Zippy_Booking\Src\Controllers\Products\Zippy_Products_Controller;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

/**
 * Menu Router
 *
 *
 */

defined('ABSPATH') or die();

class Zippy_Products_Router
{
  protected static $_instance = null;

  /**
   * @return Zippy_Products_Router
   */

  public static function get_instance()
  {
    if (is_null(self::$_instance)) {
      self::$_instance = new self();
    }
    return self::$_instance;
  }

  public function __construct()
  {
    add_action('rest_api_init', array($this, 'zippy_products_init_api'));
  }

  public function zippy_products_init_api()
  {
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/search-products', array(
      'methods' => 'GET',
      'callback' => [Zippy_Products_Controller::class, 'search_products'],
      'args' => Zippy_Products_Model::search_products_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/product-checking', array(
      'methods' => 'GET',
      'callback' => [Zippy_Products_Controller::class, 'product_checking'],
      'args' => Zippy_Products_Model::product_checking_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/products', array(
      'methods' => 'GET',
      'callback' => [Zippy_Products_Controller::class, 'get_products'],
      'args' => Zippy_Products_Model::get_products(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/product', array(
      'methods' => 'GET',
      'callback' => [Zippy_Products_Controller::class, 'get_product'],
      'args' => Zippy_Products_Model::get_product(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/categories', array(
      'methods' => 'GET',
      'callback' => [Zippy_Products_Controller::class, 'get_categories'],
      'args' => Zippy_Products_Model::get_categories(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

  }
}
