<?php

namespace Zippy_Booking\Src\Controllers\Price_Books;

use Zippy_Booking\Src\Services\Price_Books\Price_Books_Service;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use WP_REST_Request;

class Zippy_Price_Books_Controller
{

  public static function show()
  {
    $get_pricebooks = Price_Books_Service::get_pricebooks();
    return Zippy_Response_Handler::success($get_pricebooks);
  }

  /**
   * Handles the POST request to create a new Price Book container.
   * @param WP_REST_Request $request The incoming API request.
   */
  public static function store(WP_REST_Request $request)
  {
    $params = $request->get_json_params();

    $required_fields = [
      "name" => ["required" => true, "data_type" => "string"],
      "role" => ["required" => true, "data_type" => "string"],
    ];

    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    $new_id = Price_Books_Service::create_pricebook([
      'name'      => $params['name'],
      'role'      => $params['role'],
      'start_date' => $params['start_date'],
      'end_date'   => $params['end_date'],
      'is_exclusive'   => $params['is_exclusive'] ?? 0,
    ]);

    if ($new_id) {
      return Zippy_Response_Handler::success(['id' => $new_id, 'message' => 'Price Book created successfully.'], 201);
    } else {
      return Zippy_Response_Handler::error('Failed to create Price Book due to a database error.', 500);
    }
  }

  /**
   * Handles the GET request to fetch a single Price Book container.
   * @param WP_REST_Request $request
   */
  public static function fetch(WP_REST_Request $request)
  {
    $id = (int) $request->get_param('id');

    if (empty($id)) {
      return Zippy_Response_Handler::error('Price Book ID is required.', 400);
    }

    $book = Price_Books_Service::get_pricebook_by_id($id);

    if ($book) {
      return Zippy_Response_Handler::success($book);
    } else {
      return Zippy_Response_Handler::error('Price Book not found.', 404);
    }
  }

  /**
   * Handles the PUT request to update a single Price Book container.
   * @param WP_REST_Request $request
   */
  public static function update(WP_REST_Request $request)
  {
    $id = (int) $request->get_param('id');
    $params = $request->get_json_params();

    if (empty($id)) {
      return Zippy_Response_Handler::error('Price Book ID is required for update.', 400);
    }

    // Basic validation
    if (empty($params['name']) || empty($params['role'])) {
      return Zippy_Response_Handler::error('Price Book name and role are required.', 400);
    }

    $result = Price_Books_Service::update_pricebook($id, [
      'name'      => $params['name'],
      'role'      => $params['role'],
      'start_date' => $params['start_date'],
      'end_date'   => $params['end_date'],
      'status'    => $params['status'] ?? 'active',
      'is_exclusive'   => $params['is_exclusive'] ?? 0,
    ]);

    if ($result) {
      // Return a success response, optionally include the updated ID
      return Zippy_Response_Handler::success(['id' => $id, 'message' => 'Price Book updated successfully.']);
    } else {
      // This might mean a DB error or 0 rows were affected (no change made)
      return Zippy_Response_Handler::error('Failed to update Price Book or no changes were detected.', 500);
    }
  }

  public static function store_rule(WP_REST_Request $request)
  {
    $pricebook_id = (int) $request->get_param('pricebook_id');
    $params = $request->get_json_params();

    // 1. Validation

    $required_fields = [
      "product_id" => ["required" => true, "data_type" => "number"],
      "price_value" => ["required" => true, "data_type" => "number"],
    ];

    $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
    if (!empty($validate)) {
      return Zippy_Response_Handler::error($validate, 400);
    }

    // 2. Call the Service to insert data
    $new_id = Price_Books_Service::create_product_rule($pricebook_id, [
      'product_id'  => $params['product_id'],
      'price_type'  => $params['price_type'],
      'price_value' => $params['price_value'],
      'visibility' => $params['visibility'],
    ]);

    // 3. Handle result
    if ($new_id) {
      return Zippy_Response_Handler::success(['id' => $new_id, 'message' => 'Product Rule added successfully.'], 201);
    } else {
      return Zippy_Response_Handler::error('Failed to add Product Rule (Database error or rule already exists).', 500);
    }
  }
  /**
   * 
   * Handles the GET request to fetch all Product Rules for a Price Book.
   */

  public static function get_rules(WP_REST_Request $request)
  {
    $pricebook_id = (int) $request->get_param('pricebook_id');

    if (empty($pricebook_id)) {
      return Zippy_Response_Handler::error('Price Book ID is required.', 400);
    }

    $rules = Price_Books_Service::get_product_rules($pricebook_id);

    // Return the list of rules (which could be an empty array [])
    return Zippy_Response_Handler::success($rules);
  }

  /**
   * 
   * Handles the UPDATE request to update a specific Product Rule.
   */

  public static function update_product_rule(WP_REST_Request $request)
  {

    $rule_id = (int) $request->get_param('rule_id');

    $pricebook_id = (int) $request->get_param('pricebook_id');


    if (empty($rule_id) || empty($pricebook_id)) {
      return Zippy_Response_Handler::error('Product Rule ID is required for update.', 400);
    }

    $data = $request->get_json_params();

    try {
      $result = Price_Books_Service::update_product_rule($pricebook_id, $rule_id, $data);

      if (is_wp_error($result)) {
        return Zippy_Response_Handler::error('Failed to update Product Rule.', 500);
      }

      return Zippy_Response_Handler::success($data, 'Product rule updated successfully.');
    } catch (\Exception $e) {
      return new WP_REST_Response(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
  }
  /**
   *
   * Handles the DELETE request to remove a specific Product Rule.
   */

  public static function delete_rule(WP_REST_Request $request)
  {
    // The rule ID is typically passed as a parameter in the DELETE request URL
    $rule_id = (int) $request->get_param('id');

    if (empty($rule_id)) {
      return Zippy_Response_Handler::error('Product Rule ID is required for deletion.', 400);
    }

    $result = Price_Books_Service::delete_product_rule($rule_id);

    if ($result) {
      return Zippy_Response_Handler::success(['message' => 'Product Rule deleted successfully.']);
    } else {

      return Zippy_Response_Handler::error('Failed to delete Product Rule.', 500);
    }
  }
}
