<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

class Zippy_Datetime_Helper
{
    public static function convert_to_singapore_timestamp_from_date_string($date_string)
    {
        return strtotime('+8 hour', strtotime($date_string));
    }

    /**
     * Merge date string and time string into a single date string
     * 
     * Example:
     *   Input: "2025-10-24", "From 14:00 to 16:00"
     *   Output: "2025-10-24 14:00"
     * @param mixed $date_string
     * @param mixed $time_string
     */
    public static function merge_date_and_time($date_string, $time_string)
    {
        if (preg_match('/(\d{1,2}:\d{2})/', $time_string, $matches)) {
            $time_part = $matches[1]; // 14:00
            $date_string .= ' ' . $time_part;
        }

        return $date_string;
    }
}
