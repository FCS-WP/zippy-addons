<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;

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

        $shipping_fee_config = $request["request"];
        $request["updated_at"] = current_time("mysql");

        try {
            /* insert data to config table */
            $is_update_options = update_option("_zippy_addons_shipping_fee_config", maybe_serialize($request));
            if($is_update_options){
                return Zippy_Response_Handler::success($request, "Outlet created successfully.");
            }

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }

    public static function get_shipping_config(WP_REST_Request $request)
    {

        $required_fields = [
            "request" => ["required" => true, "data_type" => "array"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $shipping_fee_config = $request["request"];
        $request["updated_at"] = current_time("mysql");

        try {
            /* insert data to config table */
            $is_update_options = update_option("_zippy_addons_shipping_fee_config", maybe_serialize($request));
            if($is_update_options){
                return Zippy_Response_Handler::success($request, "Outlet created successfully.");
            }

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }
}
