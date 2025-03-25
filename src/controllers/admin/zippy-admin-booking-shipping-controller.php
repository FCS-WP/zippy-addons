<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\One_Map_Api;

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
            "minimum_total_to_shipping" => ["required" => false, "data_type" => "number"],
            "config" => ["required" => true, "data_type" => "array"],
        ];


        $config_require_fields = [
            "min_distance" => ["required" => true, "data_type" => "number"],
            "max_distance" => ["required" => true, "data_type" => "number"],
            "shipping_fee" => ["required" => true, "data_type" => "number"],
        ];

        foreach ($request as $key => $value) {
            $validate = Zippy_Request_Validation::validate_request($required_fields, $value);
            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }

            // validate shipping config
            $shipping_config = $value["config"];
            foreach ($shipping_config as $index => $val) {
                $config_validate = Zippy_Request_Validation::validate_request($config_require_fields, $val);
                if (!empty($config_validate)) {
                    return Zippy_Response_Handler::error($config_validate);
                }
            }
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


            $update_data = [
                "minimum_total_to_shipping" => $request["minimum_total_to_shipping"],
                "shipping_config" => maybe_serialize($request["config"]),
            ];
            
            $update_data["updated_at"] = current_time('mysql');

            $is_updated = $wpdb->update($table_name, $update_data, ["id" => $outlet_id]);

            if($is_updated){
                $update_data["outlet_id"] = $outlet_id;
                $update_data["shipping_config"] = $request["config"];
                return Zippy_Response_Handler::success($update_data, "Oulet Updated");
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

        foreach ($request as $key => $value) {
            $validate = Zippy_Request_Validation::validate_request($required_fields, $value);
            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }
        }

        try {
            global $wpdb;
            $table_name = OUTLET_CONFIG_TABLE_NAME;

            $outlet_id = $request['outlet_id'];
            $query = "SELECT id,minimum_total_to_shipping,shipping_config FROM $table_name WHERE id ='" . $outlet_id . "'";
            $outlet = $wpdb->get_results($query);
            if(count($outlet) < 1){
                return Zippy_Response_Handler::error("Outlet not exist!");
            } 
            $outlet[0]->shipping_config = maybe_unserialize($outlet[0]->shipping_config);
            
            return Zippy_Response_Handler::success($outlet[0], "Success");

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }
}
