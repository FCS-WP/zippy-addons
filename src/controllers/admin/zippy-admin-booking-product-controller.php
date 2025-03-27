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
use Zippy_Booking\Src\Services\One_Map_Api;

defined('ABSPATH') or die();



class Zippy_Admin_Booking_Product_Controller
{
    public static function add_product_and_shipping_info_to_card(WP_REST_Request $request)
    {

        $required_fields = [
            "product_id" => ["required" => true, "data_type" => "string"],
            "order_mode" => ["required" => true, "data_type" => "range", "allowed_values" => ["delivery", "takeaway"]],
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "date" => ["required" => true, "data_type" => "string"],
            "time" => ["required" => true],
        ];

        $order_mode = strtolower($request["order_mode"]);

        if ($order_mode == "delivery") {
            $required_fields["delivery_address"] = ["required" => true];
        }

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }


        $stored_fields = [
            "product_id",
            "quantity",
            "order_mode",
            "date",
            "time"
        ];

        try {
            global $wpdb;
            $table_name = OUTLET_CONFIG_TABLE_NAME;

            // check outlet exist
            $outlet_id = $request['outlet_id'];
            $query = "SELECT id,outlet_name,outlet_address FROM $table_name WHERE id ='" . $outlet_id . "'";
            $outlet = $wpdb->get_results($query);

            if (count($outlet) < 1) {
                return Zippy_Response_Handler::error("Outlet not exist!");
            }

            $outlet_address = $outlet[0]->outlet_address;
            $outlet_address = maybe_unserialize($outlet_address);
            $outlet_address_name = $outlet_address["address"] ?? null;
            $outlet_address_lat = $outlet_address["coordinates"]["lat"] ?? null;
            $outlet_address_lng = $outlet_address["coordinates"]["lng"] ?? null;
            if (empty($outlet_address_lat) || empty($outlet_address_lng)) {
                return Zippy_Response_Handler::error("This Outlet does not have address yet!");
            }

            array_push($stored_fields, "outlet_name");


            // Check for product exist
            $product_id = $request["product_id"];

            $_product = wc_get_product($product_id);

            if (!$_product) {
                return Zippy_Response_Handler::error("Product not exist!");
            }

            $store_datas = [];

            if ($order_mode == "delivery") {
                // delivery fields
                $fields = [
                    "total_distance",
                    "shipping_fee",
                    "address_name",
                ];

                foreach ($fields as $field) {
                    array_push($stored_fields, $field);
                }

                // Call Api to get distance between outlet and delivery address
                $param = [
                    "start" => $outlet_address["coordinates"]["lat"] . "," . $outlet_address["coordinates"]["lng"],
                    "end" => $request["delivery_address"]["lat"] . "," . $request["delivery_address"]["lng"],
                    "routeType" => "drive",
                    "mode" => "TRANSIT",
                ];

                $api = One_Map_Api::get("/api/public/routingsvc/route", $param);

                if (isset($api["error"])) {
                    return Zippy_Response_Handler::error($api["error"]);
                }

                $total_distance = $api["route_summary"]["total_distance"];


                // Get Shipping Config
                $shipping_fee_config = get_option(SHIPPING_CONFIG_META_KEY);
                if (empty($shipping_fee_config)) {
                    return Zippy_Response_Handler::error("Missing Config for Shipping Fee");
                }

                $shipping_fee_data = maybe_unserialize($shipping_fee_config)["shipping_fee"];

                // Calculate shipping fee
                $shipping_fee = "";
                foreach ($shipping_fee_data as $data) {
                    if ($total_distance > $data["from"] && $total_distance <= $data["to"]) {
                        $shipping_fee = $data["value"];
                    }
                }
                $store_datas["shipping_fee"] = $shipping_fee;
                $store_datas["total_distance"] = $total_distance;
            }


            // Parse data
            foreach ($stored_fields as $value) {
                if (!empty($request[$value])) {
                    $store_datas[$value] = $request[$value];
                }
            }

            $store_datas["delivery_address"] = $request["delivery_address"]["address_name"] ?? null;
            $store_datas["outlet_name"] = $outlet[0]->outlet_name;
            $store_datas["outlet_address"] = $outlet_address_name;

            // Store data to Session
            foreach ($store_datas as $key => $value) {
                $_SESSION[$key] = $value;
            }
            $_SESSION['status_popup'] = true;

            return Zippy_Response_Handler::success($store_datas, "Product added to cart");
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('calculate_shipping_fee', json_encode($request), 'Failure', $message);
        }
    }
}