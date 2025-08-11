<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Store_Config_Controller
{
    /**
     * Create a new store
     */
    // public static function create_store_config(WP_REST_Request $request)
    // {
    //     $required_fields = [
    //         "outlet_id" => ["required" => true, "data_type" => "string"],
    //         "operating_hours" => ["required" => true,],
    //         "closed_dates" => ["required" => true, "data_type" => "array"],
    //         "takeaway" => ["required" => true],
    //     ];

    //     // Add option limit days 

    //     $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    //     if (!empty($validate)) {
    //         return Zippy_Response_Handler::error($validate);
    //     }
    //     $day_limited = $request->get_param('day_limited');

    //     if ($day_limited) {
    //         update_option('zippy_day_limited', $day_limited);
    //     }

    //     // validate sub_field_datas
    //     $sub_require_fields = [
    //         "takeaway" => [
    //             "enabled" => ["required"=> true, "data_type" => "boolean"],
    //             "timeslot_duration" => ["required"=> true, "data_type" => "number"],
    //         ],   
    //     ];

    //     foreach ($sub_require_fields as $key => $value) {
    //         $validate = Zippy_Request_Validation::validate_request($value, $request[$key]);
    //         if (!empty($validate)) {
    //             return Zippy_Response_Handler::error($validate);
    //         } 
    //     }


    //     try {
    //         /* insert data to config table */
    //         global $wpdb;
    //         $table_name = OUTLET_CONFIG_TABLE_NAME;

    //         $outlet_id = $request['outlet_id'];
    //         $query = "SELECT id FROM $table_name WHERE id ='" . $outlet_id . "'";
    //         $is_outlet_exist = count($wpdb->get_results($query));
    //         if($is_outlet_exist < 1){
    //             return Zippy_Response_Handler::error("Outlet not exist!");
    //         }

    //         $response_data = [];

    //         $serialize_fields = [   
    //             "operating_hours",
    //             "closed_dates",
    //             "takeaway",
    //         ];

    //         $update_data = [];
    //         $res_data = [];
    //         foreach ($serialize_fields as $field) {
    //             $update_data[$field] = maybe_serialize($request[$field]);
    //             $res_data[$field] = $request[$field];
    //         }

    //         $update_data["updated_at"] = current_time('mysql');

    //         $is_updated = $wpdb->update($table_name, $update_data, ["id" => $outlet_id]);

    //         if($is_updated){
    //             $response_data = array_merge($update_data, $res_data);
    //             $response_data["updated_at"] = $update_data["updated_at"];
    //             return Zippy_Response_Handler::success($response_data, "Oulet Updated");
    //         }

    //     } catch (\Throwable $th) {
    //         $message = $th->getMessage();
    //         Zippy_Log_Action::log('create_store', json_encode($request), 'Failure', $message);
    //     }
    // }


    public static function create_holiday(WP_REST_Request $request)
    {

        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
            "date" => ["required" => true, "data_type" => "array"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $create_required_fields = [
            "name" => ["required" => false],
            "date" => ["required" => true, "data_type" => "date"],
            "action" => ["required" => true, "data_type" => "range", "allowed_values" => ["update", "delete", "create"]],
            "is_active_take_away" => ["required" => true, "data_type" => "boolean"],
            "is_active_delivery" => ["required" => true, "data_type" => "boolean"],
        ];

        $update_required_fields = [
            "id" => ["required" => true, "data_type" => "string"],
            "name" => ["required" => false],
            "date" => ["required" => true, "data_type" => "date"],
            "action" => ["required" => true, "data_type" => "range", "allowed_values" => ["update", "delete", "create"]],
            "is_active_take_away" => ["required" => true, "data_type" => "boolean"],
            "is_active_delivery" => ["required" => true, "data_type" => "boolean"],
        ];

        $detele_required_fields = [
            "id" => ["required" => true, "data_type" => "string"],
            "action" => ["required" => true, "data_type" => "range", "allowed_values" => ["update", "delete", "create"]],
        ];

        $dates = $request["date"];

        foreach ($dates as $date) {
            if ($date["action"] == "delete") {
                $validate = Zippy_Request_Validation::validate_request($detele_required_fields, $date);
            } else if ($date["action"] == "update") {
                $validate = Zippy_Request_Validation::validate_request($update_required_fields, $date);
            } else {
                $validate = Zippy_Request_Validation::validate_request($create_required_fields, $date);
            }

            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }
        }

        $outlet_id = sanitize_text_field($request['outlet_id']);



        global $wpdb;
        $table = $wpdb->prefix . 'zippy_addons_holiday_configs';

        foreach ($dates as $date) {
            $date_id = $date["id"];
            $action = $date["action"];
            if ($action == "update" || $action == "delete") {
                $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %s AND outlet_id = %s", $date["id"], $outlet_id), ARRAY_A);
                if (!$row) {
                    return Zippy_Response_Handler::error("Holiday ID: $date_id not found");
                }
            }
        }

        $response_data = [];

        // do update/create

        foreach ($dates as $date) {
            $action = $date["action"];
            $id = sanitize_text_field($date["id"]);
            if ($action == "update") {
                $update_data = [
                    'name' => sanitize_text_field($date['name']),
                    'date' => sanitize_text_field($date['date']),
                    'is_active_take_away' => ($date['is_active_take_away'] === 'T') ? 'T' : 'F',
                    'is_active_delivery' => ($date['is_active_delivery'] === 'T') ? 'T' : 'F',
                    "updated_at" => current_time('mysql'),
                ];

                $wpdb->update($table, $update_data, ['id' => $date["id"]]);
                $update_data["action"] = $action;
                $response_data[] = $update_data;
            } else if ($action == "delete") {
                $wpdb->delete($table, ['id' => $id]);
                $response_data[] = [
                    "id" => $id,
                    "action" => $action
                ];
            } else {
                $data = [
                    'id' => wp_generate_uuid4(),
                    'outlet_id' => $outlet_id,
                    'name' => sanitize_text_field($date['name']),
                    'date' => sanitize_text_field($date['date']),
                    'is_active_take_away' => ($date['is_active_take_away'] === 'T') ? 'T' : 'F',
                    'is_active_delivery' => ($date['is_active_delivery'] === 'T') ? 'T' : 'F',
                    "created_at" => current_time('mysql'),
                    "updated_at" => current_time('mysql'),
                ];
                $wpdb->insert($table, $data);
                $data["action"] = $action;
                $response_data = $data;
            }
        }

        return Zippy_Response_Handler::success($response_data, "Holiday updated");
    }


    public static function get_holidays(WP_REST_Request $request)
    {
        $required_fields = [
            "outlet_id" => ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $outlet_id = sanitize_text_field($request['outlet_id']);

        global $wpdb;

        $outlet_table_name = OUTLET_CONFIG_TABLE_NAME;
        $query = "SELECT id FROM $outlet_table_name WHERE id ='" . $outlet_id . "'";
        $is_outlet_exist = count($wpdb->get_results($query));
        if ($is_outlet_exist < 1) {
            return Zippy_Response_Handler::error("Outlet not exist!");
        }

        $table = $wpdb->prefix . 'zippy_addons_holiday_configs';

        $outlet_id = sanitize_text_field($request->get_param('outlet_id'));

        $response = [];

        $results = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM $table WHERE outlet_id = %s ORDER BY date ASC", $outlet_id),
            ARRAY_A
        );

        if (!$results) {
            return Zippy_Response_Handler::success([], "No Holiday Found!");
        }

        $response["date"] = $results;

        return Zippy_Response_Handler::success($response);
    }
}
