<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

class One_Map_Api
{
    public static function call($method = "GET", $endpoint, $param = [])
    {

        $query_string = http_build_query($param);
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => ONEMAP_API_URL . $endpoint . "?" . $query_string,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => array(
                'Authorization: Bearer ' . ONEMAP_API_KEY,
            ),
        ));

        $response = curl_exec($curl);
        $data = json_decode($response, true);
        curl_close($curl);
        return $data;
        
    }
}
