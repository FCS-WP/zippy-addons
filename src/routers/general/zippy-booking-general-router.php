<?php
namespace Zippy_Booking\Src\Routers\General;
/**
 * Bookings General Router
 *
 *
 */

defined('ABSPATH') or die();

use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_General_Controller;

use Zippy_Booking\Src\App\Models\Zippy_Api_Booking_Model;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

class Zippy_Booking_General_Router
{

  protected static $_instance = null;

  /**
   * @return Zippy_Booking_General_Router
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
    add_action('rest_api_init', array($this, 'zippy_booking_general_init_api'));
  }

  public function zippy_booking_general_init_api()
  {
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/zippy-options', array(
      'methods' => 'POST',
      'callback' => [Zippy_Admin_Booking_General_Controller::class, 'update_option_configs'],
      'args' => Zippy_Api_Booking_Model::update_option_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),

    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/zippy-options', array(
      'methods' => 'GET',
      'callback' => [Zippy_Admin_Booking_General_Controller::class, 'get_option_configs'],
      'args' => Zippy_Api_Booking_Model::get_update_option_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),

    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/zippy-signin', array(
      'methods' => 'POST',
      'callback' => [Zippy_Admin_Booking_General_Controller::class, 'signin'],
      'args' => Zippy_Api_Booking_Model::signin_args(),
      'permission_callback' => "__return_true",

    ));

    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/zippy-register', array(
      'methods' => 'POST',
      'callback' => [Zippy_Admin_Booking_General_Controller::class, 'register'],
      'args' => Zippy_Api_Booking_Model::register_args(),
      'permission_callback' => "__return_true",
    ));
    
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking-report', array(
      'methods' => 'GET',
      'callback' => [Zippy_Admin_Booking_General_Controller::class, 'booking_report'],
      'args' => Zippy_Api_Booking_Model::booking_report_args(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),

    ));
  }
}
