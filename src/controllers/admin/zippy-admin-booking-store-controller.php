<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Store_Controller
{
    /**
     * Create a new store
     */
    public static function zippy_create_store(WP_REST_Request $request)
    {
        $required_fields = [
            "store_name" => ["required" => true, "data_type" => "string"],
            "postal_code" => ["required" => true, "data_type" => "string"],
            "address" => ["required" => true, "data_type" => "string"],
            "latitude" => ["required" => true, "data_type" => "float"],
            "longitude" => ["required" => true, "data_type" => "float"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        try {
            $store_id_counter = get_option('store_id_counter', 1);

            $store_id = 'store_' . $store_id_counter;

            $store_data = [
                'store_name'  => sanitize_text_field($request['store_name']),
                'postal_code' => sanitize_text_field($request['postal_code']),
                'address'     => sanitize_text_field($request['address']),
                'latitude'    => floatval($request['latitude']),
                'longitude'   => floatval($request['longitude']),
            ];

            $success = add_option($store_id, json_encode($store_data));

            if (!$success) {
                throw new \Exception("Failed to add store option.");
            }

            update_option('store_id_counter', $store_id_counter + 1);

            Zippy_Log_Action::log('create_store', json_encode($store_data), 'Success', 'Store created successfully.');

            return Zippy_Response_Handler::success([
                'store_id'    => $store_id,
                'store_data'  => $store_data
            ], "Store created successfully.");
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_store', json_encode($request), 'Failure', $message);
            return Zippy_Response_Handler::error($message);
        }
    }

    public static function zippy_get_store(WP_REST_Request $request)
    {
        $store_id = $request['store_id'];
    
        try {
            if ($store_id) {
                $store_data = get_option($store_id);
                if (!$store_data) {
                    return Zippy_Response_Handler::error("Store not found");
                }
                $store_data = json_decode($store_data, true);
    
                if (!is_array($store_data) || !isset($store_data['store_name'])) {
                    return Zippy_Response_Handler::error("Invalid store data");
                }
    
                // ✅ Thêm store_id vào dữ liệu trả về
                $store_data['store_id'] = $store_id;
    
                Zippy_Log_Action::log('get_store', json_encode($store_data), 'Success', 'Store retrieved successfully.');
                return Zippy_Response_Handler::success(["data" => $store_data]);
            } else {
                $all_stores = [];
                $options = wp_load_alloptions();
    
                foreach ($options as $key => $value) {
                    if (strpos($key, 'store_') === 0) {
                        $store_data = json_decode($value, true);
    
                        if (is_array($store_data) && isset($store_data['store_name'])) {
                            // ✅ Thêm store_id vào mỗi store
                            $store_data['store_id'] = $key;
                            $all_stores[] = $store_data;
                        }
                    }
                }
    
                if (empty($all_stores)) {
                    return Zippy_Response_Handler::error("No stores found");
                }
    
                Zippy_Log_Action::log('get_store', json_encode($all_stores), 'Success', 'All stores retrieved successfully.');
                return Zippy_Response_Handler::success(["data" => $all_stores]);
            }
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_store', json_encode(['store_id' => $store_id]), 'Failure', $message);
            return Zippy_Response_Handler::error($message);
        }
    }
    
    public static function zippy_update_store(WP_REST_Request $request)
    {
        $required_fields = [
            "store_id"    => ["required" => true, "data_type" => "string"],
            "store_name"  => ["required" => true, "data_type" => "string"],
            "postal_code" => ["required" => true, "data_type" => "string"],
            "address"     => ["required" => true, "data_type" => "string"],
            "latitude"    => ["required" => true, "data_type" => "float"],
            "longitude"   => ["required" => true, "data_type" => "float"],
        ];

        $validation_errors = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validation_errors)) {
            return Zippy_Response_Handler::error($validation_errors);
        }

        try {
            $store_id = sanitize_text_field($request->get_param('store_id'));
            $existing_store = get_option($store_id);

            if (!$existing_store) {
                return Zippy_Response_Handler::error("Store not found.", 404);
            }

            $existing_store_data = json_decode($existing_store, true);
            if (!is_array($existing_store_data)) {
                return Zippy_Response_Handler::error("Invalid store data format.", 500);
            }

            $updated_store_data = [
                'store_name'  => sanitize_text_field($request->get_param('store_name')),
                'postal_code' => sanitize_text_field($request->get_param('postal_code')),
                'address'     => sanitize_text_field($request->get_param('address')),
                'latitude'    => floatval($request->get_param('latitude')),
                'longitude'   => floatval($request->get_param('longitude')),
            ];

            if (!update_option($store_id, json_encode($updated_store_data))) {
                throw new \Exception("Failed to update store.");
            }

            Zippy_Log_Action::log('update_store', json_encode($updated_store_data), 'Success', 'Store updated successfully.');

            return Zippy_Response_Handler::success([
                'store_id'    => $store_id,
                'store_data'  => $updated_store_data
            ], "Store updated successfully.");
        } catch (\Throwable $th) {
            $error_message = $th->getMessage();
            Zippy_Log_Action::log('update_store', json_encode($request->get_params()), 'Failure', $error_message);
            return Zippy_Response_Handler::error($error_message, 500);
        }
    }
}
