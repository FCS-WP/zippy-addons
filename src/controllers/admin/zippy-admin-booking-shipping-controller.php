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
            "request" => ["required" => true, "data_type" => "array"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $shipping_fee_config["shipping_fee"] = $request["request"];
        $shipping_fee_config["updated_at"] = current_time("mysql");

        try {
            /* insert data to config table */
            $is_update_options = update_option(SHIPPING_CONFIG_META_KEY, maybe_serialize($shipping_fee_config));
            if($is_update_options){
                return Zippy_Response_Handler::success($shipping_fee_config, "Shipping fee config create successfully");
            }
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }

    public static function get_shipping_config(WP_REST_Request $request)
    {
        try {
            /* insert data to config table */
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


    public static function calculate_shipping_fee(WP_REST_Request $request)
    {
        $required_fields = [
            "start" => ["required" => true, "data_type" => "string"],
            "end" => ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        try {
            // Get Shipping Config
            $shipping_fee_config = get_option(SHIPPING_CONFIG_META_KEY);
            if(empty($shipping_fee_config)){
                return Zippy_Response_Handler::error("Missing Config for Shipping Fee");
            }

            $res_data = [
                "start_point" => "",
                "end_point" => "",
                "total_distance" => "",
                "shipping_fee" => "",
            ];

            $param = [
                "start" => $request["start"],
                "end" => $request["end"],
                "routeType" => "drive",
                "mode" => "TRANSIT",
            ];

            $api = One_Map_Api::call("GET", "/api/public/routingsvc/route", $param);

            if($api["error"]){
                return Zippy_Response_Handler::error($api["error"]);
            }

            $route_summary = $api["route_summary"];

            $total_distance = $route_summary["total_distance"];

            $res_data["start_point"] = $route_summary["start_point"];
            $res_data["end_point"] = $route_summary["end_point"];
            $res_data["total_distance"] = $total_distance;


            $shipping_fee_data = maybe_unserialize($shipping_fee_config)["shipping_fee"];

            foreach ($shipping_fee_data as $data) {
                if($total_distance > $data["from"] && $total_distance <= $data["to"]){
                    $res_data["shipping_fee"] = $data["value"];
                    $_SESSION["SHIPPING_FEE"] = $res_data;
                }
            }

            return Zippy_Response_Handler::success($res_data, "Success");

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('calculate_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }
}
