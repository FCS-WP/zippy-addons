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

  /**
   * Handles the DELETE request to delete a single Price Book.
   * @param WP_REST_Request $request
   */
  public static function delete_pricebook(WP_REST_Request $request)
  {
    $id = (int) $request->get_param('id');

    if (empty($id)) {
      return Zippy_Response_Handler::error('Price Book ID is required.', 400);
    }

    $success = Price_Books_Service::delete_pricebook($id);

    if ($success) {
      return Zippy_Response_Handler::success(['message' => 'Price Book deleted successfully.']);
    } else {
      return Zippy_Response_Handler::error('Failed to delete Price Book.', 500);
    }
  }

  public static function get_todays_active_pricebooks(WP_REST_Request $request)
  {

    $result = Price_Books_Service::get_todays_active_pricebooks();

    if ($result) {
      // Return a success response, optionally include the updated ID
      return Zippy_Response_Handler::success($result, 'Get Price Book successfully.');
    } else {
      // This might mean a DB error or 0 rows were affected (no change made)
      return Zippy_Response_Handler::success([], 'Not Found.');
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

  /**
   *
   * Handles down load template for Bulk Import.
   */

  public static function download_template($request)
  {
    if (ob_get_contents()) ob_end_clean();

    $filename = "pricebook_import_template_" . date('Y-m-d') . ".csv";

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=' . $filename);
    header('Pragma: no-cache');
    header('Expires: 0');

    $output = fopen('php://output', 'w');

    fputcsv($output, [
      'sku',
      'price_type',
      'price_value',
      'visibility'
    ]);

    // Inside download_template method
    fputcsv($output, ['SKU-001', 'percent_off', '10.5', 'show']);
    fputcsv($output, ['SKU-002', 'percent_off', '10.5', 'show']);
    fputcsv($output, ['SKU-003', 'fixed', '150.00', 'show']);
    fputcsv($output, ['SKU-004', 'fixed_off', '5.00', 'hide']);

    fclose($output);
    exit;
  }

  /**
   *
   * Handles the Bulk Import.
   */

  public static function bulk_import(WP_REST_Request $request)
  {
    $price_book_id = (int) $request->get_param('pricebook_id');
    if (empty($price_book_id)) {
      return Zippy_Response_Handler::error('Price Book ID is required for import.', 400);
    }

    $files = $request->get_file_params();
    if (empty($files['csv'])) {
      return Zippy_Response_Handler::error('No CSV file was uploaded.', 400);
    }

    $file_path = $files['csv']['tmp_name'];

    $imported_count = Price_Books_Service::bulk_import_product_rules($price_book_id, $file_path);

    if ($imported_count !== false) {
      return Zippy_Response_Handler::success([
        'message' => 'Products imported successfully.',
        'imported_count' => $imported_count
      ]);
    } else {
      return Zippy_Response_Handler::error('Failed to import products. Please check the CSV format.', 500);
    }
  }
}
