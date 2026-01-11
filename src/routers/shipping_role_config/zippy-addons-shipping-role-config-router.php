<?php

namespace Zippy_Booking\Src\Routers\Shipping_Role_Config;

use Zippy_Booking\Src\App\Models\Price_Books\Zippy_Price_Books_Model;
use Zippy_Booking\Src\Controllers\Price_Books\Zippy_Price_Books_Controller;
use Zippy_Booking\Src\Controllers\Price_Books\Zippy_Price_Book_Products_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;
use WP_REST_Server;
use Zippy_Booking\Src\Controllers\Shipping_Role_Config\Zippy_Addons_Shipping_Role_Config_Controller;

/**
 * Price Books Router
 *
 *
 */

defined('ABSPATH') or die();

class Zippy_Addons_Shipping_Role_Config_Router
{
  protected static $_instance = null;

  /**
   * @return Zippy_Addons_Shipping_Role_Config_Router
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
    add_action('rest_api_init', array($this, 'addons_shipping_role_config_init_api'));
  }

  public function addons_shipping_role_config_init_api()
  {
    $namespace = ZIPPY_BOOKING_API_NAMESPACE;
    $permission = array(Zippy_Booking_Permission::class, 'zippy_permission_callback');
    // $model_args = Zippy_Price_Books_Model::get_args();
    // $update_product_rule_model_args = Zippy_Price_Books_Model::update_product_rule_args();


    register_rest_route($namespace, '/shipping-role-config', array(
      'methods'             => WP_REST_Server::READABLE, // GET
      'callback'            => [Zippy_Addons_Shipping_Role_Config_Controller::class, 'all_shipping_role_configs'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    //Update
    register_rest_route($namespace, '/shipping-role-config', array(
      'methods'             => WP_REST_Server::EDITABLE, // PUT
      'callback'            => [Zippy_Addons_Shipping_Role_Config_Controller::class, 'update_shipping_role_config'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    //Get config by user role
    register_rest_route($namespace, '/get-shipping-role-config-by-user', array(
      'methods'             => WP_REST_Server::READABLE, // GET
      'callback'            => [Zippy_Addons_Shipping_Role_Config_Controller::class, 'get_shipping_role_config_by_user'],
      'args'                => [],
      'permission_callback' => function () {
        return is_user_logged_in();
      },
    ));
  }
}
