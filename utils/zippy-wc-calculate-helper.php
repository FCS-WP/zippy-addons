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

    /**
     * Get tax from price include tax
     * @param mixed $priceIncludeTax
     * @return string
     */
    public static function get_tax($priceIncludeTax)
    {
        $tax = get_tax_percent();
        $tax_rate = floatval($tax->tax_rate);
        $shipping_tax = $priceIncludeTax - $priceIncludeTax / (1 + $tax_rate / 100);
        return Zippy_Wc_Calculate_Helper::round_price_wc($shipping_tax);
    }

    /**
     * Get tax from price exclude tax
     * @param mixed $price
     * @return string
     */
    public static function get_tax_by_price_exclude_tax($priceExcludeTax)
    {
        $total_price_including_tax = self::get_total_price_including_tax($priceExcludeTax);
        return self::get_tax($total_price_including_tax);
    }


    /**
     * Get total price including tax from price exclude tax
     * @param mixed $priceExcludeTax
     * @return string
     */
    public static function get_total_price_including_tax($priceExcludeTax): string
    {
        $tax       = get_tax_percent();
        $tax_rate  = floatval($tax->tax_rate);
        return self::round_price_wc($priceExcludeTax * (1 + $tax_rate / 100));
    }
}
