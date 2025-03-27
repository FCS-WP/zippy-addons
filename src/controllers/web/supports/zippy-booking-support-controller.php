<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web\Supports;

use WP_REST_Request;
use WP_Query;

use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;

defined('ABSPATH') or die();

class Zippy_Booking_Support_Controller
{

    public static function search_mapping_products(WP_REST_Request $request)
    {
        global $wpdb;
        $helperServices = new Zippy_Booking_Helper();

        $search = sanitize_text_field($request->get_param('query'));
        if (empty($search)) {
            return Zippy_Response_Handler::error('Missing search query.');
        }
        // Search by product title
        $args = [
            'limit'    => 5,
            'status'   => 'publish',
            's'        => $search,
        ];
        $products = wc_get_products($args);
        $fitleredProducts = $helperServices->filter_mapping_product($products);
        return Zippy_Response_Handler::success(
            array(
                'products' => $fitleredProducts,
            ),
            'Search products successfully.'
        );
    }
}
