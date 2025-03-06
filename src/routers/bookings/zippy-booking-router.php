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

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Config_Route;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Product_Route;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Booking_Route;

use Zippy_Booking\Src\Routers\Bookings\Admin\Zippy_Admin_Booking_Seeding_Route;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;



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

        new Zippy_Admin_Booking_Config_Route();
        new Zippy_Admin_Booking_Product_Route();
        new Zippy_Admin_Booking_Booking_Route();
        new Zippy_Admin_Booking_Seeding_Route();
    }


    public function zippy_booking_init_api()
    {
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/product', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Support_Controller::class, 'handle_support_booking_product'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_product_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/products', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Support_Controller::class, 'handle_support_booking_products'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_products_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Support_Controller::class, 'get_all_support_booking_items'],
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],

        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/delete', array(
            'methods' => 'DELETE',
            'callback' => [Zippy_Booking_Support_Controller::class, 'delete_support_booking'],
            // 'args' => Zippy_Api_Booking_Model::get_delete_product_args(),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/category', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Support_Controller::class, 'handle_support_booking_category'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_category_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/categories', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Support_Controller::class, 'handle_support_booking_categories'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_categories_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/categories', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Support_Controller::class, 'get_all_support_booking_categories'],
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/category', array(
            'methods' => 'DELETE',
            'callback' => [Zippy_Booking_Support_Controller::class, 'delete_support_booking_category'],
            'args' => Zippy_Api_Booking_Model::get_delete_category_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));
        
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/products/update-price', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Support_Controller::class, 'update_product_price'],
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        /* Search product had been mapped */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/search-mapping-products', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Support_Controller::class, 'search_mapping_products'],
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));
    }
}
