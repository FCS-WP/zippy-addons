<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Delivery_Controller;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Store_Config_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Delivery_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_store_api'));
    }

    public function zippy_booking_init_store_api()
    {
        // CREATE delivery config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/delivery', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Delivery_Controller::class, 'create_delivery_config'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/delivery', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Delivery_Controller::class, 'get_delivery_config'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
    }
}
