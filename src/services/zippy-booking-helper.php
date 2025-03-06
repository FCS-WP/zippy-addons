<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

use DateTime;

class Zippy_Booking_Helper
{
    public function handle_include_products($data_products, $table_name)
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

    public function filter_mapping_product($products)
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
    public function handle_extra_price($data)
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
}
