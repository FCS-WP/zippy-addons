<?php

/**
 * Admin Booking Controller
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use DateTime;
use Zippy_Booking\Utils\Zippy_Utils_Core;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();



class Zippy_Admin_Booking_Product_Controller
{
    public static function add_product_and_shipping_info_to_card(WP_REST_Request $request)
    {
        $required_fields = [
            "product_id" => ["required" => true, "data_type" => "string"],
            "order_mode" => ["required" => true, "data_type" => "range", "allowed_values" => ["delivery", "takeaway"]],
            "delivery_address" => ["required" => true, "data_type" => "string"],
            "delivery_from" => ["required" => true, "data_type" => "string"],
            "delivery_date" => ["required" => true, "data_type" => "string"],
            "delivery_time" => ["required" => true, "data_type" => "string"],
            "total_distance" => ["required" => true, "data_type" => "string"],
            "shipping_fee" => ["required" => true, "data_type" => "number"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $product_id = $request["product_id"];

        $_product = wc_get_product($product_id);
        
        if(!$_product){
            return Zippy_Response_Handler::error("Product not exist!");
        }

        $store_datas = [];

        $stored_fields = [
            "product_id",
            "order_mode",
            "delivery_address",
            "delivery_from",
            "delivery_date",
            "delivery_time",
            "total_distance",
            "shipping_fee",
        ];

        foreach ($stored_fields as $value) {
            if(!empty($request[$value])) {
                $store_datas[$value] = $request[$value];
            }
        }

        foreach ($store_datas as $key => $value) {
            $_SESSION[$key] = $value;
        }

        return Zippy_Response_Handler::success($store_datas, "Product added to cart");
    }
}