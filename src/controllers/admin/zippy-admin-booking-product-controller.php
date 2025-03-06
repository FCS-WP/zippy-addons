<?php

/**
 * Admin Booking Controller
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use DateTime;
use Zippy_Booking\Utils\Zippy_Utils_Core;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();



class Zippy_Admin_Booking_Product_Controller
{
    public static function get_products_or_categories(WP_REST_Request $request)
    {
        try {
            // Rules
            $required_fields = [
                "keyword" => ["required" => true, "data_type" => "string"],
                "type" => ["required" => true, "data_type" => "range", "allowed_values" => ["product", "category"]],
            ];
            
            // Validate Request Fields
            $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
            if(!empty($validate)){
                return Zippy_Response_Handler::error($validate);
            }

            $type = sanitize_text_field($request["type"]);
            $keyword = sanitize_text_field($request["keyword"]);
            $product = null;
            
            $limit = 10;

            global $wpdb;

            $response = [];

            if($type == "product"){
                // Product    
                $sql = "
                    SELECT p.ID, p.post_title, pm.meta_value as sku 
                    FROM {$wpdb->posts} p
                    LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = '_sku'
                    WHERE p.post_type = 'product' 
                    AND p.post_status = 'publish'
                    AND (p.ID = %d OR pm.meta_value LIKE %s OR p.post_title LIKE %s)
                    LIMIT %d
                ";
            
                $results = $wpdb->get_results($wpdb->prepare(
                    $sql,
                    $keyword,
                    '%' . $wpdb->esc_like($keyword) . '%',
                    '%' . $wpdb->esc_like($keyword) . '%',
                    $limit
                ));
            
            
                if (!empty($results)) {
                    foreach ($results as $result) {
                        $product = wc_get_product($result->ID);
                        if ($product) {
                            $response[] = [
                                'id' => $product->get_id(),
                                'name' => $product->get_name(),
                                'regular_price' => $product->get_meta('_regular_price'),
                                'sale_price' => $product->get_meta('_sale_price'),
                                'extra_price' => $product->get_meta('_extra_price')
                            ];
                        }
                    }
                }
                
            } else {
                // Category
                $sql = "
                    SELECT t.term_id, t.name, t.slug
                    FROM {$wpdb->terms} t
                    INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
                    WHERE tt.taxonomy = 'product_cat'
                    AND (t.term_id = %d OR t.slug LIKE %s OR t.name LIKE %s)
                    LIMIT %d
                ";

                $results = $wpdb->get_results($wpdb->prepare(
                    $sql,
                    $keyword,
                    '%' . $wpdb->esc_like($keyword) . '%',
                    '%' . $wpdb->esc_like($keyword) . '%',
                    $limit
                ));

                if (!empty($results)) {
                    foreach ($results as $result) {
                        $response[] = [
                            'id' => $result->term_id,
                            'name' => $result->name,
                        ];
                    }
                }
            }

            // return results
            $message = empty($response) ?  ZIPPY_BOOKING_NOT_FOUND : ZIPPY_BOOKING_SUCCESS;
            return Zippy_Response_Handler::success($response, $message);

        } catch (Exception $e) {
            return Zippy_Response_Handler::error($e->getMessage());
        }
    }


    public static function check_product_mapping (WP_REST_Request $request){
        
        $required_fields = [
            "product_id" => ["required" => true, "data_type" => "number"],
        ];

        // Validate Request Fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if(!empty($validate)){
            return Zippy_Response_Handler::error($validate);
        }

        // check if product exist or not
        $product_id = intval($request["product_id"]);


        //message
        $not_support_message = "This product is NOT use for booking";
        $support_message = "This product is use for booking";
        

        $log_data = [
            "product_id" => $product_id,
        ];

        $product = wc_get_product($product_id);
        
        // product not exist
        if(empty($product)){
            return Zippy_Response_Handler::error(ZIPPY_BOOKING_NOT_FOUND);
        }


        try {
            global $wpdb;
            $table_name = ZIPPY_BOOKING_PRODUCT_MAPPING_TABLE_NAME;

            // check if product is mapped or not
            $query = "SELECT * FROM $table_name WHERE items_id=$product_id AND mapping_type='product'";
            $results = $wpdb->get_results($query);

            $response_data = [
                "product_id" => $product_id,
                "booking" => false,
            ];

            if(!empty($results)){
                foreach ($results as $res) {
                    $mapping_status = $res->mapping_status;

                    if($mapping_status == "exclude"){
                        Zippy_Log_Action::log('check_product_mapping', json_encode($log_data), 'Success', $not_support_message);
                        return Zippy_Response_Handler::success($response_data, $not_support_message);
                    } else if($mapping_status == "include"){
                        $response_data['regular_price'] = get_post_meta($product_id, '_regular_price', true);
                        $response_data['sale_price'] = get_post_meta($product_id, '_sale_price', true);
                        $response_data['extra_price'] = get_post_meta($product_id, '_extra_price', true);
                        $response_data['booking'] = true;
                        
                        Zippy_Log_Action::log('check_product_mapping', json_encode($log_data), 'Success', $support_message);
                        return Zippy_Response_Handler::success($response_data, $support_message);
                    }
                }
            }

            // check if product is belong to mapped category or not
            $product_cats_ids = wc_get_product_term_ids( $product_id, 'product_cat' );
            if(!empty($product_cats_ids)){
                foreach ($product_cats_ids as $cate_id) {   
                    $query = "SELECT * FROM $table_name WHERE items_id=$cate_id AND mapping_type='category' AND mapping_status='include'";
                    $results = $wpdb->get_results($query);
                    // return if found
                    if(!empty($results)){
                        $response_data['regular_price'] = get_post_meta($product_id, '_regular_price', true);
                        $response_data['sale_price'] = get_post_meta($product_id, '_sale_price', true);
                        $response_data['extra_price'] = get_post_meta($product_id, '_extra_price', true);
                        $response_data['booking'] = true;
                        Zippy_Log_Action::log('check_product_mapping', json_encode($log_data), 'Success', $support_message);
                        return Zippy_Response_Handler::success($response_data, $support_message);
                    }
                }
            }
            Zippy_Log_Action::log('check_product_mapping', json_encode($log_data), 'Success', $not_support_message);
            return Zippy_Response_Handler::success($response_data, $not_support_message);
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('check_product_mapping', json_encode($log_data), 'Failure', $message);
            return Zippy_Response_Handler::error($th->getMessage());
        }
    }
}