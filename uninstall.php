<?php

defined('ABSPATH') or die('°_°’');

if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}


/**
 * 
 * Autoload
 * 
 */

require plugin_dir_path(__FILE__) . '/includes/autoload.php';

/**
 * 
 * 
 * 
 * 
 * 
 */


use Zippy_Booking\Src\Admin\Zippy_Uninstaller;

Zippy_Uninstaller::uninstall();