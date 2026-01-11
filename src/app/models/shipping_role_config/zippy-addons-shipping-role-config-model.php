<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models\Shipping_Role_Config;

defined('ABSPATH') or die();

use WP_REST_Response;
use Zippy_Booking\App\Models\Zippy_Request_Validation;

class Zippy_Addons_Shipping_Role_Config_Model
{
    public const SERVICE_TYPE_TAKEAWAY = 'take_away';
    public const SERVICE_TYPE_DELIVERY = 'delivery';
}
