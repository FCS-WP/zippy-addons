<?php

/**
 * Admin Booking Controller
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;


use WP_REST_Request;
use WC_Order_Query;
use PDO;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_Booking\Src\App\Zippy_Response_Handler;

defined('ABSPATH') or die();



class Zippy_Admin_Booking_Seeding_Controller
{   
    public static function run(WP_REST_Request $request)
    {

        $required_fields = [
            "type" => ["required" => true, "data_type" => "range", "allowed_values" => ["booking", "booking_mapping", "configs"]],
            "row" => ["required" => true, "data_type" => "number"]
        ];


        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if(!empty($validate)){
            return Zippy_Response_Handler::error($validate);
        }

        if (!defined('DB_CHARSET')) {
            define('DB_CHARSET', 'utf8');
        }

        if (!defined('DB_NAME')) {
            define('DB_NAME', 'booking_plugins');
        }
        
        
        global $wpdb;
        
        $host_data = $wpdb->parse_db_host(DB_HOST);
        
        if (is_array($host_data)) {
        list($host, $port, $socket, $is_ipv6) = $host_data;
        } else {
        // Redacted. Throw an error or something
        }
        

        if ($is_ipv6 && extension_loaded('mysqlnd')) {
        $host = "[$host]";
        }
        
        // Generate either a socket connection string or TCP connection string
        if (isset($socket)) {
        $connection_str = 'mysql:unix_socket=' . $socket . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        } else {
        $connection_str = 'mysql:host=' . $host . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        
        if (isset($port)) {
            $connection_str .= ';port=' . $port;
        }
        }

        // Open the connection
        $pdo = new PDO($connection_str, 'root', 'root');

        $seeder = new \tebazil\dbseeder\Seeder($pdo);
        $generator = $seeder->getGeneratorConfigurator();
        $faker = $generator->getFakerConfigurator();

        $type = $request["type"];

        if ($type == "booking") {
            $products = wc_get_products([
                'limit' => -1, 
                'status' => 'publish',
            ]);
    
            $product_ids = [];
            if(!empty($products)){
                foreach ($products as $product) {
                    $product_ids[] = $product->get_id();
                }
            }
            
            $query = new WC_Order_Query(["limit" => -1]);
            $orders = $query->get_orders();

            $order_ids = [];

            if(!empty($orders)){
                foreach ($orders as $order) {
                    $order_ids[] = $order->get_id();
                }
            }

            $seeder->table(ZIPPY_BOOKING_TABLE_NAME)->columns([
                'id',
                'user_id' => $faker->numberBetween(1, 20),
                'email' => $faker->email(),
                'product_id' => $faker->randomElement($product_ids),
                'order_id' => $faker->randomElement($order_ids),
                'booking_start_date' => $faker->date("Y-m-d", '2024-01-10'),
                'booking_start_time' => $faker->time(),
                'booking_end_date' => $faker->date("Y-m-d", 'now'), 
                'booking_end_time' => $faker->time(),
                'booking_status' => $faker->randomElement(['completed', 'cancelled', 'onhold', 'processing', 'pending']),
                'created_at' => current_time('mysql'),
            ])->rowQuantity($request["row"]);
        
            $seeder->refill();
        }


        if ($type == "booking_mapping") {
            $products = wc_get_products([
                'limit' => -1, 
                'status' => 'publish',
            ]);
            $datas = [];
            $i = 1;
            if (!empty($products)) {
                
                foreach ($products as $product) {
                    $temp_product = [];
                    $temp_product[] = $i;
                    $temp_product[] = $product->get_id();
                    $temp_product[] = "product";
                    $i++;
                    $datas[] = $temp_product;
                }
            }
            $categories = get_terms([
                'taxonomy'   => 'product_cat',
                'hide_empty' => false,
            ]);


            if (!empty($categories)) {
                foreach ($categories as $category) {
                    $temp_cate = [];
                    $temp_cate[] = $i;
                    $temp_cate[] = $category->term_id;
                    $temp_cate[] = "category";
                    $i++;
                    $datas[] = $temp_cate;
                }
            }
            $columnConfig = [false,'items_id','mapping_type'];
            $seeder->table(ZIPPY_BOOKING_PRODUCT_MAPPING_TABLE_NAME)->data($datas, $columnConfig)->rowQuantity($request["row"]);

            $seeder->refill();
        }
    }
}
