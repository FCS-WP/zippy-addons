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

    public static function is_category_in_catalog($category_identifier, $role)
    {
        $categories = self::get_category_by_role($role);
        return in_array($category_identifier, $categories);
    }

    public static function get_all_category_slugs()
    {
        $all_categories = get_terms([
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
        ]);

        $category_slugs = [];
        foreach ($all_categories as $category) {
            $category_slugs[] = $category->slug;
        }

        return $category_slugs;
    }
}
