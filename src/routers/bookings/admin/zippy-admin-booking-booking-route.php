<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Controllers\Web\Zippy_Booking_Controller;
use Zippy_Booking\Src\App\Models\Zippy_Api_Booking_Model;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Booking_Controller;

defined('ABSPATH') or die();


class Zippy_Admin_Booking_Booking_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_plugin_config_api'));
    }


    public function zippy_booking_init_plugin_config_api()
    {
        /* CREATE a Booking */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'create_booking_with_product'],
            'args' => Zippy_Api_Booking_Model::create_booking_args(),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        /* GET a Booking */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Controller::class, 'get_booking_with_product'],
            'args' => Zippy_Api_Booking_Model::get_booking_args(),
            'permission_callback' => '__return_true',
        ));

        /* UPDATE a Booking */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/update-booking', array(
            'methods' => 'PUT',
            'callback' => [Zippy_Booking_Controller::class, 'update_booking'],
            'args' => Zippy_Api_Booking_Model::get_update_booking_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        /* DELETE a Booking */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/remove-booking', array(
            'methods' => 'DELETE',
            'callback' => [Zippy_Booking_Controller::class, 'delete_booking'],
            'args' => Zippy_Api_Booking_Model::get_remove_booking_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        /* GET Booking List */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/bookings', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Booking_Controller::class, 'get_booking_list_of_a_product'),
            'args' => Zippy_Api_Booking_Model::get_bookings_args(),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        /* GET Booking Stats */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/stats', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Booking_Controller::class, 'get_booking_stats'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
    }
}