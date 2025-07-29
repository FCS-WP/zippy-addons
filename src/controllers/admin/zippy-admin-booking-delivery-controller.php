<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Delivery_Controller
{

    public static function create_delivery_config(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "delivery_type" => ["required" => true, "data_type" => "range", "allowed_values" => ["delivery", "takeaway"]],
            "time" => ["required" => true, "data_type" => "array"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        // Validate time field
        $time = $request["time"];

        $time_required_fields = [
            "week_day" => ["required" => true, "data_type" => "string"],
            "is_active" => ["required" => true, "data_type" => "boolean"],
            "time_slot" => ["required" => false, "data_type" => "array"],
        ];

        foreach ($time as $tm) {
            $validate = Zippy_Request_Validation::validate_request($time_required_fields, $tm);
            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }
        }

        try {
            global $wpdb;

            $outlet_id = sanitize_text_field($request['outlet_id']);
            $delivery_type = sanitize_text_field($request['delivery_type']);
            $time_data = $request['time'];


            $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;
            $query = "SELECT id FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
            $is_outlet_exist = count($wpdb->get_results($query));
            if ($is_outlet_exist < 1) {
                return Zippy_Response_Handler::error("Outlet not exist!");
            }

            $response = [
                'outlet_id' => $outlet_id,
                'delivery_type' => $delivery_type,
                'time' => $time_data
            ];

            foreach ($time_data as $day) {
                $week_day = intval($day['week_day']);
                $is_active = ($day['enabled'] == 'T') ? 'T' : 'F';

                $delivery_time_id = wp_generate_uuid4();

                $wpdb->insert("{$wpdb->prefix}zippy_addons_delivery_times", [
                    'id' => $delivery_time_id,
                    'outlet_id' => $outlet_id,
                    'delivery_type' => $delivery_type,
                    'week_day' => $week_day,
                    'is_active' => $is_active
                ]);

                if (!empty($day['time_slot']) && is_array($day['time_slot'])) {
                    foreach ($day['time_slot'] as $slot) {
                        $from = sanitize_text_field($slot['from']);
                        $to = sanitize_text_field($slot['to']);
                        $slot_count = intval($slot['delivery_slot']);

                        $wpdb->insert("{$wpdb->prefix}zippy_addons_delivery_time_slots", [
                            'id' => wp_generate_uuid4(),
                            'delivery_time_id' => $delivery_time_id,
                            'time_from' => $from,
                            'time_to' => $to,
                            'delivery_slot' => $slot_count
                        ]);
                    }
                }
            }

            return Zippy_Response_Handler::success($response, "Delivery Updated");

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_store', json_encode($request), 'Failure', $message);
        }
    }
}
