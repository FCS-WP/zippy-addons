<?php

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Services\One_Map_Api;

defined('ABSPATH') or die();

class Zippy_Admin_Booking_Location_Controller
{

    public static function get_location_geo(WP_REST_Request $request)
    {   
        $required_fields = [
            "postal_code" => ["required" => true, "data_type" => "number"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        try {

            $param = [
                "searchVal" => $request["postal_code"],
                "returnGeom" => "Y",
                "getAddrDetails" => "Y",
            ];

            $api = One_Map_Api::call("GET", "/api/common/elastic/search", $param);

            if(isset($api["error"])){
                return Zippy_Response_Handler::error($api["error"]);
            }

            return Zippy_Response_Handler::success($api, "Success");

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_location_geo', json_encode($request), 'Failure', $message);
        }
    }
}
