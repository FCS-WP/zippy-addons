<?php

namespace Zippy_Booking\Src\Routers\Reports;

/**
 * Bookings General Router
 *
 *
 */

defined('ABSPATH') or die();

use Zippy_Booking\Src\Controllers\Reports\Zippy_Reports_Controller;

use Zippy_Booking\Src\App\Models\Reports\Zippy_Api_Reports_Model;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

class Zippy_Booking_Report_Router
{

  protected static $_instance = null;

  /**
   * @return Zippy_Booking_Report_Router
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
    add_action('rest_api_init', array($this, 'zippy_booking_report_init_api'));
  }

  public function zippy_booking_report_init_api()
  {
    register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/fulfilment-report', array(
      'methods' => 'GET',
      'callback' => [Zippy_Reports_Controller::class, 'export_fulfilment_report'],
      'args' => Zippy_Api_Reports_Model::fulfilment_report(),
      'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),

    ));
  }
}
