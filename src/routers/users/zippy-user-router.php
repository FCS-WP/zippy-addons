<?php

namespace Zippy_Booking\Src\Routers\Users;

use Zippy_Booking\Src\App\Models\Products\Zippy_Products_Model;

use Zippy_Booking\Src\Controllers\Users\Zippy_User_Controller;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

/**
 * Menu Router
 *
 *
 */

defined('ABSPATH') or die();

class Zippy_User_Router
{
  protected static $_instance = null;

  /**
   * @return Zippy_User_Router
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
    add_action('rest_api_init', array($this, 'zippy_booking_user_init_api'));
  }

  public function zippy_booking_user_init_api()
  {
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/user-roles', array(
      'methods' => 'GET',
      'callback' => [Zippy_User_Controller::class, 'get_user_roles'],
      'args' => [],
      'permission_callback' => [Zippy_Booking_Permission::class, 'zippy_permission_callback'],

    ));
  }
}
