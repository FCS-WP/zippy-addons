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
		$sql = $wpdb->prepare(
			"SELECT * 
			FROM {$table_name}
			WHERE outlet_id = %d
			AND deleted_at IS NULL",
			$outlet_id
		);

		$rows = $wpdb->get_results($sql, ARRAY_A);

		$result = [];

		foreach ($rows as $row) {
			$role    = $row['role_user'];
			$service = $row['service_type']; // delivery | take_away

			if (!isset($result[$role])) {
				$result[$role] = [];
			}

			$result[$role][$service] = [
				'id'      => (int) $row['id'],
				'visible'   => (bool) $row['visible'],
				'min_order' => (float) $row['min_order'],
				'start_date' => $row['start_date'],
				'end_date'   => $row['end_date'],
			];
		}

		return Zippy_Response_Handler::success($result);
	}

	public static function update_shipping_role_config(WP_REST_Request $request)
	{
		global $wpdb;
		$table_name = $wpdb->prefix . SHIPPING_ROLE_CONFIG_TABLE;

		$outlet_id = $request->get_param('outlet_id');
		$configs   = $request->get_param('configs');

		if (!$outlet_id || empty($configs) || !is_array($configs)) {
			return Zippy_Response_Handler::error('Invalid payload', 400);
		}

		foreach ($configs as $role_user => $services) {
			$role_user = sanitize_text_field($role_user);
			$now = current_time('mysql');

			// Parse start_date / end_date
			$start_date = array_key_exists('start_date', $services) && !empty($services['start_date'])
				? gmdate('Y-m-d H:i:s', strtotime($services['start_date']))
				: null;

			$end_date = array_key_exists('end_date', $services) && !empty($services['end_date'])
				? gmdate('Y-m-d 23:59:59', strtotime($services['end_date']))
				: null;

			foreach (['delivery', 'take_away'] as $service_type) {
				$config = $services[$service_type] ?? [];

				$row = $wpdb->get_row(
					$wpdb->prepare(
						"SELECT id FROM {$table_name} WHERE outlet_id = %d AND role_user = %s AND service_type = %s LIMIT 1",
						$outlet_id,
						$role_user,
						$service_type
					),
					ARRAY_A
				);

				$data = ['updated_at' => $now, 'deleted_at' => null];

				if (array_key_exists('start_date', $services)) {
					$data['start_date'] = $start_date;
				}

				if (array_key_exists('end_date', $services)) {
					$data['end_date'] = $end_date;
				}

				if (array_key_exists('visible', $config)) {
					$data['visible'] = (int) (bool) $config['visible'];
				}

				if (array_key_exists('min_order', $config)) {
					$data['min_order'] = (float) $config['min_order'];
				}

				if (count($data) <= 2) {
					continue;
				}

				if ($row) {
					$wpdb->update($table_name, $data, ['id' => (int) $row['id']]);
				} else {
					$wpdb->insert($table_name, array_merge($data, [
						'outlet_id'    => $outlet_id,
						'role_user'    => $role_user,
						'service_type' => $service_type,
						'created_at'   => $now,
					]));
				}
			}
		}

		return Zippy_Response_Handler::success([
			'message' => 'Shipping role config updated successfully',
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
			"SELECT service_type, visible, min_order, start_date, end_date
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
				'start_date' => $row['start_date'],
				'end_date'   => $row['end_date'],
			];
		}

		return Zippy_Response_Handler::success([
			'role'   => $role_slug,
			'config' => $result,
		]);
	}

	public static function delete_shipping_role_config_by_role(WP_REST_Request $request)
	{
		global $wpdb;

		$outlet_id = $request->get_param('outlet_id');
		$role_user = $request->get_param('role_user');

		if (empty($role_user) || empty($outlet_id)) {
			return Zippy_Response_Handler::error('Role and Outlet ID are required', 400);
		}

		$table = $wpdb->prefix . 'addons_shipping_role_config';
		$deleted_at = current_time('mysql');

		$sql = $wpdb->prepare(
			"
			UPDATE {$table}
			SET deleted_at = %s, updated_at = %s
			WHERE role_user = %s
			AND outlet_id = %d
			AND deleted_at IS NULL
			",
			$deleted_at,
			$deleted_at,
			$role_user,
			$outlet_id
		);

		$updated = $wpdb->query($sql);

		if ($updated === false) {
			return Zippy_Response_Handler::error('Delete failed', 500);
		}

		return Zippy_Response_Handler::success([
			'role'         => $role_user,
			'outlet_id'    => $outlet_id,
			'deleted_rows' => $updated,
			'deleted_at'   => $deleted_at,
		]);
	}
}
