<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;
use DateTime;
use Zippy_Booking\Src\Services\Price_Books\Price_Books_Helper;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Shipping_Controller
{
    /**
     * Create a new store
     */
    public static function create_shipping_config(WP_REST_Request $request)
    {

        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "minimum_order_to_delivery" => ["required" => false, "data_type" => "array"],
            "minimum_order_to_freeship" => ["required" => true, "data_type" => "array"],
            "extra_fee" => ["required" => false, "data_type" => "array"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }


        try {

            $outlet_id = $request["outlet_id"];

            global $wpdb;
            $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;
            if (!empty($outlet_id)) {
                $query = "SELECT * FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
            }

            $outlet = count($wpdb->get_results($query));

            if ($outlet < 1) {
                return Zippy_Response_Handler::error("Outlet not exist");
            }


            $table_name = OUTLET_SHIPPING_CONFIG_TABLE_NAME;

            $outlet_shipping_config_table_name = OUTLET_SHIPPING_CONFIG_TABLE_NAME;

            if (!empty($outlet_id)) {
                $query = "SELECT * FROM $outlet_shipping_config_table_name WHERE outlet_id ='" . $outlet_id . "'";
            }

            $outlet = count($wpdb->get_results($query));

            if ($outlet < 1) {
                $insert_data = [
                    "id" => wp_generate_uuid4(),
                    "outlet_id" => $outlet_id,
                    "minimum_order_to_delivery" => maybe_serialize($request["minimum_order_to_delivery"]),
                    "minimum_order_to_freeship" => maybe_serialize($request["minimum_order_to_freeship"]),
                    "extra_fee" => maybe_serialize($request["extra_fee"]),
                    "created_at" => current_time("mysql"),
                    "updated_at" => current_time("mysql"),
                ];

                $is_insert = $wpdb->insert($table_name, $insert_data);
                if ($is_insert) {
                    return Zippy_Response_Handler::success($insert_data, "Shipping Config Inserted");
                }
            } else {
                $update_data = [
                    "outlet_id" => $outlet_id,
                    "minimum_order_to_delivery" => maybe_serialize($request["minimum_order_to_delivery"]),
                    "minimum_order_to_freeship" => maybe_serialize($request["minimum_order_to_freeship"]),
                    "extra_fee" => maybe_serialize($request["extra_fee"]),
                    "updated_at" => current_time('mysql')
                ];

                $is_updated = $wpdb->update($outlet_shipping_config_table_name, $update_data, ["outlet_id" => $outlet_id]);

                if ($is_updated) {
                    return Zippy_Response_Handler::success($update_data, "Shipping Config Updated");
                }
            }
        } catch (\Throwable $th) {

            $message = $th->getMessage();
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }

    public static function get_shipping_config(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        try {

            $outlet_id = $request["outlet_id"];

            global $wpdb;
            $outlet_table_name = OUTLET_SHIPPING_CONFIG_TABLE_NAME;
            if (!empty($outlet_id)) {
                $query = "SELECT * FROM $outlet_table_name WHERE outlet_id ='" . $outlet_id . "'";
            }

            $outlet = $wpdb->get_results($query);

            if (count($outlet) < 1) {
                return Zippy_Response_Handler::error("Outlet not exist");
            }

            $outlet[0]->minimum_order_to_delivery = maybe_unserialize($outlet[0]->minimum_order_to_delivery);
            $outlet[0]->minimum_order_to_freeship = maybe_unserialize($outlet[0]->minimum_order_to_freeship);
            $outlet[0]->extra_fee = maybe_unserialize($outlet[0]->extra_fee);

            return Zippy_Response_Handler::success($outlet[0], "Success");
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }

    public static function delete_shipping_config(WP_REST_Request $request)
    {
        $required_fields = [
            "id" => ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        try {

            $shipping_id = $request["id"];

            global $wpdb;
            $shiping_table_name = OUTLET_SHIPPING_CONFIG_TABLE_NAME;

            if (!empty($shipping_id)) {
                $query = "SELECT * FROM $shiping_table_name WHERE id ='" . $shipping_id . "'";
            }

            if (count($wpdb->get_results($query)) < 1) {
                return Zippy_Response_Handler::error("Shipping not exist");
            }

            $is_deleted = $wpdb->delete($shiping_table_name, ["id" => $shipping_id]);

            if ($is_deleted) {
                return Zippy_Response_Handler::success("Success");
            }
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }


    public static function check_for_remaining_slots(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "billing_date" => ["required" => true, "data_type" => "date"],
            "delivery_type" => ["required" => true, "data_type" => "range", "allowed_values" => ["delivery", "takeaway"]],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $outlet_id = $request["outlet_id"];
        $product_id = $request["product_id"];
        $billing_date = $request->get_param('billing_date');
        $delivery_type = $request->get_param("delivery_type");
        $date_obj = DateTime::createFromFormat('Y-m-d', $billing_date);
        $week_day = $date_obj->format('w'); // 0 (Sun) -> 6 (Sat)


        $billing_time_regex = '/\b\d{1,2}:\d{2}(?::\d{2})?\b/';

        try {
            global $wpdb;

            $delivery_time_table = $wpdb->prefix . 'zippy_addons_delivery_times';
            $time_slot_table = $wpdb->prefix . 'zippy_addons_delivery_time_slots';

            // check if outlet exist
            $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;
            $query = "SELECT * FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
            $outlets = $wpdb->get_results($query);

            if (count($outlets) < 1) {
                return Zippy_Response_Handler::error("Outlet not exist");
            }


            // Get orders by billing_date
            $args = array(
                'status' => array('wc-pending', 'wc-processing'),
                'limit' => -1
            );

            $orders = wc_get_orders($args);

            $delivery_time = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id FROM $delivery_time_table WHERE outlet_id = %s AND delivery_type = %s AND week_day = %s",
                    $outlet_id,
                    $delivery_type,
                    $week_day,
                ),
                ARRAY_A
            );

            if (empty($delivery_time)) {
                return Zippy_Response_Handler::success([], 'No config found');
            }

            $slots = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $time_slot_table WHERE delivery_time_id = %s ORDER BY created_at ASC",
                    $delivery_time[0]["id"]
                ),
                ARRAY_A
            );

            $pricing_rule = self::product_checking_pricing_rule($product_id, $billing_date);

            $response_data = [
                "outlet_id" => $outlet_id,
                "delivery_type" => $delivery_type,
                "time" => [
                    "id" => $delivery_time[0]["id"],
                    "week_day" => $week_day,
                    "time_slot" => []
                ],
                "pricing_rule" => $pricing_rule
            ];

            // Calculate delivery_slot
            foreach ($orders as $order) {
                $order_billing_date = $order->get_meta('_billing_date');
                $order_billing_time = $order->get_meta('_billing_time');
                if ($order_billing_time !== "" && $order_billing_date == $billing_date) {
                    preg_match_all($billing_time_regex, $order_billing_time, $matches);
                    $from = $matches[0][0];
                    $to = $matches[0][1];
                    foreach ($slots as $key => $slot) {
                        if ($slot["time_from"] == $from && $slot["time_to"] == $to) {
                            $current_slot = $slots[$key]["delivery_slot"];
                            $slots[$key]["delivery_slot"] = (string) ($current_slot - 1);
                        }
                    }
                }
            }
            $response_data["time"]["time_slot"] = $slots;
            return Zippy_Response_Handler::success($response_data);
        } catch (\Throwable $th) {
            return Zippy_Response_Handler::error("An error occurred: " . $th->getMessage());
        }
    }

    /**
     *  PRODUCTS PRICING CHECKING
     */

    private static function product_checking_pricing_rule($product_id, $billing_date)
    {
        $helper = new Price_Books_Helper();

        $info = $helper->get_preorder_price_info($product_id, $billing_date);

        return $info;
    }
    /**
     *  PRODUCTS PRICING CHECKING
     */

    // private static function product_checking_pricing_rule($product_id, $billing_date)
    // {
    //     global $wpdb;

    //     $current_user = wp_get_current_user();
    //     $user_roles   = $current_user->roles;

    //     $checking_timestamp = strtotime($billing_date);

    //     if (false === $checking_timestamp) {
    //         return [];
    //     }

    //     $query = "
    //         SELECT id, additional, product_adjustments, role_discounts, filters, priority
    //         FROM {$wpdb->prefix}wdp_rules
    //         WHERE deleted = 0 AND enabled = 1
    //         ORDER BY priority DESC;
    //     ";

    //     $results = $wpdb->get_results($query);

    //     if (empty($results)) {
    //         return [];
    //     }


    //     foreach ($results as $row) {
    //         // Unserialize data once per row
    //         $rule                = maybe_unserialize($row->additional);
    //         $product_adjustments = maybe_unserialize($row->product_adjustments);
    //         $role_discounts      = maybe_unserialize($row->role_discounts);
    //         $filters_data        = maybe_unserialize($row->filters);

    //         if (! empty($rule['date_from']) && ! empty($rule['date_to'])) {
    //             $date_from_ts = strtotime($rule['date_from']);
    //             $date_to_ts   = strtotime($rule['date_to']);

    //             if ($checking_timestamp >= $date_from_ts && $checking_timestamp <= $date_to_ts) {

    //                 $is_product_matched = false;

    //                 $product_filter = ! empty($filters_data[0]) ? $filters_data[0] : null;

    //                 if ($product_filter && $product_filter['type'] === 'products') {
    //                     $product_matched_ids = ! empty($product_filter['value']) ? $product_filter['value'] : [];

    //                     // Check if the product ID is in the list of matched product IDs
    //                     if (is_array($product_matched_ids) && in_array($product_id, $product_matched_ids)) {
    //                         $is_product_matched = true;
    //                     }
    //                 }

    //                 if ($is_product_matched) {
    //                     $discounts = null;

    //                     $role_rows = ! empty($role_discounts['rows']) ? $role_discounts['rows'] : [];

    //                     foreach ($role_rows as $role_row) {
    //                         $required_roles = ! empty($role_row['roles']) ? $role_row['roles'] : [];

    //                         // Check if the current user has ANY of the roles required by this role discount row
    //                         if (! empty($required_roles) && array_intersect($user_roles, $required_roles)) {
    //                             $discounts = $role_row;
    //                             break; // Found the first matching role discount row (usually only one per rule)
    //                         }
    //                     }

    //                     if ($discounts) {
    //                         // Role discount found and applied
    //                         return self::convert_data_for_response($row->id, $discounts, $rule);
    //                     } else {
    //                         // No matching role discount found, fall back to product adjustment if it exists.
    //                         // Assuming 'product_adjustments' is the fallback discount if no role matches.
    //                         if (! empty($product_adjustments && $product_adjustments['total']['value'])) {
    //                             return self::convert_data_for_response($row->id, $product_adjustments, $rule);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     return [];
    // }

    /**
     * Converts raw rule data into a standardized response array.
     */
    private static function convert_data_for_response($id, $discounts, $rule)
    {
        $discount_value = 0;
        if (isset($discounts['discount_value'])) {
            // Structure for role discounts
            $discount_value = $discounts['discount_value'];
        } elseif (isset($discounts['total']['value'])) {
            // Structure for product/cart adjustments
            $discount_value = $discounts['total']['value'];
        }

        return [
            'id'    => $id,
            'total' => $discount_value,
            'from'  => isset($rule['date_from']) ? $rule['date_from'] : '',
            'to'    => isset($rule['date_to']) ? $rule['date_to'] : '',
        ];
    }
}
