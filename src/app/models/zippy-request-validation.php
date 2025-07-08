<?php

/**
 * Request Validation
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models;

defined('ABSPATH') or die();

use DateTime;

class Zippy_Request_Validation
{
    public static function validate_request($required_fields, $request)
    {
        /* Validate main required fields */
        foreach ($required_fields as $field => $rules) {
            if ((isset($rules['required']) && $rules['required'] == true) && (!isset($request[$field]) || $request[$field] === "")) {
                return "$field is required";
            }

            if (!empty($rules["data_type"]) && $rules["data_type"] == "range" && !empty($request[$field])) {
                if (!in_array(strtolower($request[$field]), $rules['allowed_values'], true)) {
                    return "$field must be one of: " . implode(", ", $rules['allowed_values']);
                }
            }


            // time
            if (!empty($rules["data_type"]) && $rules["data_type"] == "time" && !empty($request[$field])) {
                $datetime = DateTime::createFromFormat('H:i:s', $request[$field]);
                if (!$datetime || $datetime->format('H:i:s') !== $request[$field]) {
                    return "$field must be a valid time in the format H:i:s";
                }
            }


            // datetime
            if (!empty($rules["data_type"]) && $rules["data_type"] == "datetime" && !empty($request[$field])) {
                $datetime = DateTime::createFromFormat('Y-m-d H:i:s', $request[$field]);
                if (!$datetime || $datetime->format('Y-m-d H:i:s') !== $request[$field]) {
                    return "$field must be a valid datetime in the format Y-m-d H:i:s.";
                }
            }


            // date
            if (!empty($rules["data_type"]) && $rules["data_type"] == "date" && !empty($request[$field])) {
                $datetime = DateTime::createFromFormat('Y-m-d', $request[$field]);
                if (!$datetime || $datetime->format('Y-m-d') !== $request[$field]) {
                    return "$field must be a valid date in the format Y-m-d.";
                }
            }


            // String
            if (!empty($rules["data_type"]) && $rules["data_type"] == "string" && !empty($request[$field])) {
                if (!is_string($request[$field])) {
                    return "$field must be string";
                }
            }


            // Number
            if (!empty($rules["data_type"]) && $rules["data_type"] == "number" && !empty($request[$field])) {
                if (!is_numeric($request[$field])) {
                    return "$field must be number";
                }
            }


            // Array
            if (!empty($rules["data_type"]) && $rules["data_type"] == "array" && !empty($request[$field])) {
                if (!is_array($request[$field])) {
                    return "$field must be array";
                }
            }


            // Email
            if (!empty($rules["data_type"]) && $rules["data_type"] == "email" && !empty($request[$field])) {
                if (!is_email($request[$field])) {
                    return "$field must be email";
                }
            }

            // Boolean
            if (!empty($rules["data_type"]) && $rules["data_type"] == "boolean" && !empty($request[$field])) {
                if (!in_array(strtolower($request[$field]), ["t", "f"])) {
                    return "$field must be T or F";
                }
            }

            //
            if (!empty($rules["data_type"]) && $rules["data_type"] == "json" && !empty($request[$field])) {
                json_decode($request[$field]);
                return (json_last_error() === JSON_ERROR_NONE);
            }

            // Ensure end_date is after start_date
            if ($field === "end_date" && isset($request["start_date"])) {
                $start_timestamp = strtotime($request["start_date"]);
                $end_timestamp = strtotime($request["end_date"]);

                if ($end_timestamp <= $start_timestamp) {
                    return "end_date must be later than start_date.";
                }
            }
        }
    }


    public static function get_weekdays()
    {
        return [0, 1, 2, 3, 4, 5, 6];
    }
    public static function validate_time($time)
    {
        $datetime = DateTime::createFromFormat('H:i:s', $time);
        return $datetime && $datetime->format('H:i:s') == $time;
    }
}
