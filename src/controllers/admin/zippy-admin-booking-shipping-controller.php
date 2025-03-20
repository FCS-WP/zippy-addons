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
