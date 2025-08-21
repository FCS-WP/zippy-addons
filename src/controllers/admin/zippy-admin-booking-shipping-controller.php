<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\One_Map_Api;
use DateTime;
use WP_Query;
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;

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

            $response_data = [
                "outlet_id" => $outlet_id,
                "delivery_type" => $delivery_type,
                "time" => [
                    "id" => $delivery_time[0]["id"],
                    "week_day" => $week_day,
                    "time_slot" => []
                ]
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
}
