<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Models\Stores\Zippy_Stores_Model;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Store_Controller
{
    /**
     * Create a new store
     */
    public static function zippy_create_store(WP_REST_Request $request)
    {
        $required_fields = [
            "display" =>  ["required" => false, "data_type" => "boolean"],
            "outlet_name" => ["required" => true, "data_type" => "string"],
            "outlet_phone" => ["required" => false, "data_type" => "string"],
            "outlet_address" => ["required" => true],
            "type" => ["required" => true, "data_type" => "string"],
            "limit_order" => ["required" => false, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }


        try {
            /* insert data to config table */
            global $wpdb;
            $table_name = OUTLET_CONFIG_TABLE_NAME;


            $insert_data = [
                "id" => wp_generate_uuid4(),
                "display" => $request["display"],
                "outlet_name" => sanitize_text_field($request["outlet_name"]),
                "outlet_phone" => sanitize_text_field($request["outlet_phone"]),
                "outlet_address" => maybe_serialize($request["outlet_address"]),
                "start_date" => sanitize_text_field($request["start_date"]),
                "end_date" => sanitize_text_field($request["end_date"]),
                "limit_order" => sanitize_text_field($request["limit_order"]),
            ];

            $type = Zippy_Stores_Model::get_store_type_by_label(sanitize_text_field($request["type"]));
            if (!empty($type)) {
                $insert_data["type"] = $type;
            }

            $insert_data["created_at"] = current_time('mysql');
            $insert_data["updated_at"] = current_time('mysql');

            $is_insert = $wpdb->insert($table_name, $insert_data);
            if($is_insert){
                $insert_data["outlet_address"] = $request["outlet_address"];
                return Zippy_Response_Handler::success($insert_data, "Outlet created successfully.");
            }

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_store', json_encode($request), 'Failure', $message);
        }
    }

    public static function zippy_get_store(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" =>  ["required" => false, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $outlet_id = $request['outlet_id'];

        try {
            global $wpdb;
            $table_name = OUTLET_CONFIG_TABLE_NAME;
            if(!empty($outlet_id)){
                $query = "SELECT * FROM $table_name WHERE id ='" . $outlet_id . "'";
            } else {
                $query = "SELECT * FROM $table_name WHERE 1=1";
            }
            
            $outlets = $wpdb->get_results($query);

            if(count($outlets) < 1){
                return Zippy_Response_Handler::error("Outlet not exist");
            }


            foreach ($outlets as $key => $value) {
                $unserialze_fields = [
                    "outlet_address",
                    "operating_hours",
                    "closed_dates",
                    "takeaway",
                ];
                foreach ($unserialze_fields as $field) {
                    $outlets[$key]->{$field} = maybe_unserialize($outlets[$key]->{$field});
                }
            }

            return Zippy_Response_Handler::success($outlets, "Outlet");
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_store', json_encode(['store_id' => $outlet_id]), 'Failure', $message);
        }
    }

    public static function zippy_update_store(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"] ,
            "display" =>  ["required" => true, "data_type" => "boolean"],
            "outlet_name" => ["required" => true, "data_type" => "string"],
            "outlet_phone" => ["required" => false, "data_type" => "string"],
            "outlet_address" => ["required" => true],
            "type" => ["required" => true, "data_type" => "string"],
            "limit_order" => ["required" => false, "data_type" => "string"],
            "start_date" => ["required" => false, "data_type" => "string"],
            "end_date" => ["required" => false, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }


        try {

            global $wpdb;
            $table_name = OUTLET_CONFIG_TABLE_NAME;

            $outlet_id = $request['outlet_id'];
            $query = "SELECT id FROM $table_name WHERE id ='" . $outlet_id . "'";
            $is_outlet_exist = count($wpdb->get_results($query));
            if($is_outlet_exist < 1){
                return Zippy_Response_Handler::error("Outlet not exist!");
            }
            

            $update_fields = [   
                "display",
                "outlet_name",
                "outlet_phone",
                "limit_order",
                "start_date",
                "end_date",
            ];

            $update_data = [];
            foreach ($update_fields as $field) {
                $update_data[$field] = sanitize_text_field($request[$field]);
            }

            $type = Zippy_Stores_Model::get_store_type_by_label(sanitize_text_field($request["type"]));
            if (!empty($type)) {
                $update_data["type"] = $type;
            }

            $update_data["outlet_address"] = maybe_serialize($request['outlet_address']);
            $update_data["updated_at"] = current_time('mysql');

            $is_updated = $wpdb->update($table_name, $update_data, ["id" => $outlet_id]);

            if($is_updated){
                $update_data["outlet_address"] = $request["outlet_address"];
                return Zippy_Response_Handler::success($update_data, "Outlet Updated");
            }

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_store', json_encode($request), 'Failure', $message);
        }
    }
    public static function zippy_delete_store(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"] ,
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        try {
            global $wpdb;
            $table_name = OUTLET_CONFIG_TABLE_NAME;

            $outlet_id = $request['outlet_id'];
            $query = "SELECT id FROM $table_name WHERE id ='" . $outlet_id . "'";
            $is_outlet_exist = count($wpdb->get_results($query));
            if($is_outlet_exist < 1){
                return Zippy_Response_Handler::error("Outlet not exist!");
            }

            $is_deleted = $wpdb->delete( $table_name, ["id" => $outlet_id ] );

            if($is_deleted){
                $response_data = [
                    "outlet_id" => $outlet_id
                ];
                return Zippy_Response_Handler::success($response_data, "Outlet Deleted");
            }


        } catch (\Throwable $th) {
            $error_message = $th->getMessage();
            Zippy_Log_Action::log('delete_store', json_encode($request->get_params()), 'Failure', $error_message);
        }
    }

    public static function zippy_get_store_by_type(WP_REST_Request $request)
    {
        $required_fields = [
            "type" =>  ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $type = Zippy_Stores_Model::get_store_type_by_label(sanitize_text_field($request["type"]));

        try {
            global $wpdb;
            $table_name = OUTLET_CONFIG_TABLE_NAME;
            $query = $wpdb->prepare("SELECT * FROM $table_name WHERE type = %d", $type);
            $outlets = $wpdb->get_results($query);

            if (count($outlets) < 1) {
                return Zippy_Response_Handler::error("Outlet not exist");
            }

            $unserialize_fields = [
                "outlet_address",
                "operating_hours",
                "closed_dates",
                "takeaway",
            ];

            foreach ($outlets as $key => $outlet) {
                foreach ($outlet as $field => $value) {
                    if (in_array($field, $unserialize_fields, true)) {
                        $outlets[$key]->{$field} = maybe_unserialize($value);
                    }
                }
            }

            return Zippy_Response_Handler::success($outlets);
        } catch (\Throwable $th) {
            $error_message = $th->getMessage();
            Zippy_Log_Action::log('get_store_by_type', json_encode($request->get_params()), 'Failure', $error_message);
        }
    }

    public static function zippy_check_remain_order(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id"    => ["required" => true, "data_type" => "string"],
            "billing_date" => ["required" => true, "data_type" => "date"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $outlet_id    = sanitize_text_field($request['outlet_id']);
        $billing_date = sanitize_text_field($request['billing_date']);

        try {
            global $wpdb;

            // Lấy limit_order
            $table_outlet = OUTLET_CONFIG_TABLE_NAME;
            $limit_order  = $wpdb->get_var(
                $wpdb->prepare("SELECT limit_order FROM {$table_outlet} WHERE id = %s", $outlet_id)
            );

            if (is_null($limit_order)) {
                return Zippy_Response_Handler::error("Outlet not exist");
            }

            $limit_order = intval($limit_order);

            if ($limit_order <= 0) {
                return Zippy_Response_Handler::success(true, "No limit on orders for this outlet");
            }

            $orders_table = $wpdb->prefix . "wc_orders";
            $orders_meta_table = $wpdb->prefix . "wc_orders_meta";
            $count_query = $wpdb->prepare(
                "SELECT COUNT(*)
                FROM {$orders_table} o
                INNER JOIN {$orders_meta_table} om1 
                    ON o.id = om1.order_id AND om1.meta_key = '_outlet_id'
                INNER JOIN {$orders_meta_table} om2 
                    ON o.id = om2.order_id AND om2.meta_key = '_billing_date'
                WHERE om1.meta_value = %s
                AND om2.meta_value = %s
                AND o.status IN ('wc-processing','wc-completed')",
                $outlet_id,
                $billing_date
            );

            $order_count = intval($wpdb->get_var($count_query));

            if ($order_count >= $limit_order) {
                return Zippy_Response_Handler::success(false, "Order limit reached for this outlet on the selected date");
            }

            return Zippy_Response_Handler::success(true, "Orders can still be placed for this outlet on the selected date");
        } catch (\Throwable $th) {
            Zippy_Log_Action::log(
                'check_remain_order',
                json_encode($request->get_params()),
                'Failure',
                $th->getMessage()
            );
            return Zippy_Response_Handler::error("Internal server error");
        }
    }
}