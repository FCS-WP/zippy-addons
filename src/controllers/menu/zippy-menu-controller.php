<?php

namespace Zippy_Booking\Src\Controllers\Menu;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();
class Zippy_Menu_Controller
{


  /**
   *
   * SET MENU
   *
   */

  public static function get_menu(WP_REST_Request $request)
  {
    // // Define validation rules
    // $required_fields = [
    //   "name" => ["data_type" => "array", "required" => true],
    //   "option_data" => ["data_type" => "array", "required" => true]
    // ];

    // // Validate request fields
    // $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

    // if (!empty($validate)) {
    //   return Zippy_Response_Handler::error($validate);
    // }

    $response = 'shin';

    return Zippy_Response_Handler::success($response);
  }
}
