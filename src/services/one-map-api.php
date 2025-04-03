<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;



use Zippy_Booking\Utils\Zippy_Utils_Core;

class One_Map_Api
{
    public static function call($method, $endpoint, $param)
    {   
        static $interval = 0;

        $interval++;

        if ($interval > 5) {
            return [
                "status_message"=> "Request timeout!",
            ];
        }

        $is_access_token_expired = false;

        $url = ONEMAP_API_URL . $endpoint;

        $access_token = get_option(ONEMAP_ACCESS_TOKEN_KEY);

        $access_token = Zippy_Utils_Core::decrypt_data_input($access_token);

        if ($access_token == false){
            return [
                "error"=> "access_token not found",
            ];
        }

        $curl = curl_init();
        $curl_opts = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => array(
                "Authorization: Bearer " . $access_token,
            ),
        ];

        // prepare data
        if (count($param) > 0) {
            switch ($method) {
                case "POST":
                case "PUT":
                case "DELETE":
                    $curl_opts[CURLOPT_POSTFIELDS] = json_encode($param);
                    break;
                    
                case "GET":
                    $curl_opts[CURLOPT_URL] = $url . "?" . http_build_query($param);
                    break;
            }
        }


        curl_setopt_array($curl, $curl_opts);
        $response = curl_exec($curl);
        curl_close($curl);

        $curl_res = json_decode($response, true);

        
        // if access_token expired
        if(isset($curl_res["status"]) && $curl_res["status"] == 401){

            // onemap credentials
            $one_map_credentials = get_option(ONEMAP_META_KEY);

            $credentials_json = Zippy_Utils_Core::decrypt_data_input($one_map_credentials);
            if($credentials_json == false){
                return [
                    "error"=> "No credentials found",
                ];
            }
            $credentials = json_decode($credentials_json, true);
            $credentials["password"] = Zippy_Utils_Core::decrypt_data_input($credentials["password"]);

            // re-authen
            $authen = self::authentication($credentials);
            if(isset($authen["error"])){
                return $authen;
            }
            
            // update access_token
            update_option(ONEMAP_ACCESS_TOKEN_KEY, Zippy_Utils_Core::encrypt_data_input($authen["access_token"]));

            $is_access_token_expired = true;
        }

        // re-call API
        if($is_access_token_expired == true){
            self::call($method, $endpoint, $param);
        }
        return $curl_res;
    }

    public static function authentication($settings){

        $url = ONEMAP_API_URL . "/api/auth/post/getToken";
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_POSTFIELDS => json_encode($settings),
            CURLOPT_HTTPHEADER => array(
                "Content-Type: application/json"
            ),
        ));
    
        $response = curl_exec($curl);
        curl_close($curl);
        return json_decode($response, true);
    }


    public static function get($endpoint, $param){
        $get = self::call("GET", $endpoint, $param);
        return $get;
    }


    public static function post($endpoint, $param){
        $get = self::call("POST", $endpoint, $param);
        return $get;
    }

}
