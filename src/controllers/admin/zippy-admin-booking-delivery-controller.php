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
        global $wpdb;
        $table_delivery_time = $wpdb->prefix . 'zippy_addons_delivery_times';
        $table_time_slot = $wpdb->prefix . 'zippy_addons_delivery_time_slots';

        // Validate request
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "delivery_type" => ["required" => true, "data_type" => "range", "allowed_values" => ["delivery", "takeaway"]],
            "time" => ["required" => true, "data_type" => "array"],
        ];
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $outlet_id = sanitize_text_field($request['outlet_id']);
        $delivery_type = sanitize_text_field($request['delivery_type']);
        $times = $request['time'];

        $response_data = [
            'outlet_id' => $outlet_id,
            'delivery_type' => $delivery_type,
            'time' => [],
        ];

        foreach ($times as $time) {
            // Validate each time block
            if (!isset($time['week_day']) || !in_array($time['week_day'], range(0, 6))) {
                return Zippy_Response_Handler::error("week_day must be 0-6)");
            }

            if (!in_array($time['is_active'], ['T', 'F'])) {
                return Zippy_Response_Handler::error("is_active must be 'T' or 'F'");
            }

            $week_day = intval($time['week_day']);
            $is_active = $time['is_active'];

            // Check if delivery_time for this outlet_id, delivery_type, week_day exists
            $delivery_time_row = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM $table_delivery_time WHERE outlet_id = %s AND delivery_type = %s AND week_day = %d",
                    $outlet_id,
                    $delivery_type,
                    $week_day
                ),
                ARRAY_A
            );


            if ($delivery_time_row) {
                // Update is_active
                $wpdb->update(
                    $table_delivery_time,
                    [
                        'is_active' => $is_active,
                        'updated_at' => current_time('mysql')
                    ],
                    ['id' => $delivery_time_row['id']]
                );

                $delivery_time_id = $delivery_time_row['id'];
            } else {
                // Create new
                $delivery_time_id = wp_generate_uuid4();
                $wpdb->insert(
                    $table_delivery_time,
                    [
                        'id' => $delivery_time_id,
                        'outlet_id' => $outlet_id,
                        'delivery_type' => $delivery_type,
                        'week_day' => $week_day,
                        'is_active' => $is_active,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql'),
                    ]
                );
            }

            $day_response = [
                'week_day' => (string) $week_day,
                'is_active' => $is_active,
                'time_slot' => []
            ];

            $slots = isset($time['time_slot']) && is_array($time['time_slot']) ? $time['time_slot'] : [];

            foreach ($slots as $slot) {
                // Validate each slot
                if (empty($slot['from']) || empty($slot['to']) || empty($slot['delivery_slot'])) {
                    return Zippy_Response_Handler::error("Each time_slot must include 'from', 'to', and 'delivery_slot'");
                }

                $slot_id = isset($slot['slot_id']) ? sanitize_text_field($slot['slot_id']) : null;
                $from = sanitize_text_field($slot['from']);
                $to = sanitize_text_field($slot['to']);
                $delivery_slot = sanitize_text_field($slot['delivery_slot']);
                $action = isset($slot['action']) ? $slot['action'] : 'update';

                if ($action == 'delete') {
                    if ($slot_id) {
                        $wpdb->delete($table_time_slot, ['id' => $slot_id, 'delivery_time_id' => $delivery_time_id]);
                    }
                    continue;
                }

                // If slot_id exists, update
                if ($slot_id) {
                    $wpdb->update(
                        $table_time_slot,
                        [
                            'time_from' => $from,
                            'time_to' => $to,
                            'delivery_slot' => $delivery_slot,
                            'updated_at' => current_time('mysql'),
                        ],
                        [
                            'id' => $slot_id,
                            'delivery_time_id' => $delivery_time_id,
                        ]
                    );
                } else {
                    // Create new slot
                    $slot_id = wp_generate_uuid4();
                    $wpdb->insert(
                        $table_time_slot,
                        [
                            'id' => $slot_id,
                            'delivery_time_id' => $delivery_time_id,
                            'time_from' => $from,
                            'time_to' => $to,
                            'delivery_slot' => $delivery_slot,
                            'created_at' => current_time('mysql'),
                            'updated_at' => current_time('mysql'),
                        ]
                    );
                }
                $day_response['time_slot'][] = [
                    'slot_id' => $slot_id,
                    'from' => $from,
                    'to' => $to,
                    'delivery_slot' => $delivery_slot,
                    'delivery_time' => $delivery_time_id
                ];
            }

            $response_data['time'][] = $day_response;
        }
        return Zippy_Response_Handler::success($response_data, "Delivery time slots updated.");
    }

    public static function get_delivery_config(WP_REST_Request $request)
    {
        $required_fields = [
            'outlet_id' => ['required' => true, 'data_type' => 'string'],
            'delivery_type' => ['required' => true, 'data_type' => 'string'],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $outlet_id = sanitize_text_field($request['outlet_id']);
        $delivery_type = sanitize_text_field($request['delivery_type']);

        global $wpdb;
        $delivery_time_table = $wpdb->prefix . 'zippy_addons_delivery_times';
        $time_slot_table = $wpdb->prefix . 'zippy_addons_delivery_time_slots';
        $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;

        // Get all delivery_time rows for this outlet and delivery_type
        $delivery_times = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $delivery_time_table WHERE outlet_id = %s AND delivery_type = %s",
                $outlet_id,
                $delivery_type
            ),
            ARRAY_A
        );

        if (empty($delivery_times)) {
            return Zippy_Response_Handler::success([], 'No config found');
        }


        $day_limited = $slots = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT day_limited FROM $outlet_table_name WHERE id = %s",
                $outlet_id
            ),
            ARRAY_A
        );

        $result = [
            'outlet_id' => $outlet_id,
            'delivery_type' => $delivery_type,
            'day_limited' => $day_limited["day_limited"],
            'time' => [],
        ];

        foreach ($delivery_times as $delivery_time) {
            $slots = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id, `time_from`, `time_to`, delivery_slot FROM $time_slot_table WHERE delivery_time_id = %s ORDER BY created_at ASC",
                    $delivery_time['id']
                ),
                ARRAY_A
            );

            $result['time'][] = [
                'id' => $delivery_time['id'],
                'week_day' => $delivery_time['week_day'],
                'is_active' => $delivery_time['is_active'],
                'time_slot' => $slots
            ];
        }


        return Zippy_Response_Handler::success($result, 'Success');
    }
}
