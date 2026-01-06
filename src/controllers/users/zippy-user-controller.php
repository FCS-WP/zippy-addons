<?php

namespace Zippy_Booking\Src\Controllers\Users;

use Zippy_Booking\Src\Services\Users\Zippy_User_Service;
use WP_REST_Request;
use WP_REST_Response;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;


defined('ABSPATH') or die();

class Zippy_User_Controller
{



  public static function get_user_roles(WP_REST_Request $request)
  {
    try {
      $roles = Zippy_User_Service::get_all_user_roles();

      return empty($roles)
        ? Zippy_Response_Handler::error($roles, 500)
        : Zippy_Response_Handler::success($roles, "User Role retrieved successfully.");
    } catch (\Exception $e) {
      return Zippy_Response_Handler::error($e->getMessage(), 500);
    }
  }
}
