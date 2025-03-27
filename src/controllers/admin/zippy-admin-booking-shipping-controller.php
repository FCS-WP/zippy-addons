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

            $insert_data = [
                "id" => wp_generate_uuid4(),
                "outlet_id" => $outlet_id,
                "minimum_order_to_delivery" => maybe_serialize($request["minimum_order_to_delivery"]),
                "minimum_order_to_freeship" => maybe_serialize($request["minimum_order_to_freeship"]),
                "extra_fee" => maybe_serialize($request["extra_fee"]),
            ];
            
            $insert_data["created_at"] = current_time('mysql');
            $insert_data["updated_at"] = current_time('mysql');

            $is_insert = $wpdb->insert($table_name, $insert_data);

            if($is_insert){
                return Zippy_Response_Handler::success($insert_data, "Oulet Updated");
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
