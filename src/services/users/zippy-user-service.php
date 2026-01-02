<?php

namespace Zippy_Booking\Src\Services\Users;

class Zippy_User_Service
{
  public static function get_all_user_roles()
  {
    if (! function_exists('get_editable_roles')) {
      require_once ABSPATH . 'wp-admin/includes/user.php';
    }

    $roles = get_editable_roles();
    $formatted_roles = [];
    $fillter_out = ['administrator', 'front_counter_packer', 'order_manager'];

    foreach ($roles as $role_slug => $role_data) {
      if (!in_array($role_slug, $fillter_out)) {
        $formatted_roles[] = [
          'slug' => $role_slug,
          'name' => translate_user_role($role_data['name']),
        ];
      }
    }

    return $formatted_roles;
  }
}
