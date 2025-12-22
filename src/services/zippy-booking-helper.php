<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

use DateTime;
use Zippy_Booking\Utils\Zippy_Cart_Handler;
use Zippy_Booking\Utils\Zippy_Session_Handler;

class Zippy_Booking_Helper
{
    public static function handle_include_products($data_products, $table_name)
    {
        global $wpdb;
        foreach ($data_products as $product) {
            $ids[] = $product['product_id'] ?? $product['items_id'];
        }

        if (is_array($ids) && !empty($ids)) {
            $placeholders = implode(',', array_fill(0, count($ids), '%d'));

            $query = $wpdb->prepare(
                "SELECT items_id
                FROM {$table_name}
                WHERE mapping_type = %s
                AND items_id IN ($placeholders)
                AND mapping_status = %s",
                array_merge(['product'], $ids, ['exclude'])
            );
            // Execute the query
            $product_exclude =  json_decode(json_encode($wpdb->get_results($query)));
        } else {
            $product_exclude = [];
        }
        $exclude_ids = array_column($product_exclude, 'items_id');

        if (isset($data_products)) {
            $includeProducts = array_filter(
                $data_products,
                function ($product) use ($exclude_ids) {
                    $currentId = $product['product_id'] ?? $product['items_id'];

                    return !in_array($currentId, $exclude_ids);
                }
            );
            $data_products = array(...$includeProducts);
        }

        return $data_products;
    }

    public static function filter_mapping_product($products)
    {
        global $wpdb;
        $results = [];
        $mapping_data = $wpdb->get_results("SELECT * FROM fcs_data_products_booking WHERE mapping_status != 'exclude'", ARRAY_A);
        $mapping_ids = wp_list_pluck($mapping_data, 'items_id');

        foreach ($products as $product) {
            $is_mapped = false;
            $product_id = $product->get_id();
            // Check if product is in the mapping table
            if (in_array($product_id, $mapping_ids)) {
                $is_mapped = true;
            }

            if (!$is_mapped) {
                $check_exclude = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM fcs_data_products_booking WHERE items_id = %d AND mapping_status = 'exclude'",
                    $product_id
                ));

                if (!$check_exclude) {
                    $category_ids = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
                    foreach ($category_ids as $key => $cat_id) {
                        if (in_array($cat_id, $mapping_ids)) {
                            $is_mapped = true;
                        }
                    }
                }
            }

