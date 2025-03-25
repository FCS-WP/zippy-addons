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
            "config" => ["required" => true],
        ];


        foreach ($request["shipping"] as $key => $value) {
            $validate = Zippy_Request_Validation::validate_request($required_fields, $value);
            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }
        }

        $request = $request["shipping"];

        $fields = [
            "outlet_id",
            "minimum_total_to_shipping",
        ];

        $insert_data = [];


        try {

            global $wpdb;
            $table_name = OUTLET_TABLE_NAME;
            
            foreach ($request as $key => $value) {
                $outlet_id = $value["outlet_id"];
                $query = "SELECT * FROM $table_name WHERE id ='" . $outlet_id . "'";             
                $outlets = $wpdb->get_results($query);
                if(count($outlets) < 1){
                    return Zippy_Response_Handler::error("outlet_id: $outlet_id not exist!");
                }
                
                foreach ($fields as $key => $field) {
                    if(!empty($value[$field])){
                        $insert_data[][] = $value[$field];
                    }
                }               
                

            }

            return $insert_data;
            

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
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }

        // $required_fields = [
        //     "request" => ["required" => true, "data_type" => "array"],
        // ];

        // $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        // if (!empty($validate)) {
        //     return Zippy_Response_Handler::error($validate);
        // }

        // $shipping_fee_config["shipping_fee"] = $request["request"];
        // $shipping_fee_config["updated_at"] = current_time("mysql");
    }

    public static function get_shipping_config(WP_REST_Request $request)
    {
        try {
            $options = get_option(SHIPPING_CONFIG_META_KEY);

            if($options){
                $options = maybe_unserialize($options);
                unset($options["updated_at"]);
                return Zippy_Response_Handler::success($options, "Success");
            } else {
                return Zippy_Response_Handler::error("No config found");
            }

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }
}
