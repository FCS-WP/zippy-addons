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

    public static function get_args()
    {
        return array(
            'outlet_id' => array(
                'required'          => true,
                'type'              => 'string',
                'description'       => 'Outlet ID',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        );
    }

    public static function create_update_args()
    {
        return array(
            'outlet_id' => array(
                'required'          => true,
                'type'              => 'string',
                'description'       => 'Outlet ID',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'configs' => array(
                'required'          => true,
                'type'              => 'array',
                'description'       => 'Shipping Role Configs',
                'sanitize_callback' => null,
            ),
        );
    }

    public static function delete_args()
    {
        return array(
            'outlet_id' => array(
                'required'          => true,
                'type'              => 'string',
                'description'       => 'Outlet ID',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'role_user' => array(
                'required'          => true,
                'type'              => 'string',
                'description'       => 'User Role',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        );
    }
}
