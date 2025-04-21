<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\One_Map_Api;
use DateTime;
use WP_Query;

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
            if(!empty($outlet_id)){
                $query = "SELECT * FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
            }
            
            $outlet = count($wpdb->get_results($query));

            if($outlet < 1){
                return Zippy_Response_Handler::error("Outlet not exist");
            }


            $table_name = OUTLET_SHIPPING_CONFIG_TABLE_NAME;

            $outlet_shipping_config_table_name = OUTLET_SHIPPING_CONFIG_TABLE_NAME;
            
            if(!empty($outlet_id)){
                $query = "SELECT * FROM $outlet_shipping_config_table_name WHERE outlet_id ='" . $outlet_id . "'";
            }
            
            $outlet = count($wpdb->get_results($query));

            if($outlet < 1){
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
                if($is_insert){
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
               
                if($is_updated){
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
            if(!empty($outlet_id)){
                $query = "SELECT * FROM $outlet_table_name WHERE outlet_id ='" . $outlet_id . "'";
            }
            
            $outlet = $wpdb->get_results($query);

            if(count($outlet) < 1){
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

            if(!empty($shipping_id)){
                $query = "SELECT * FROM $shiping_table_name WHERE id ='" . $shipping_id . "'";
            }

            if(count($wpdb->get_results($query)) < 1){
                return Zippy_Response_Handler::error("Shipping not exist");
            }

            $is_deleted = $wpdb->delete( $shiping_table_name, ["id" => $shipping_id ] );

            if($is_deleted){
                return Zippy_Response_Handler::success("Success");
            }

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }



    public static function check_for_remaining_slots(WP_REST_Request $request){
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "billing_date" => ["required" => true, "data_type" => "date"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }


        $outlet_id = $request["outlet_id"];
        $billing_date = $request->get_param( 'billing_date' );
        $date_obj = DateTime::createFromFormat('Y-m-d', $billing_date);
        $week_day = $date_obj->format('w'); // 0 (Sun) -> 6 (Sat)

        try {
            global $wpdb;
            
            // check if outlet exist
            $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;
            $query = "SELECT * FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
            $outlets = $wpdb->get_results($query);

            if(count($outlets) < 1){
                return Zippy_Response_Handler::error("Outlet not exist");
            }

            $operating_hours = maybe_unserialize($outlets[0]->operating_hours);

            if(empty($operating_hours)){
                return Zippy_Response_Handler::error("Operating hour config not Exist!");
            }


            $day_hours = null;
            foreach ($operating_hours as $day) {
                if ($day["week_day"] == $week_day) {
                    $day_hours = $day;
                    break;
                }
            }

            if ($day_hours == null) {
                return Zippy_Response_Handler::error("No operating hours found for the specified date");
            }

            // Parse config slot to "From ... To ..." format
            $config_slot_arr = [];
            $delivery_hours = $day_hours["delivery"]["delivery_hours"];
            foreach ($delivery_hours as $slot) {
                $config_slot = "From " . $slot["from"] . " To " . $slot["to"];
                $config_slot_arr[] = $config_slot;
            }

            // Get orders by billing_date
            $args = [
                "post_type" => "shop_order_placehold",
                "post_status" => "any",
                "meta_query" => [
                    [
                        "key" => "_billing_date",
                        "value" => $billing_date,
                        "compare" => "="
                    ]
                ],
                "posts_per_page" => -1,
            ];
    
            $query = new WP_Query($args);

            $orders = $query->posts;


            $allowed_status = [
                "pending",
                "processing"
            ];
            
            // Calculate delivery_slot
            foreach ($orders as $order) {
                $order_id = $order->ID;
                $order = wc_get_order( $order_id );
                $order_billing_time = get_post_meta($order_id, "_billing_time", true);

                if (array_keys($config_slot_arr, $order_billing_time) && in_array($order->get_status(), $allowed_status)) {
                    $key = array_keys($config_slot_arr, $order_billing_time)[0];
                    $current_slot = $delivery_hours[$key]["delivery_slot"];

                    // -1 delivery_slot
                    if ($current_slot > 0) {
                        $delivery_hours[$key]["delivery_slot"] = (string)($current_slot - 1);
                    }
                }
            }


            // Parse response_data
            $response_data = [];

            foreach ($delivery_hours as $slot) {
                $response_data[] = [
                    "from" => $slot["from"],
                    "to"=> $slot["to"],
                    "remaining_slot" => $slot["delivery_slot"],
                ];
            }

            return Zippy_Response_Handler::success(["delivery_hours" => $response_data]);
        } catch (\Throwable $th) {
            return Zippy_Response_Handler::error("An error occurred: " . $th->getMessage());
        }
    }
}