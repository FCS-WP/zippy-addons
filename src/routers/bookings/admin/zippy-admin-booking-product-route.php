<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Product_Controller;

defined('ABSPATH') or die();


class Zippy_Admin_Booking_Product_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_product_api'));
    }

    public function zippy_booking_init_product_api()
    {
        /* GET product/category */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/add-to-cart', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Product_Controller::class, 'add_product_and_shipping_info_to_card'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        // Checking before add to cart.
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/check-before-add-to-cart', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Product_Controller::class, 'check_before_add_to_cart'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        /* GET product/category */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/mapping-product', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Product_Controller::class, 'check_product_mapping'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
    }
}