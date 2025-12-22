<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\One_Map_Api;
use Zippy_Booking\Utils\Zippy_Session_Handler;
use Zippy_Booking\Utils\Zippy_Cart_Handler;
use Zippy_Booking\Src\Services\Zippy_Handle_Shipping;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Product_Controller
{
    const MAX_DISTANCE = 9999999;

    public static function add_product_and_shipping_info_to_card(WP_REST_Request $request)
    {
        try {
            $order_mode = strtolower($request["order_mode"] ?? '');
            $validation = self::validate_required_fields($request, $order_mode);
            if (!empty($validation)) {
                return Zippy_Response_Handler::error($validation);
            }

            $outlet = self::get_outlet($request['outlet_id']);
            if (!$outlet) {
                return Zippy_Response_Handler::error("Outlet not exist!");
            }

            $_product = wc_get_product($request["product_id"]);

            if (!$_product) {
                return Zippy_Response_Handler::error("Product not exist!");
            }

            $outlet_address = maybe_unserialize($outlet->outlet_address);
            $lat = $outlet_address["coordinates"]["lat"] ?? null;
            $lng = $outlet_address["coordinates"]["lng"] ?? null;

            if (empty($lat) || empty($lng)) {
                return Zippy_Response_Handler::error("This Outlet does not have address yet!");
            }

            $session_data = self::extract_common_data($request);

            $session_data["outlet_name"] = $outlet->outlet_name;
            $session_data["outlet_address"] = $outlet_address["address"] ?? null;

            if ($order_mode === 'delivery') {

                $delivery_info = self::calculate_shipping_fee($request["delivery_address"], $lat, $lng, $request['outlet_id']);
                $delivery_obj = $request["delivery_address"] ?? null;
                if (isset($delivery_info['error'])) {
                    return Zippy_Response_Handler::error($delivery_info['error']);
                }
                $session_data = array_merge($session_data, $delivery_info, $delivery_obj);
            }

            self::store_to_session($session_data);
            $cart = new Zippy_Cart_Handler;
            $min_qty = get_post_meta($_product->get_id(), '_custom_minimum_order_qty', true);

            $min_qty = $min_qty ? intval($min_qty) : 1;
            $stock_quantity = $_product->get_stock_quantity();
            $qty_add_to_cart = $stock_quantity < $min_qty ? $stock_quantity : $min_qty;
            if (floatval($_product->get_price()) > 0 && $_product->get_type() !=  'composite') {
                $cart_item_key = $cart->add_to_cart($_product->get_id(), $qty_add_to_cart);
                if ($cart_item_key) {
                    return Zippy_Response_Handler::success($session_data, "Product added to cart");
                }
                return Zippy_Response_Handler::success($session_data, "Create Cart Successfully!");
            }
            return Zippy_Response_Handler::success($session_data, "Create Cart Successfully!");
        } catch (\Throwable $th) {
            Zippy_Log_Action::log(
                'calculate_shipping_fee',
                json_encode($request),
                'Failure',
                $th->getMessage() . "\n" . $th->getTraceAsString()
            );
            return Zippy_Response_Handler::error("Something went wrong.");
        }
    }

    private static function validate_required_fields($request, $order_mode)
    {
        $required_fields = [
            "product_id" => ["required" => true, "data_type" => "string"],
            "order_mode" => ["required" => true, "data_type" => "range", "allowed_values" => ["delivery", "takeaway"]],
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "date" => ["required" => true, "data_type" => "string"],
            "time" => ["required" => true],
        ];

        if ($order_mode === "delivery") {
            $required_fields["delivery_address"] = ["required" => true];
        }

        return Zippy_Request_Validation::validate_request($required_fields, $request);
    }

    private static function get_outlet($outlet_id)
    {
        global $wpdb;
        $table_name = OUTLET_CONFIG_TABLE_NAME;

        $query = $wpdb->prepare("SELECT id, outlet_name, outlet_address FROM $table_name WHERE id = %d", $outlet_id);
        $result = $wpdb->get_row($query);
        return $result;
    }

    private static function calculate_shipping_fee($delivery_address, $lat, $lng, $outlet_id)
    {
        $param = [
            "start" => "$lat,$lng",
            "end" => "{$delivery_address['lat']},{$delivery_address['lng']}",
            "routeType" => "drive",
            "mode" => "TRANSIT",
        ];

        $api = One_Map_Api::get("/api/public/routingsvc/route", $param);
        if (isset($api["error"])) {
            return ['error' => $api["error"]];
        }

        $total_distance = $api["route_summary"]["total_distance"];

        global $wpdb;
        $config_table = OUTLET_SHIPPING_CONFIG_TABLE_NAME;
        $query = $wpdb->prepare("SELECT * FROM $config_table WHERE outlet_id = %d", $outlet_id);
        $config = $wpdb->get_row($query);


        if (!$config) {
            return ['error' => "Shipping config for outlet: $outlet_id does not exist!"];
        }

        $delivery_fee = Zippy_Handle_Shipping::get_fee_from_config(maybe_unserialize($config->minimum_order_to_delivery), $total_distance);
        $freeship_fee = Zippy_Handle_Shipping::get_fee_from_config(maybe_unserialize($config->minimum_order_to_freeship), $total_distance);
        $extra_fee = Zippy_Handle_Shipping::calculate_extra_fee(maybe_unserialize($config->extra_fee), $delivery_address);
        return [
            "total_distance" => $total_distance,
            "shipping_fee" => $delivery_fee,
            "minimum_order_to_freeship" => $freeship_fee,
            // "minimum_order_to_delivery" => $delivery_fee,
            "extra_fee" => $extra_fee,
            "address_name" => $delivery_address["address_name"] ?? null,
            "delivery_address" => $delivery_address["address_name"] ?? null
        ];
    }




    private static function extract_common_data($request)
    {
        $fields = [
            "product_id",
            "quantity",
            "order_mode",
            "date",
            "time"
        ];

        $data = [];
        foreach ($fields as $field) {
            if (!empty($request[$field])) {
                $data[$field] = $request[$field];
            }
        }

        return $data;
    }

    private static function store_to_session($data)
    {
        $session = new Zippy_Session_Handler;
        $session->init_session();
        foreach ($data as $key => $value) {
            $session->set($key, $value);
        }
        $session->set('status_popup', true);
    }
}
