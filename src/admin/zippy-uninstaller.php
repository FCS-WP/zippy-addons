<?php

/**
 * Uninstaller
 *
 *
 */

namespace Zippy_Booking\Src\Admin;

defined('ABSPATH') or die();

class Zippy_Uninstaller
{

  public static function uninstall(){
    global $wpdb;

    // DROP tables

    $table_names = [
      "bookings",
      "booking_configs",
      "products_booking",
      "zippy_booking_log",
    ];

    foreach ($table_names as $name) {
      $table_name = $wpdb->prefix . $name;
      $wpdb->query("DROP TABLE IF EXISTS $table_name");
    }


    // DELETE options
    $options = [
      "zippy_booking_api_token",
      "store_email",
      "default_booking_status",
      "booking_type",
      "allow_overlap",
      "duration",
    ];
    foreach ($options as $opt) {
      delete_option($opt);
    }
  }
}
