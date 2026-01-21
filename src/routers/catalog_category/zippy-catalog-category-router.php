<?php

namespace Zippy_Booking\Src\Routers\Catalog_Category;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;
use WP_REST_Server;
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Catalog_Category_Controller;

class Zippy_Catalog_Category_Router
{
    protected static $_instance = null;

    /**
     * @return Zippy_Catalog_Category_Router
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
        add_action('rest_api_init', array($this, 'catalog_category_init_api'));
    }

    public function catalog_category_init_api()
    {
        $namespace = ZIPPY_BOOKING_API_NAMESPACE;
        $permission = array(Zippy_Booking_Permission::class, 'zippy_permission_callback');


        register_rest_route($namespace, '/catalog-category', array(
            'methods'             => WP_REST_Server::READABLE, // GET
            'callback'            => [Zippy_Admin_Catalog_Category_Controller::class, 'get_role_categories'],
            'args'                => [],
            'permission_callback' => $permission,
        ));

        //Create or Update config by user role
        register_rest_route($namespace, '/catalog-category', array(
            'methods'             => WP_REST_Server::EDITABLE, // PUT
            'callback'            => [Zippy_Admin_Catalog_Category_Controller::class, 'save_role_categories'],
            'args'                => [],
            'permission_callback' => $permission,
        ));

        //Delete config by user role
        register_rest_route($namespace, '/catalog-category', array(
            'methods'             => WP_REST_Server::DELETABLE, // DELETE
            'callback'            => [Zippy_Admin_Catalog_Category_Controller::class, 'delete_role_categories'],
            'args'                => [],
            'permission_callback' => $permission,
        ));
    }
}
