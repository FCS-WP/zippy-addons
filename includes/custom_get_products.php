<?php

use Zippy_Booking\Src\Services\Zippy_Booking_Helper;

add_action('pre_get_posts', function ($query) {
    if (is_admin() || ! $query->is_main_query()) {
        return;
    }
    global $products_with_special_class;
    $products_with_special_class = [];

    $disabled_ids = Zippy_Booking_Helper::handle_check_disabled_products();
    // Check condition
    if (!empty($disabled_ids)) {
        $products_with_special_class = $disabled_ids;
    }
});

add_filter('post_class', function ($classes, $class, $post_id) {
    if ('product' === get_post_type($post_id)) {
        global $products_with_special_class;

        if (! empty($products_with_special_class) && in_array($post_id, $products_with_special_class)) {
            $classes[] = 'custom-disabled-product';
        }
    }
    return $classes;
}, 10, 3);
