<?php
/*
Plugin Name: Zippy Woocommerce Add-ons
Plugin URI: https://zippy.sg/
Description: Booking System, Manage Oder, Monthly Payment...
Version: 2.0 Author: Zippy SG
Author URI: https://zippy.sg/
License: GNU General Public
License v3.0 License
URI: https://zippy.sg/
Domain Path: /languages

Copyright 2024

*/

namespace Zippy_Booking;


defined('ABSPATH') or die('°_°’');

/* ------------------------------------------
 // Constants
 ------------------------------------------------------------------------ */
/* Set plugin version constant. */

if (!defined('ZIPPY_ADDONS_VERSION')) {
  define('ZIPPY_ADDONS_VERSION', '4.0');
}

/* Set plugin name. */

if (!defined('ZIPPY_ADDONS_NAME')) {
  define('ZIPPY_ADDONS_NAME', 'Zippy Addons');
}

if (!defined('ZIPPY_ADDONS_PREFIX')) {
  define('ZIPPY_ADDONS_PREFIX', 'zippy_addons');
}

if (!defined('ZIPPY_ADDONS_BASENAME')) {
  define('ZIPPY_ADDONS_BASENAME', plugin_basename(__FILE__));
}

/* Set constant path to the plugin directory. */

if (!defined('ZIPPY_ADDONS_DIR_PATH')) {
  define('ZIPPY_ADDONS_DIR_PATH', plugin_dir_path(__FILE__));
}

/* Set constant url to the plugin directory. */

if (!defined('ZIPPY_ADDONS_URL')) {
  define('ZIPPY_ADDONS_URL', plugin_dir_url(__FILE__));
}

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

/* ------------------------------------------
// Includes
 --------------------------- --------------------------------------------- */
require ZIPPY_ADDONS_DIR_PATH . '/includes/autoload.php';
require ZIPPY_ADDONS_DIR_PATH . 'vendor/autoload.php';
require_once ZIPPY_ADDONS_DIR_PATH . 'includes/constances.php';


use  Zippy_Booking\Src\Admin\Zippy_Admin_Settings;

use  Zippy_Booking\Src\Database\Zippy_Databases;

use Zippy_Booking\Src\Routers\Zippy_Booking_Routers;

use Zippy_Booking\Src\Web\Zippy_Booking_Web;

use Zippy_Booking\Src\Woocommerce\Zippy_Woo_Booking;


/**
 *
 * Init Zippy Booking
 */

Zippy_Databases::get_instance();

Zippy_Admin_Settings::get_instance();

Zippy_Woo_Booking::get_instance();

Zippy_Booking_Web::get_instance();

Zippy_Booking_Routers::get_instance();

