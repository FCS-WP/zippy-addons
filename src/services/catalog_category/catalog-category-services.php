<?php

namespace Zippy_Booking\Src\Services\Catalog_Category;

class Catalog_Category_Services
{
    public static function get_role_categories()
    {
        $role_categories = get_option('zippy_role_category_mapping', []);
        return $role_categories;
    }

    public static function get_category_by_role($role)
    {
        $role_categories = self::get_role_categories();
        return isset($role_categories[$role]) ? $role_categories[$role] : $role_categories['all'];
    }
}
