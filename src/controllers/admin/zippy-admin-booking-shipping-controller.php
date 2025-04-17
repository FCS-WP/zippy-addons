<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\One_Map_Api;
use DateTime;

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
            "product_id" => ["required" => true, "data_type" => "number"],
            "billing_date" => ["required" => true, "data_type" => "date"],
            "billing_time" => ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }


        $outlet_id = $request["outlet_id"];
        $product_id   = $request->get_param( 'product_id' );
        $billing_date = $request->get_param( 'billing_date' );
        $billing_time = $request->get_param( 'billing_time' );
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

            $order_ids = $wpdb->get_col(
                "SELECT DISTINCT order_id
                FROM {$wpdb->prefix}woocommerce_order_items AS oi
                INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta AS oim ON oi.order_item_id = oim.order_item_id
                WHERE oi.order_item_type = 'line_item'
                AND oim.meta_key = '_product_id'
                AND oim.meta_value = $product_id"
            );

            $orders = []; 

            if (!empty($order_ids)) {
                $orders = wc_get_orders([
                    'status' => "wc-processing",
                    'limit' => -1,
                    'post__in' => $order_ids,
                    'meta_query' => [
                        [
                            'key' => '_billing_date',
                            'value' => $billing_date,
                            'compare' => '='
                        ],
                        [
                            'key' => '_billing_time',
                            'value' => $billing_time,
                            'compare' => '='
                        ]
                    ]
                ]);          
            }

            if(empty($orders)){
                return Zippy_Response_Handler::error('No order found!');
            }

            foreach ($orders as $order) {
                $order_billing_date = $order->get_meta('_billing_date');
                $order_billing_time = $order->get_meta('_billing_time');
    
                // _billing_date to week_day
                $order_date_obj = DateTime::createFromFormat('Y-m-d', $order_billing_date);
                if ($order_date_obj) {
                    $order_week_day = $order_date_obj->format('w');
                }
    
                // _billing_time to {from, to}
                if (preg_match('/From (\d{2}:\d{2}):\d{2} To (\d{2}:\d{2}):\d{2}/', $order_billing_time, $matches)) {
                    $order_time_slot = [
                        'from' => $matches[1], // HH:MM
                        'to' => $matches[2]    // HH:MM
                    ];
                }

                // compare with operating_hours
                foreach ($operating_hours as &$day) {
                    if ($day['week_day'] == $order_week_day) {
                        // compare with delivery_hours
                        foreach ($day['delivery']['delivery_hours'] as &$slot) {
                            if ($slot['from'] === $order_time_slot['from'] && $slot['to'] === $order_time_slot['to']) {
                                // -1 delivery_slot
                                $current_slot = (int)$slot['delivery_slot'];
                                if ($current_slot > 0) {
                                    $slot['delivery_slot'] = (string)($current_slot - 1);
                                }
                            }
                        }
                    }
                }
                unset($day, $slot);
            }

            $filtered_hours = null;
            foreach ($operating_hours as $day) {
                if ($day['week_day'] == $week_day) {
                    $filtered_hours = $day;
                    break;
                }
            }

            if ($filtered_hours === null) {
                return Zippy_Response_Handler::error('No operating hours found for the specified date');
            }

            return Zippy_Response_Handler::success($filtered_hours);
        } catch (\Throwable $th) {
            
        }
    }
}