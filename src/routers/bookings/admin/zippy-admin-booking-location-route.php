<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Location_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Location_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_store_api'));
    }

    public function zippy_booking_init_store_api()
    {
        // CREATE Shipping Config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/location', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Location_Controller::class, 'get_location_geo'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
        // CREATE GET Config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/distance', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Location_Controller::class, 'get_distance_between_locations'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
    }
}