            if ($is_mapped) {
                $results[] = [
                    'item_id'    => $product->get_id(),
                    'item_name'  => $product->get_name(),
                    'item_price' => $product->get_price(),
                    'item_extra_price' => get_post_meta($product->get_id(), '_extra_price', true),
                ];
            }
        }

        return $results;
    }

    /**
     * Handle extra times
     * @return -1 || product extra price
     */
    public static function handle_extra_price($data)
    {
        $convert_start_time = new DateTime($data['booking_start_time']);
        $convert_end_time = new DateTime($data['booking_end_time']);
        $extra_time_data = $data['config_extra_time']['data'];
        $extra_price = -1;

        if (!empty($extra_time_data)) {
            foreach ($extra_time_data as $ext_time) {
                $ext_from = new DateTime($ext_time['from']);
                $ext_to = new DateTime($ext_time['to']);

                if ($ext_to < $ext_from) {
                    $start_of_date = new DateTime('00:00:00');
                    $end_of_date = new DateTime('00:00:00');
                    $end_of_date->modify('+1 day');
                    $first_condition = $convert_start_time >= $ext_from && $convert_end_time <= $end_of_date;
                    $second_condition = $convert_start_time >= $start_of_date && $convert_end_time <= $ext_to;

                    if ($first_condition || $second_condition) {
                        $extra_price = get_post_meta($data['product_id'], '_extra_price', true);
                        if (empty($extra_price)) {
                            return -1;
                        }
                    }
                } else {
                    if ($convert_start_time >= $ext_from && $convert_end_time <= $ext_to) {
                        // Set new product price
                        $extra_price = get_post_meta($data['product_id'], '_extra_price', true);
                        if (empty($extra_price)) {
                            return -1;
                        }
                    }
                }
            }
        }

        if ($extra_price > 0) {
            return $extra_price;
        }

        /* Handle holidays */
        $config_holidays = maybe_unserialize(get_option('zippy_booking_holiday_config'));

        $start_date = (new DateTime($data['booking_start_date']))->format('Y-m-d');
        if ($config_holidays && count($config_holidays)) {
            $filter = array_filter($config_holidays, function ($holiday) use ($start_date) {
                $compareDate = (new DateTime($holiday['date']))->format('Y-m-d');
                return $compareDate === $start_date;
            });
            if (count($filter) > 0) {
                $extra_price = get_post_meta($data['product_id'], '_extra_price', true);
                if (empty($extra_price)) {
                    return -1;
                }
            }
        }

        return $extra_price;
    }

    public static function handle_check_disabled_products()
    {
        global $wpdb;
        /**
         * get('order_mode') || Delivery || takeaway
         * get('date) => date
         * get('time) => delivery time || takeaway time
         * 
         */

        $session = new Zippy_Session_Handler();
        if (!$session->get('order_mode')) {

            $disabled_ids = self::handle_load_products();

            return $disabled_ids;
        }

        $order_date = $session->get('date');
        $order_date = new DateTime($order_date);

        $disabled_ids = self::handle_load_products($order_date);

        return $disabled_ids;
    }

    public static function handle_load_products($date = null)
    {

        $handle_date = $date ? $date : new DateTime();

        $menu = self::get_menu_for_date($handle_date->format('Y-m-d'));
        if (!$menu) {
            return [];
        }

        $is_disabled_date = self::is_disabled_date_in_menu($handle_date, $menu);

        $disabled_ids = self::get_disabled_ids($menu->id);

        if ($is_disabled_date) {
            return $disabled_ids;
        }

        if (!$date) {
            $is_happy_hours = self::is_in_happy_hours($handle_date, json_decode($menu->happy_hours));
            return $is_happy_hours ? [] : $disabled_ids;
        }

        return [];
    }

    public static function is_in_range_period_window($product_id)
    {
        if (empty($product_id) || is_admin()) {
            return false;
        }

        $session = new Zippy_Session_Handler();

        if (! $session->get('order_mode')) {
            return false;
        }

        // Period window (days)
        $period_window = (int) get_field('product_period_window', $product_id) ?? 2;

        $order_date_raw = $session->get('date');
        if (empty($order_date_raw)) {
            return false;
        }

        $timezone = wp_timezone();

        try {
            $order_date = new DateTime($order_date_raw, $timezone);
        } catch (Exception $e) {
            return false;
        }
        $period_window = $period_window - 1;
        $today = new DateTime('now', $timezone);
        $today->setTime(23, 59, 59);

        $period_date = (clone $today)->modify("+{$period_window} days");


        return $order_date <= $period_date;
    }


    public static function get_disabled_ids($menu_id)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'zippy_menu_products';

        $ids = $wpdb->get_col($wpdb->prepare("
            SELECT id_product FROM $table_name
            WHERE id_menu = %d 
        ", $menu_id));

        if ($ids) {
            return $ids;
        } else {
            return false;
        }
    }

    public static function is_in_happy_hours($time, $happy_hours)
    {
        if (count($happy_hours) == 0) {
            return false;
        }
        $formatted_time = DateTime::createFromFormat('H:i', $time->format('H:i'));

        foreach ($happy_hours as $happy_hour) {
            $happy_start =  DateTime::createFromFormat('H:i', $happy_hour->start_time);
            $happy_end =  DateTime::createFromFormat('H:i', $happy_hour->end_time);
            if ($formatted_time >= $happy_start && $formatted_time <= $happy_end) {
                return true;
            }
        }
        return false;
    }

    public static function get_order_datetime($order_date, $order_time)
    {
        $datetime_string = $order_date . ' ' . $order_time;
        $datetime = new DateTime($datetime_string);
        return $datetime;
    }

    public static function get_menu_for_date($check_date)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'zippy_menus';
        $date = date('Y-m-d', strtotime($check_date));
        // Query menus where date is within range
        $menu = $wpdb->get_row($wpdb->prepare("
            SELECT * FROM $table_name
            WHERE %s BETWEEN start_date AND end_date
            LIMIT 1
        ", $date));


        if ($menu) {
            return $menu;
        } else {
            return false;
        }
    }

    public static function get_happy_hour_slots($menu)
    {
        $results = [];

        if (empty($menu->happy_hours)) {
            return [];
        }

        foreach (json_decode($menu->happy_hours) as $slot) {
            $start_datetime = new DateTime($slot->start_time);
            $end_datetime = new DateTime($slot->end_time);
            $from = $start_datetime->format('H:i:s');
            $to = $end_datetime->format('H:i:s');
            $results[] = ['from' => $from, 'to' => $to];
        }

        return $results;
    }

    public static function is_disabled_date_in_menu($date, $menu)
    {
        $check_day = $date->format('w');
        $days_of_week = json_decode($menu->days_of_week, true);
        $match = current(array_filter($days_of_week, function ($dow) use ($check_day) {
            return $dow['weekday'] == $check_day;
        }));

        $isDisabled = $match['is_available'] == 0 ? true : false;

        return $isDisabled;
    }

    public static function sort_products_by_category($products)
    {
        usort($products, function ($a, $b) {
            $a_terms = wp_get_post_terms($a->get_id(), 'product_cat', ['orderby' => 'name']);
            $b_terms = wp_get_post_terms($b->get_id(), 'product_cat', ['orderby' => 'name']);

            $a_cat = !empty($a_terms) ? $a_terms[0]->name : '';
            $b_cat = !empty($b_terms) ? $b_terms[0]->name : '';

            $cmp = strcmp($a_cat, $b_cat);
            if ($cmp !== 0) {
                return $cmp;
            }
            return $a->get_menu_order() <=> $b->get_menu_order();
        });

        return $products;
    }

    public static function sort_cart_items_by_product_category($cart_items)
    {
        uasort($cart_items, function ($a, $b) {
            $productA = $a['data'];
            $productB = $b['data'];

            $a_terms = wp_get_post_terms($productA->get_id(), 'product_cat', ['orderby' => 'name']);
            $b_terms = wp_get_post_terms($productB->get_id(), 'product_cat', ['orderby' => 'name']);

            $a_cat = !empty($a_terms) ? $a_terms[0]->name : '';
            $b_cat = !empty($b_terms) ? $b_terms[0]->name : '';

            $cmp = strcmp($a_cat, $b_cat);
            if ($cmp !== 0) {
                return $cmp;
            }

            return $productA->get_menu_order() <=> $productB->get_menu_order();
        });

        return $cart_items;
    }

    public static function sort_order_items_by_product_category($order_items)
    {
        uasort($order_items, function ($a, $b) {
            $productA = $a->get_product();
            $productB = $b->get_product();

            $a_terms = wp_get_post_terms($productA->get_id(), 'product_cat', ['orderby' => 'name']);
            $b_terms = wp_get_post_terms($productB->get_id(), 'product_cat', ['orderby' => 'name']);

            $a_cat = !empty($a_terms) ? $a_terms[0]->name : '';
            $b_cat = !empty($b_terms) ? $b_terms[0]->name : '';

            $cmp = strcmp($a_cat, $b_cat);
            if ($cmp !== 0) {
                return $cmp;
            }

            return $productA->get_menu_order() <=> $productB->get_menu_order();
        });

        return $order_items;
    }
}
