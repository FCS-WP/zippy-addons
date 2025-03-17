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

            if ($rules["data_type"] == "range" && !empty($request[$field])) {
                if (!in_array(strtolower($request[$field]), $rules['allowed_values'], true)) {
                    return "$field must be one of: " . implode(", ", $rules['allowed_values']);
                }
            }


            // time
            if ($rules["data_type"] == "time" && !empty($request[$field])) {
                $datetime = DateTime::createFromFormat('H:i:s', $request[$field]);
                if (!$datetime || $datetime->format('H:i:s') !== $request[$field]) {
                    return "$field must be a valid time in the format H:i:s";
                }
            }


            // datetime
            if ($rules["data_type"] == "datetime" && !empty($request[$field])) {
                $datetime = DateTime::createFromFormat('Y-m-d H:i:s', $request[$field]);
                if (!$datetime || $datetime->format('Y-m-d H:i:s') !== $request[$field]) {
                    return "$field must be a valid datetime in the format Y-m-d H:i:s.";
                }
            }


            // date
            if ($rules["data_type"] == "date" && !empty($request[$field])) {
                $datetime = DateTime::createFromFormat('Y-m-d', $request[$field]);
                if (!$datetime || $datetime->format('Y-m-d') !== $request[$field]) {
                    return "$field must be a valid date in the format Y-m-d.";
                }
            }


            // String
            if ($rules["data_type"] == "string" && !empty($request[$field])) {
                if (!is_string($request[$field])) {
                    return "$field must be string";
                }
            }


            // Number
            if ($rules["data_type"] == "number" && !empty($request[$field])) {
                if (!is_numeric($request[$field])) {
                    return "$field must be number";
                }
            }


            // Array
            if ($rules["data_type"] == "array" && !empty($request[$field])) {
                if (!is_array($request[$field])) {
                    return "$field must be array";
                }
            }


            // Email
            if ($rules["data_type"] == "email" && !empty($request[$field])) {
                if (!is_email($request[$field])) {
                    return "$field must be email";
                }
            }

            // Boolean
            if ($rules["data_type"] == "boolean" && !empty($request[$field])) {
                if (!in_array(strtolower($request[$field]), ["t", "f"])) {
                    return "$field must be T or F";
                }
            }

            //
            if ($rules["data_type"] == "json" && !empty($request[$field])) {
                json_decode($request[$field]);
                return (json_last_error() === JSON_ERROR_NONE);
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
