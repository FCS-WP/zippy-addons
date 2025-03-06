<?php

namespace Zippy_Booking\Src\Routers;

/**
 * Bookings General Router
 *
 *
 */

defined('ABSPATH') or die();

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Routers\Bookings\Mail\Zippy_Booking_Mail_Route;
use Zippy_Booking\Src\Routers\General\Zippy_Booking_General_Router;


class Zippy_Booking_Routers
{
  protected static $_instance = null;

  /**
   * @return Zippy_Booking_Routers
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
    Zippy_Booking_Router::get_instance();
    Zippy_Booking_General_Router::get_instance();
    new Zippy_Booking_Mail_Route();
  }
}
