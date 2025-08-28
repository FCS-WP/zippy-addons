<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models\Reports;

defined('ABSPATH') or die();

class Zippy_Api_Reports_Model
{

  public static function fulfilment_report()
  {
    return array(
      'date' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
      'type' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_string($param);
        },
      ),
    );
  }
}
