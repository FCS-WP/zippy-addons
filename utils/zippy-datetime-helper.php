<?php

/**
 * Zipyy_DateTime_Helper
 *
 * @package Zippy_Addons
 */

namespace Zippy_Booking\Utils;

defined('ABSPATH') || exit;

use WC_Cart;

class Zippy_DateTime_Helper
{
  /**
   * Helper function to safely convert ISO 8601 date string to MySQL DATETIME format.
   * @param string|null $iso_string
   * @return string|null
   */
  public static function parse_iso_to_mysql($iso_string)
  {
    if (empty($iso_string)) {
      return null;
    }

    try {
      $date = new \DateTime($iso_string);

      return $date->format('Y-m-d H:i:s');
    } catch (\Exception $e) {
      error_log("Date Parsing Error: " . $e->getMessage() . " Input: " . $iso_string);
      return null;
    }
  }
}
