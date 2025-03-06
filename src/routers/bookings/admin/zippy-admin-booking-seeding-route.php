<?php

namespace Zippy_Booking\Src\Routers\Bookings\Admin;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Seeding_Controller;

defined('ABSPATH') or die();


class Zippy_Admin_Booking_Seeding_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_product_api'));
    }

    public function zippy_booking_init_product_api()
    {
        /* GET product/category */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/seed', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Seeding_Controller::class, 'run'),
        ));
    }
}