<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Shipping_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Shipping_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_store_api'));
    }

    public function zippy_booking_init_store_api()
    {
        // CREATE Shipping Config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/shipping', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Shipping_Controller::class, 'create_shipping_config'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        // CREATE GET Config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/shipping', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Shipping_Controller::class, 'get_shipping_config'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
        
        // DELETE GET Config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/shipping', array(
            'methods' => 'DELETE',
            'callback' => array(Zippy_Admin_Booking_Shipping_Controller::class, 'delete_shipping_config'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        )); 


        // GET Remain delivery slot
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/slot', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Shipping_Controller::class, 'check_for_remaining_slots'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        )); 
    }
}