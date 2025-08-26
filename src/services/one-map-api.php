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
	const AUTH_ENDPOINT = '/api/auth/post/getToken';
	const TIMEOUT = 10;

	public static function call(string $method, string $endpoint, array $params = [])
	{
		$url = ONEMAP_API_URL . $endpoint;
		$access_token = Zippy_Utils_Core::decrypt_data_input(get_option(ONEMAP_ACCESS_TOKEN_KEY));

		if (!$access_token) {
			return ['error' => 'Access token not found'];
		}

		$response = self::sendRequest($method, $url, $params, $access_token);

		// Check if token is expired
		if ((isset($response['status']) && $response['status'] == 401) || $response['message'] == "Unauthorized" || (isset($response['error']) && $response['error'] == 'Authentication token expired. Token are valid for 3 days. Please implement automatic renewal to ensure your token remains valid.')) {
			$new_token = self::refreshAccessToken();

			if (isset($new_token['error'])) {
				return $new_token; // Return the error
			}

			$response = self::sendRequest($method, $url, $params, $new_token['access_token']);
		}

		return $response;
	}

	/**
	 * Send the actual cURL request
	 */
	private static function sendRequest(string $method, string $url, array $params, string $access_token)
	{
		$curl = curl_init();

		$curl_opts = [
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => '',
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => self::TIMEOUT,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => $method,
			CURLOPT_HTTPHEADER => [
				"Authorization: Bearer $access_token",
				"Content-Type: application/json"
			],
		];

		// Add params based on method
		switch (strtoupper($method)) {
			case 'POST':
			case 'PUT':
			case 'DELETE':
				$curl_opts[CURLOPT_POSTFIELDS] = json_encode($params);
				break;

			case 'GET':
				if (!empty($params)) {
					$url .= '?' . http_build_query($params);
				}
				break;
		}

		$curl_opts[CURLOPT_URL] = $url;
		curl_setopt_array($curl, $curl_opts);

		$response = curl_exec($curl);
		$error = curl_error($curl);
		curl_close($curl);

		if ($error) {
			return ['error' => 'cURL Error: ' . $error];
		}

		return json_decode($response, true);
	}

	/**
	 * Refresh access token when expired
	 */
	private static function refreshAccessToken()
	{
		$credentials_encrypted = get_option(ONEMAP_META_KEY);
		$credentials_json = Zippy_Utils_Core::decrypt_data_input($credentials_encrypted);

		if (!$credentials_json) {
			return ['error' => 'No credentials found'];
		}

		$credentials = json_decode($credentials_json, true);
		$credentials['password'] = Zippy_Utils_Core::decrypt_data_input($credentials['password']);

		$auth_response = self::authenticate($credentials);

		if (!isset($auth_response['access_token'])) {
			return ['error' => 'Authentication failed'];
		}

		update_option(ONEMAP_ACCESS_TOKEN_KEY, Zippy_Utils_Core::encrypt_data_input($auth_response['access_token']));

		return $auth_response;
	}

	/**
	 * Authentication with OneMap
	 */
	public static function authenticate(array $credentials)
	{
		$url = ONEMAP_API_URL . self::AUTH_ENDPOINT;

		$curl = curl_init();
		curl_setopt_array($curl, [
			CURLOPT_URL => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_CUSTOMREQUEST => 'POST',
			CURLOPT_POSTFIELDS => json_encode($credentials),
			CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
			CURLOPT_TIMEOUT => self::TIMEOUT,
		]);

		$response = curl_exec($curl);
		curl_close($curl);

		return json_decode($response, true);
	}

	/**
	 * GET
	 */
	public static function get(string $endpoint, array $params = [])
	{
		return self::call('GET', $endpoint, $params);
	}

	/**
	 * POST
	 */
	public static function post(string $endpoint, array $params = [])
	{
		return self::call('POST', $endpoint, $params);
	}
}
