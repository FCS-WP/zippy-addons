<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models\Stores;

defined('ABSPATH') or die();

class Zippy_Stores_Model
{
    const TYPE_RETAIL = 1;
    const TYPE_POPUP = 2;

    public static function get_store_types(): array
    {
        return [
            self::TYPE_RETAIL => 'Retail Store',
            self::TYPE_POPUP => 'Popup Reservation',
        ];
    }

    public static function get_store_type_label(): array
    {
        return [
            'retail-store' => self::TYPE_RETAIL,
            'popup-reservation' => self::TYPE_POPUP,
        ];
    }

    public static function get_store_type_by_label(string $label): ?int
    {
        $types = self::get_store_type_label();
        return $types[$label] ?? null;
    }
}