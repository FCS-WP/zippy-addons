<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\One_Map_Api;
use Zippy_Booking\Utils\Zippy_Session_Handler;
use Zippy_Booking\Utils\Zippy_Cart_Handler;
use WP_REST_Response;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Product_Controller
{
    const MAX_DISTANCE = 99999999999999;

    public static function add_product_and_shipping_info_to_card(WP_REST_Request $request)
    {
        try {
            $order_mode = strtolower($request["order_mode"] ?? '');
            $validation = self::validate_required_fields($request, $order_mode);
            if (!empty($validation)) {
                return Zippy_Response_Handler::error($validation);
            }

            $outlet = $request['outlet_name'];
            if (!$outlet) {
                return Zippy_Response_Handler::error("Outlet not exist!");
            }

            $_product = wc_get_product($request["product_id"]);

            if (!$_product) {
                return Zippy_Response_Handler::error("Product not exist!");
            }

            $session_data = self::extract_common_data($request);
            $session_data["outlet_name"] = $outlet;

            $session_data["outlet_address"] = $outlet ?? null;
            self::store_to_session($session_data);

            $cart = new Zippy_Cart_Handler;
            $min_qty = sanitize_text_field($request["quantity"]) ?? 1;
            $cart->add_to_cart($_product->get_id(), $min_qty);
            return Zippy_Response_Handler::success($session_data, "Product added to cart");
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
            "outlet_name" => ["required" => true, "data_type" => "string"],
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

        $delivery_fee = self::get_fee_from_config(maybe_unserialize($config->minimum_order_to_delivery), $total_distance);
        $freeship_fee = self::get_fee_from_config(maybe_unserialize($config->minimum_order_to_freeship), $total_distance);
        $extra_fee = self::calculate_extra_fee(maybe_unserialize($config->extra_fee), $delivery_address);

        return [
            "total_distance" => $total_distance,
            "shipping_fee" => $delivery_fee,
            "minimum_order_to_freeship" => $freeship_fee,
            "minimum_order_to_delivery" => $delivery_fee,
            "extra_fee" => $extra_fee,
            "address_name" => $delivery_address["address_name"] ?? null,
            "delivery_address" => $delivery_address["address_name"] ?? null
        ];
    }

    private static function get_fee_from_config($config_data, $distance)
    {
        foreach ($config_data as $rule) {
            $rule["lower_than"] = $rule["lower_than"] ?? self::MAX_DISTANCE;
            if ($distance >= $rule["greater_than"] && $distance <= $rule["lower_than"]) {
                return $rule["fee"];
            }
        }
        return 0;
    }

    private static function calculate_extra_fee($config_data, $delivery_address)
    {
        foreach ($config_data as $rule) {
            if (
                $rule["type"] === "postal_code" &&
                $delivery_address["postal_code"] >= $rule["from"] &&
                $delivery_address["postal_code"] <= $rule["to"]
            ) {
                return 10;
            }
        }
        return 0;
    }

    private static function extract_common_data($request)
    {
        $fields = [
            "product_id",
            "quantity",
            "order_mode",
            "current_cart",
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

    public static function check_before_add_to_cart(WP_REST_Request $request)
    {
        // $product_id = $request->get_param('product_id');
        // if (!$product_id) {
        //     return Zippy_Response_Handler::error("Missing product param!");
        // }
        try {
            $session = new Zippy_Session_Handler;
            $cart_type = $session->get('current_cart') ?? '';
            return new WP_REST_Response(['cart_type' => $cart_type, 'status' => 'success'], 200);
        } catch (\Throwable $th) {
            return new WP_REST_Response(['cart_type' => '', 'status' => 'success'], 200);
        }
    }

    public static function check_session_before_add_to_cart(WP_REST_Request $request)
    {
        $new_cart = $request->get_param('new_cart');
        if (!$new_cart) {
            return Zippy_Response_Handler::error("Missing new_cart param!");
        }
        $session = new Zippy_Session_Handler();
        if (!$session->get('order_mode')) {
            return Zippy_Response_Handler::success(["cart_available" => true], 'Add to cart available!');
        }
        $current_cart = $session->get('current_cart');

        if ($current_cart === $new_cart) {
            return Zippy_Response_Handler::success(["cart_available" => true], 'Add to cart available!');
        }
        return Zippy_Response_Handler::success(["cart_available" => false], 'Need to clean cart!');
    }
}
