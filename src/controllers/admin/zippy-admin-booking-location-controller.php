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
            "keyword" => ["required" => true, "data_type" => "string"],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        try {
            // prepair param
            $param = [
                "searchVal" => $request["keyword"],
                "returnGeom" => "Y",
                "getAddrDetails" => "Y",
            ];

            $api = One_Map_Api::get("/api/common/elastic/search", $param);

            // if (isset($api["error"])) {
            //     return Zippy_Response_Handler::error($api["error"]);
            // }

            return Zippy_Response_Handler::success($api, "Success");
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_location_geo', json_encode($request), 'Failure', $message);
        }
    }

    public static function get_distance_between_locations(WP_REST_Request $request)
    {
        $required_fields = [
            "from" => ["required" => true],
            "to" => ["required" => true],
        ];

        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        // prepair data
        $start_lat = $request["from"]["lat"] ?? null;
        $start_lng = $request["from"]["lng"] ?? null;

        $end_lat = $request["to"]["lat"] ?? null;
        $end_lng = $request["to"]["lng"] ?? null;

        if (empty($start_lat) || empty($start_lng) || empty($end_lat) || empty($end_lng)) {
            return Zippy_Response_Handler::error("Missing coordinates");
        }

        try {

            // prepair response data
            $res_data = [
                "start_point" => "",
                "end_point" => "",
                "total_distance" => "",
            ];


            // prepair param to get total distance
            $param = [
                "start" => $start_lat . "," . $start_lng,
                "end" => $end_lat . "," . $end_lng,
                "routeType" => "drive",
                "mode" => "TRANSIT",
            ];

            $api = One_Map_Api::get("/api/public/routingsvc/route", $param);

            if (isset($api["error"])) {
                return Zippy_Response_Handler::error($api["error"]);
            }

            $route_summary = $api["route_summary"];

            if (empty($route_summary)) {
                return Zippy_Response_Handler::error($api["message"]);
            }

            $total_distance = $route_summary["total_distance"];
            $res_data["start_point"] = $route_summary["start_point"];
            $res_data["end_point"] = $route_summary["end_point"];
            $res_data["total_distance"] = $total_distance;

            return Zippy_Response_Handler::success($res_data, $api["status_message"]);
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_distance_between_locations', json_encode($request), 'Failure', $message);
        }
    }
}
