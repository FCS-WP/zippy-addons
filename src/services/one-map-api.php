<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

use Zippy_Booking\Utils\Zippy_Utils_Core;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class One_Map_Api
{
	const AUTH_ENDPOINT = '/api/auth/post/getToken';
	const TIMEOUT = 10;

	public static function call(string $method, string $endpoint, array $params = [])
	{
		$url = rtrim(ONEMAP_API_URL, '/') . '/' . ltrim($endpoint, '/');

		$access_token = Zippy_Utils_Core::decrypt_data_input(get_option(ONEMAP_ACCESS_TOKEN_KEY));

		if (empty($access_token)) {
			return ['error' => 'Access token not found'];
		}


		try {
			$response = self::sendRequest($method, $url, $params, $access_token);

			if ((isset($response['status']) && $response['status'] == 401) ||
				isset($response['message']) &&	$response['message'] == "Unauthorized" ||
				(isset($response['error']))
			) {

				// Try refreshing token
				$new_token_data = self::refreshAccessToken();

				if (!empty($new_token_data['access_token'])) {
					$new_token = trim(preg_replace('/\s+/', '', $new_token_data['access_token']));

					return self::sendRequest($method, $url, $params, $new_token);
				}

				return ['error' => 'Token refresh failed'];
			}

			return $response;
		} catch (Exception $e) {
			return [
				'error' => 'Exception: ' . $e->getMessage(),
			];
		}
	}


	private static function sendRequest(string $method, string $url, array $params, string $access_token)
	{

		$token = trim(preg_replace('/\s+/', '', $access_token));
		$client = new Client([
			'timeout' => self::TIMEOUT,
			'http_errors' => false,
			'headers' => [
				'Authorization' => $token,
				'Content-Type'  => 'application/json',
			],
		]);

		try {

			$options = [];

			switch (strtoupper($method)) {
				case 'POST':
				case 'PUT':
				case 'DELETE':
					$options['json'] = $params;
					break;

				case 'GET':
					if (!empty($params)) {
						$options['query'] = $params;
					}
					break;
			}

			// Send the request
			$response = $client->request($method, $url, $options);
			// Decode the JSON response
			$body = (string) $response->getBody();
			$data = json_decode($body, true);

			return $data ?: ['error' => 'Invalid JSON response'];
		} catch (RequestException $e) {
			return [
				'error' => 'Request failed',
				'message' => $e->getMessage(),
				'response' => $e->hasResponse() ? (string) $e->getResponse()->getBody() : null,
			];
		} catch (\Exception $e) {

			return [
				'error' => 'Unexpected error',
				'message' => $e->getMessage(),
			];
		}
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
		$client = new Client([
			'base_uri' => ONEMAP_API_URL,
			'timeout'  => self::TIMEOUT,
			'headers'  => [
				'Content-Type' => 'application/json',
			],
		]);

		try {
			$response = $client->post(self::AUTH_ENDPOINT, [
				'json' => $credentials,
			]);

			$body = $response->getBody()->getContents();
			return json_decode($body, true);
		} catch (RequestException $e) {
			return [
				'error' => true,
				'message' => $e->getMessage(),
				'response' => $e->hasResponse()
					? (string) $e->getResponse()->getBody()
					: null,
			];
		}
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
