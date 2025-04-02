<?php

namespace Zippy_Booking\Src\Routers\Menu;

use Zippy_Booking\Src\Controllers\Menu\Zippy_Menu_Controller;

use Zippy_Booking\Src\App\Models\Menus\Zippy_Api_Menu_Model;

use Zippy_Booking\Src\Controllers\Menu\Zippy_Menu_Products_Controller;


use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

/**
 * Menu Router
 *
 *
 */

defined('ABSPATH') or die();

class Zippy_Menu_Router
{
  protected static $_instance = null;

  /**
   * @return Zippy_Menu_Router
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
    add_action('rest_api_init', array($this, 'zippy_menu_init_api'));
  }

  public function zippy_menu_init_api()
  {
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/menus', array(
      'methods' => 'GET',
      'callback' => [Zippy_Menu_Controller::class, 'get_menus'],
      // 'args' => Zippy_Api_Menu_Model::get_menu_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/menus', array(
      'methods' => 'POST',
      'callback' => [Zippy_Menu_Controller::class, 'set_menu'],
      'args' => Zippy_Api_Menu_Model::set_menu_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/menus', array(
      'methods' => 'PUT',
      'callback' => [Zippy_Menu_Controller::class, 'update_menu'],
      'args' => Zippy_Api_Menu_Model::update_menu_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/menus', array(
      'methods' => 'DELETE',
      'callback' => [Zippy_Menu_Controller::class, 'delete_items'],
      'args' => Zippy_Api_Menu_Model::delete_menu_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/products-menu', array(
      'methods' => 'GET',
      'callback' => [Zippy_Menu_Products_Controller::class, 'get_products_in_menu'],
      'args' => Zippy_Api_Menu_Model::get_products_menu_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/products-menu', array(
      'methods' => 'POST',
      'callback' => [Zippy_Menu_Products_Controller::class, 'add_products_to_menu'],
      'args' => Zippy_Api_Menu_Model::add_product_to_menu_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),

    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/products-menu', array(
      'methods' => 'DELETE',
      'callback' => [Zippy_Menu_Products_Controller::class, 'remove_products_from_menu'],
      'args' => Zippy_Api_Menu_Model::delete_product_in_menu_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),

    ));

  }
}
