<?php

/**
 * Bookings Router
 *
 *
 */

namespace Zippy_Booking\Src\Routers\Bookings;

use Zippy_Booking\Src\Controllers\Web\Zippy_Booking_Controller;

use Zippy_Booking\Src\Controllers\Web\Supports\Zippy_Booking_Support_Controller;

use Zippy_Booking\Src\App\Models\Zippy_Api_Booking_Model;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Product_Route;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Store_Route;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Shipping_Route;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Delivery_Route;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Location_Route;


defined('ABSPATH') or die();


class Zippy_Booking_Router
{
    protected static $_instance = null;

    /**
     * @return Zippy_Booking_Router
     */

    public static function get_instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_api'));

        new Zippy_Admin_Booking_Product_Route();
        new Zippy_Admin_Booking_Store_Route();
        new Zippy_Admin_Booking_Shipping_Route();
        new Zippy_Admin_Booking_Location_Route();
        new Zippy_Admin_Booking_Delivery_Route();
    }


    public function zippy_booking_init_api()
    {
        /* Search product had been mapped */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/search-mapping-products', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Support_Controller::class, 'search_mapping_products'],
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));
    }
}
