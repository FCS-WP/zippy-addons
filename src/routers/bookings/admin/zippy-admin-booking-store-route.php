<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Store_Controller;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Store_Config_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Store_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_store_api'));
    }

    public function zippy_booking_init_store_api()
    {
        /* Store API */

        // CREATE a new store
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/stores', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Store_Controller::class, 'zippy_create_store'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        // GET all stores
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/stores', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Store_Controller::class, 'zippy_get_store'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
        // Update store
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/stores', array(
            'methods' => 'PUT',
            'callback' => array(Zippy_Admin_Booking_Store_Controller::class, 'zippy_update_store'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
        // Delete store
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/stores', array(
            'methods' => 'DELETE',
            'callback' => array(Zippy_Admin_Booking_Store_Controller::class, 'zippy_delete_store'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));



        // CREATE a new store config
        // register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/store-config', array(
        //     'methods' => 'POST',
        //     'callback' => array(Zippy_Admin_Booking_Store_Config_Controller::class, 'create_store_config'),
        //     'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        // ));



        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/holiday', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Store_Config_Controller::class, 'create_holiday'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        // GET all stores
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/holiday', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Store_Config_Controller::class, 'get_holidays'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
        // Update store
        // register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/holiday', array(
        //     'methods' => 'PUT',
        //     'callback' => array(Zippy_Admin_Booking_Store_Config_Controller::class, 'update_holiday'),
        //     'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        // ));
    }
}
