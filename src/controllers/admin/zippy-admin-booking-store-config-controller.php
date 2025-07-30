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
}
