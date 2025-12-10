<?php

namespace Zippy_Booking\Src\Routers\Orders;

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
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/add-items-order', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'add_product_to_order'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/get-order-info', array(
      'methods' => 'GET',
      'callback' => [Zippy_Orders_Controller::class, 'get_order_info'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/remove-item-order', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'remove_order_item'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/update-meta-data-order-item', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'update_meta_data_order_item'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/apply_coupon_to_order', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'apply_coupon_to_order'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/update-order-status', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'update_order_status'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/move-to-trash', array(
      'methods' => 'POST',
      'callback' => [Zippy_Orders_Controller::class, 'move_to_trash'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/get-list-customers', array(
      'methods' => 'GET',
      'callback' => [Zippy_Orders_Controller::class, 'get_list_customers'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/update-price-product-by-user', array(
      'methods' => 'GET',
      'callback' => [Zippy_Orders_Controller::class, 'update_user_id_and_price_product'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/admin-name-from-order', array(
      'methods' => 'GET',
      'callback' => [Zippy_Orders_Controller::class, 'get_admin_name_from_order'],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
  }
}
