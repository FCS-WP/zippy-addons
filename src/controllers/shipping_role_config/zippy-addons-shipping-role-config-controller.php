<?php

namespace Zippy_Booking\Src\Controllers\Shipping_Role_Config;

use Zippy_Booking\Src\Services\Price_Books\Price_Books_Service;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use WP_REST_Request;

class Zippy_Addons_Shipping_Role_Config_Controller
{

  public static function all_shipping_role_configs(WP_REST_Request $request)
  {
    $outlet_id = $request->get_param('outlet_id');
    global $wpdb;
    $table_name = $wpdb->prefix . SHIPPING_ROLE_CONFIG_TABLE;

    $rows = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE outlet_id = %s", $outlet_id), ARRAY_A);

    $result = [];

    foreach ($rows as $row) {
      $role    = $row['role_user'];
      $service = $row['service_type']; // delivery | take_away

      if (!isset($result[$role])) {
        $result[$role] = [];
      }

      $result[$role][$service] = [
        'visible'   => (bool) $row['visible'],
        'min_order' => (float) $row['min_order'],
      ];
    }

    return Zippy_Response_Handler::success($result);
  }

  public static function update_shipping_role_config(WP_REST_Request $request)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . SHIPPING_ROLE_CONFIG_TABLE;

    $outlet_id = sanitize_text_field($request->get_param('outlet_id'));
    $configs   = $request->get_param('configs');

    if (empty($outlet_id) || empty($configs) || !is_array($configs)) {
      return Zippy_Response_Handler::error('Invalid payload');
    }

    foreach ($configs as $role_user => $services) {

      $role_user = sanitize_text_field($role_user);

      foreach ($services as $service_type => $config) {

        // validate service
        if (!in_array($service_type, ['delivery', 'take_away'], true)) {
          continue;
        }

        $visible   = isset($config['visible']) ? (int) (bool) $config['visible'] : 0;
        $min_order = isset($config['min_order']) ? (float) $config['min_order'] : 0;

        // check exists
        $exists = $wpdb->get_var(
          $wpdb->prepare(
            "SELECT id FROM $table_name 
                     WHERE outlet_id = %s AND role_user = %s AND service_type = %s",
            $outlet_id,
            $role_user,
            $service_type
          )
        );

        if ($exists) {
          // UPDATE
          $wpdb->update(
            $table_name,
            [
              'visible'   => $visible,
              'min_order' => $min_order,
              'updated_at' => current_time('mysql'),
            ],
            ['id' => $exists],
            ['%d', '%f', '%s'],
            ['%d']
          );
        } else {
          // INSERT
          $wpdb->insert(
            $table_name,
            [
              'outlet_id'   => $outlet_id,
              'role_user'   => $role_user,
              'service_type' => $service_type,
              'visible'     => $visible,
              'min_order'   => $min_order,
              'created_at'  => current_time('mysql'),
              'updated_at'  => current_time('mysql'),
            ],
            ['%s', '%s', '%s', '%d', '%f', '%s', '%s']
          );
        }
      }
    }

    return Zippy_Response_Handler::success([
      'message' => 'Shipping role config updated successfully'
    ]);
  }

  public static function get_shipping_role_config_by_user(WP_REST_Request $request)
  {
    global $wpdb;
    $table_name = $wpdb->prefix . SHIPPING_ROLE_CONFIG_TABLE;

    $current_user = wp_get_current_user();
    $role_slug = $current_user->roles[0] ?? null;

    if (!$role_slug) {
      return Zippy_Response_Handler::error('User has no role assigned', 400);
    }

    $query = $wpdb->prepare(
      "SELECT service_type, visible, min_order
         FROM {$table_name}
         WHERE role_user = %s",
      $role_slug
    );

    $rows = $wpdb->get_results($query, ARRAY_A);

    $result = [];

    foreach ($rows as $row) {
      $service = $row['service_type']; // delivery | take_away

      $result[$service] = [
        'visible'   => (bool) $row['visible'],
        'min_order' => (float) $row['min_order'],
      ];
    }

    return Zippy_Response_Handler::success([
      'role'   => $role_slug,
      'config' => $result,
    ]);
  }
}
