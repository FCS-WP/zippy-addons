<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
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
            "day_limited" => ["required" => true, "data_type" => "number"],
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
                "day_limited" => sanitize_text_field($request["day_limited"]),
            ];

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
            "day_limited" => ["required" => true, "data_type" => "number"],
            "outlet_address" => ["required" => true],
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
                "day_limited",
            ];

            $update_data = [];
            foreach ($update_fields as $field) {
                $update_data[$field] = sanitize_text_field($request[$field]);
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
}