<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Config_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

defined('ABSPATH') or die();


class Zippy_Admin_Booking_Config_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_plugin_config_api'));
    }


    public function zippy_booking_init_plugin_config_api()
    {
        /* Plugin Config */
        
        // CREATE plugin config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/configs', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Config_Controller::class, 'zippy_booking_create_configs'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        // GET plugin config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/configs', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Config_Controller::class, 'zippy_booking_get_configs'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
    }
}