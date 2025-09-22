<?php

namespace Zippy_Booking\Src\Routers\Orders;

use Zippy_Booking\Src\App\Models\Orders\Zippy_Orders_Model;

use Zippy_Booking\Src\Controllers\Orders\Zippy_Orders_Controller;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

/**
 * Menu Router
 *
 *
 */

defined('ABSPATH') or die();

class Zippy_Orders_Router
{
  protected static $_instance = null;

  /**
   * @return Zippy_Orders_Router
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
    add_action('rest_api_init', array($this, 'zippy_orders_init_api'));
  }

  public function zippy_orders_init_api()
  {
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/export-orders', array(
      'methods' => 'GET',
      'callback' => [Zippy_Orders_Controller::class, 'export_orders'],
    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/get-items-order', array(
      'methods' => 'GET',
      'callback' => [Zippy_Orders_Controller::class, 'get_items_order'],
    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/save-items-order', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'update_items_order'],
    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/add-items-order', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'add_product_to_order'],
    ));
  }
}
