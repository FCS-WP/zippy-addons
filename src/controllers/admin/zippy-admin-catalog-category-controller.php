<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use Zippy_Booking\Src\Services\Price_Books\Price_Books_Service;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use WP_REST_Request;
use Zippy_Booking\Src\Services\Catalog_Category\Catalog_Category_Services;

class Zippy_Admin_Catalog_Category_Controller
{
    public static function get_role_categories()
    {
        $role_categories = Catalog_Category_Services::get_role_categories();
        return Zippy_Response_Handler::success($role_categories);
    }

    public static function save_role_categories($request)
    {
        $role_categories = $request->get_param('role_categories');
        update_option('zippy_role_category_mapping', $role_categories);
        return Zippy_Response_Handler::success(['message' => 'Role categories updated successfully.']);
    }

    public static function delete_role_categories($request)
    {
        $role = $request->get_param('role');
        $role_categories = Catalog_Category_Services::get_role_categories();

        if (isset($role_categories[$role])) {
            unset($role_categories[$role]);
            update_option('zippy_role_category_mapping', $role_categories);
            return Zippy_Response_Handler::success(['message' => 'Role categories deleted successfully.']);
        } else {
            return Zippy_Response_Handler::error('Role not found.', 404);
        }
    }
}
