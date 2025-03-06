<?php

namespace Zippy_Booking\Src\Routers\Bookings\Mail;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;
use Zippy_booking\Src\Controllers\Mail\Zippy_Booking_Mail_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;
defined('ABSPATH') or die();


class Zippy_Booking_Mail_Route extends Zippy_Booking_Router
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_plugin_config_api'));
    }

    public function zippy_booking_init_plugin_config_api()
    {
        // UPDATE plugin config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/mailservice', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Booking_Mail_Controller::class, 'send_mail'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
    }
}