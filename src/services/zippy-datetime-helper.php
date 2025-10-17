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
}
