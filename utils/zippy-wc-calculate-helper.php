<?php

/**
 * Admin Setting
 *
 * @package Shin
 */

namespace Zippy_Booking\Utils;

defined('ABSPATH') or die();

class Zippy_Wc_Calculate_Helper
{
    public static function round_price_wc($price)
    {
        return wc_format_decimal($price, wc_get_price_decimals());
    }
}
