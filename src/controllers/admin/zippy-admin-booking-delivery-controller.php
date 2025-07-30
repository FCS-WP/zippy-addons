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
                'time' => []
            ];

            $time_table = "{$wpdb->prefix}zippy_addons_delivery_times";
            $slot_table = "{$wpdb->prefix}zippy_addons_delivery_time_slots";

            foreach ($time_data as $day) {
                $week_day = intval($day['week_day']);
                $is_active = ($day['is_active'] == 'T') ? 'T' : 'F';

                $delivery_time_id = !empty($day['delivery_time_id']) ? sanitize_text_field($day['delivery_time_id']) : wp_generate_uuid4();

                $exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $time_table WHERE id = %s AND week_days = %s", $delivery_time_id, $week_day));

                if (!$exists) {
                    $wpdb->insert($time_table, [
                        'id' => $delivery_time_id,
                        'outlet_id' => $outlet_id,
                        'delivery_type' => $delivery_type,
                        'week_day' => $week_day,
                        'is_active' => $is_active
                    ]);
                }

                // prepare day_slots res data
                $day_slots = [];

                if (!empty($day['time_slot']) && is_array($day['time_slot'])) {
                    foreach ($day['time_slot'] as $slot) {
                        $from = sanitize_text_field($slot['from']);
                        $to = sanitize_text_field($slot['to']);
                        $slot_count = intval($slot['delivery_slot']);
                        $slot_id = isset($slot['slot_id']) ? sanitize_text_field($slot['slot_id']) : wp_generate_uuid4();

                        $slot_exists = $wpdb->get_var($wpdb->prepare(
                            "SELECT COUNT(*) FROM $slot_table WHERE id = %s AND delivery_time_id = %s",
                            $slot_id
                        ));

                        if ($slot_exists) {
                            $wpdb->update($slot_table, [
                                'time_from' => $from,
                                'time_to' => $to,
                                'delivery_slot' => $slot_count,
                            ], [
                                'id' => $slot_id
                            ]);
                        } else {
                            $wpdb->insert($slot_table, [
                                'id' => $slot_id,
                                'delivery_time_id' => $delivery_time_id,
                                'time_from' => $from,
                                'time_to' => $to,
                                'delivery_slot' => $slot_count
                            ]);
                        }

                        $day_slots[] = [
                            'slot_id' => $slot_id,
                            'from' => $from,
                            'to' => $to,
                            'delivery_slot' => $slot_count,
                        ];
                    }
                }

                $response['time'][] = [
                    'week_day' => $week_day,
                    'is_active' => $is_active,
                    'delivery_time_id' => $delivery_time_id,
                    'time_slot' => $day_slots,
                ];
            }

            return Zippy_Response_Handler::success($response, "Delivery Updated");

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_store', json_encode($request), 'Failure', $message);
        }
    }

    public static function get_delivery_config(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "delivery_type" => ["required" => true, "data_type" => "range", "allowed_values" => ["delivery", "takeaway"]],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        global $wpdb;

        $time_table = "{$wpdb->prefix}zippy_addons_delivery_times";
        $slot_table = "{$wpdb->prefix}zippy_addons_delivery_time_slots";

        $outlet_id = $request->get_param('outlet_id');
        $delivery_type = $request->get_param('delivery_type');

        $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;
        $query = "SELECT id FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
        $is_outlet_exist = count($wpdb->get_results($query));
        if ($is_outlet_exist < 1) {
            return Zippy_Response_Handler::error("Outlet not exist!");
        }

        // get time config weekdays
        $time_rows = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM $time_table WHERE outlet_id = %s AND delivery_type = %s", $outlet_id, $delivery_type),
            ARRAY_A
        );

        $response = [
            'outlet_id' => $outlet_id,
            'delivery_type' => $delivery_type,
            'time' => []
        ];

        if (empty($time_rows)) {
            return Zippy_Response_Handler::success([], "No Times Found!");
        }

        foreach ($time_rows as $time) {
            $delivery_time_id = $time['id'];
            $week_day = $time['week_day'];
            $enabled = $time['is_active']; // 'T' or 'F'

            // get time slots
            $slots = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM $slot_table WHERE delivery_time_id = %s", $delivery_time_id),
                ARRAY_A
            );

            $slot_data = [];
            foreach ($slots as $slot) {
                $slot_data[] = [
                    'id' => $slot['id'],
                    'from' => $slot['time_from'],
                    'to' => $slot['time_to'],
                    'delivery_slot' => (string) $slot['delivery_slot']
                ];
            }

            $response['time'][] = [
                'id' => $delivery_time_id,
                'week_day' => (string) $week_day,
                'enabled' => $enabled,
                'time_slot' => $slot_data
            ];
        }
        return Zippy_Response_Handler::success($response, "Success");
    }

    public static function delete_delivery_config(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "delivery_time_id" => ["required" => true, "data_type" => "string"],
            "slot_ids" => ["required" => true, "data_type" => "array"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        global $wpdb;

        $slot_table = "{$wpdb->prefix}zippy_addons_delivery_time_slots";

        $outlet_id = sanitize_text_field($request['outlet_id']);
        $delivery_time_id = sanitize_text_field($request['delivery_time_id']);
        $slot_ids = $request['slot_ids'];

        try {

            $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;
            $query = "SELECT id FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
            $is_outlet_exist = count($wpdb->get_results($query));
            if ($is_outlet_exist < 1) {
                return Zippy_Response_Handler::error("Outlet not exist!");
            }

            foreach ($slot_ids as $slot_id) {
                $row = $wpdb->get_row($wpdb->prepare(
                    "SELECT * FROM $slot_table WHERE id = %s AND delivery_time_id = %s",
                    $slot_id,
                    $delivery_time_id,
                ), ARRAY_A);

                if (!$row) {
                    return Zippy_Response_Handler::error("Invalid id: slot_id or delivery_time_id");
                }
            }

            // delete time slots
            foreach ($slot_ids as $slot_id) {
                $wpdb->delete($slot_table, [
                    'id' => $slot_id,
                    'delivery_time_id' => $delivery_time_id
                ]);
            }

            return Zippy_Response_Handler::success([], 'Operation successful');

        } catch (\Throwable $th) {
            Zippy_Log_Action::log('delete_delivery_time', json_encode($request), 'Failure', $th->getMessage());
            return Zippy_Response_Handler::error('An error occurred: ' . $th->getMessage());
        }
    }
}
