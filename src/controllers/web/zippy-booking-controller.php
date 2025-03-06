<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web;

use WP_REST_Request;
use WP_Query;
use DateTime;

use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;

defined('ABSPATH') or die();

class Zippy_Booking_Controller
{
    public static function create_booking_with_product(WP_REST_Request $request)
    {
        global $wpdb;
        global $product;
        $booking_helper = new Zippy_Booking_Helper;

        $table_name = ZIPPY_BOOKING_TABLE_NAME;

        $product_id = intval($request->get_param('product_id'));
        $user_id = intval($request->get_param('user_id'));
        $email = sanitize_email($request->get_param('email'));
        $booking_start_date = sanitize_text_field($request->get_param('booking_start_date'));
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));
        $booking_start_time = sanitize_text_field($request->get_param('booking_start_time'));
        $booking_end_time = sanitize_text_field($request->get_param('booking_end_time'));

        $quantity = 1;


        if (empty($product_id) || empty($email) || empty($booking_start_date) || empty($booking_end_date) || empty($booking_start_time) || empty($booking_end_time)) {
            return Zippy_Response_Handler::error('Missing request parameter.');
        }

        $product = wc_get_product($product_id);

        $product_price = $product->get_price();

        if (!$product) {
            return Zippy_Response_Handler::error('Product does not exist.');
        }

        // Check if user exist or not. If not, create user
        if (empty($user_id)) {
            $user = get_user_by('email', $email);

            if (!$user) {
                $user_data = array(
                    'user_login' => $email,
                    'user_email' => $email,
                    'user_pass' => wp_generate_password(),
                    'role' => 'customer',
                );

                $user_id = wp_insert_user($user_data);

                if (is_wp_error($user_id)) {
                    return Zippy_Response_Handler::error('User creation failed.');
                }
            } else {
                $user_id = $user->ID;
            }
        }



        /** 
         * 
         * Check if booking time is available or not. 
         * If the time range from booking_start_date + booking_start_time to booking_end_date + booking_end_time is between any other booking time of this product or opposite, return error.
         * 
         */

        $overlap_check = get_option("allow_overlap");

        if (empty($overlap_check)) {
            return Zippy_Response_Handler::error('Failed to get booking config.');
        }

        $start_datetime = strtotime($booking_start_date . ' ' . $booking_start_time);
        $end_datetime = strtotime($booking_end_date . ' ' . $booking_end_time);

        if ($overlap_check == "F") {
            $query = "SELECT booking_start_date, booking_start_time, booking_end_date, booking_end_time FROM $table_name WHERE product_id = $product_id";
            $results = $wpdb->get_results($query);
            if (!empty($results)) {
                foreach ($results as $result) {
                    $result_start_timestamp = strtotime($result->booking_start_date . ' ' . $result->booking_start_time);
                    $result_end_timestamp = strtotime($result->booking_end_date . ' ' . $result->booking_end_time);

                    $first_condition = ($start_datetime >= $result_start_timestamp && $start_datetime <= $result_end_timestamp);
                    $second_condition = ($end_datetime >= $result_start_timestamp && $end_datetime <= $result_end_timestamp);
                    $third_condition = ($start_datetime <= $result_start_timestamp && $end_datetime >= $result_end_timestamp);

                    if ($first_condition || $second_condition || $third_condition) {
                        return Zippy_Response_Handler::error('This range of time is already booked for this product.');
                    }
                }
            }
        }
        $default_status_query = get_option("default_booking_status");

        $booking_type = get_option("booking_type");

        if ($booking_type == ZIPPY_BOOKING_BOOKING_TYPE_SINGLE) {
            $weekday = (new DateTime($booking_start_date))->format('w');

            if (!$weekday && $weekday !== '0') {
                return Zippy_Response_Handler::error('Invalid date');
            }

            /* check if time is extra or not. If is extra, use extra_price */
            $table_config = ZIPPY_BOOKING_CONFIG_TABLE_NAME;
            $query = "SELECT extra_time FROM $table_config WHERE weekday = $weekday";

            $config_results = $wpdb->get_results($query);

            if (empty($config_results)) {
                return Zippy_Response_Handler::error("Missing config for $booking_end_date");
            }

            $config_extra_time = maybe_unserialize($config_results[0]->extra_time);
            
            /* Handle extra time or holidays */
            if (!empty($config_extra_time)) {
                $data_get_extra_price = array(
                    'product_id' => $product_id,
                    'booking_start_date' => $booking_start_date,
                    'booking_start_time' => $booking_start_time,
                    'booking_end_date' => $booking_end_date,
                    'booking_end_time' => $booking_end_time,
                    'config_extra_time' => $config_extra_time,
                );
                $extra_price = $booking_helper->handle_extra_price($data_get_extra_price);
                $product_price = $extra_price > 0 ? $extra_price : $product_price;
            }
        }

        $default_status_query = get_option("default_booking_status");

        // Create order
        $order = wc_create_order();
        $order->add_product($product, $quantity, [
            'subtotal'     => $product_price,
            'total'        => $product_price,
        ]);
        $order->set_customer_id($user_id);
        $order->calculate_totals();
        $order_id = $order->get_id();

        $inserted = $wpdb->insert($table_name, array(
            'user_id' => $user_id,
            'email' => $email,
            'product_id' => $product_id,
            'booking_start_date' => $booking_start_date,
            'booking_end_date' => $booking_end_date,
            'booking_start_time' => $booking_start_time,
            'booking_end_time' => $booking_end_time,
            'booking_status' => $default_status_query,
            'order_id' => $order_id,
        ));

        $booking_id = $wpdb->insert_id;

        if (false === $inserted || empty($booking_id)) {
            return Zippy_Response_Handler::error('Failed to insert booking. Error: ' . $wpdb->last_error);
        }

        $custom_order_name = 'Booking #' . $booking_id;
        $order->add_order_note($custom_order_name);
        $order->update_meta_data('custom_order_name', $custom_order_name);
        $order->update_meta_data('booking_id', $booking_id);
        $order->update_meta_data('booking_start_date', $booking_start_date);
        $order->update_meta_data('booking_end_date', $booking_end_date);
        $order->update_meta_data('booking_start_time', $booking_start_time);
        $order->update_meta_data('booking_end_time', $booking_end_time);
        $order->save();

        if ($default_status_query === 'pending') {
            $order->update_status(ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD);
        } elseif ($default_status_query === 'approved') {
            $order->update_status(ZIPPY_BOOKING_BOOKING_STATUS_PENDING);
        }
        $order_payment_url = null;
        if ($order->get_status() === 'pending') {
            $order_payment_url = $order->get_checkout_payment_url();
        }

        // Check order status and add payment link if pending
        if (!empty($order)) {
            $order_data = [
                'ID' => $order_id,
                'order_status' => $order ? $order->get_status() : 'invalid',
                'order_total' => $order ? $order->get_total() : 0,
                'payment_link' => ($order && $order->get_status() === 'pending') ? $order->get_checkout_payment_url() : null
            ];
            $order->order_data = $order_data;
        }

        return Zippy_Response_Handler::success(
            array(
                'booking_id' => $booking_id,
                'user_id' => $user_id,
                'email' => $email,
                'product_id' => $product_id,
                'booking_start_date' => $booking_start_date,
                'booking_end_date' => $booking_end_date,
                'booking_start_time' => $booking_start_time,
                'booking_end_time' => $booking_end_time,
                'booking_status' => $default_status_query,
                'order_id' => $order_id,
                'order' => $order->order_data,
                'order_name' => $custom_order_name,
                'order_payment_url' => $order_payment_url
            ),
            'Booking and order created successfully.'
        );
    }

    public static function get_booking_with_product(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = ZIPPY_BOOKING_TABLE_NAME;

        $booking_id = $request->get_param('booking_id');
        $email = $request->get_param('email');
        $product_id = $request->get_param('product_id');

        $query = "
            SELECT b.*, o.ID AS order_id
            FROM $table_name b
            LEFT JOIN {$wpdb->prefix}posts o ON o.post_type = 'shop_order' 
            LEFT JOIN {$wpdb->prefix}postmeta pm ON o.ID = pm.post_id AND pm.meta_key = 'booking_id' 
            WHERE 1=1
        ";

        if ($booking_id) {
            $query .= $wpdb->prepare(" AND b.ID = %d", $booking_id);
        }
        if ($email) {
            $query .= $wpdb->prepare(" AND b.email = %s", $email);
        }
        if ($product_id) {
            $query .= $wpdb->prepare(" AND b.product_id = %d", $product_id);
        }

        $results = $wpdb->get_results($query);

        if (empty($results)) {
            return Zippy_Response_Handler::error('Booking not found.');
        }

        return Zippy_Response_Handler::success(
            !empty($results) ? $results[0] : array(),
            'Bookings retrieved successfully.'
        );
    }

    public static function delete_booking(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = ZIPPY_BOOKING_TABLE_NAME;

        $booking_id = intval($request->get_param('booking_id'));
        $user_id = intval($request->get_param('user_id'));

        if (empty($booking_id)) {
            return Zippy_Response_Handler::error('Missing booking_id parameter.');
        }

        $booking = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE ID = %d", $booking_id)
        );

        if (!$booking) {
            return Zippy_Response_Handler::error('Booking not found.');
        }

        if (!current_user_can('administrator') && $booking->user_id != $user_id) {
            return Zippy_Response_Handler::error('You do not have permission to delete this booking.');
        }

        $deleted = $wpdb->delete($table_name, array('ID' => $booking_id), array('%d'));

        if ($deleted === false) {
            return Zippy_Response_Handler::error('Failed to delete the booking.');
        }

        return Zippy_Response_Handler::success(
            array('deleted_id' => $booking_id),
            'Booking deleted successfully.'
        );
    }

    public static function update_booking(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = ZIPPY_BOOKING_TABLE_NAME;

        $booking_id = intval($request->get_param('booking_id'));
        $product_id = intval($request->get_param('product_id'));
        $booking_start_date = sanitize_text_field($request->get_param('booking_start_date'));
        $booking_start_time = sanitize_text_field($request->get_param('booking_start_time'));
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));
        $booking_end_time = sanitize_text_field($request->get_param('booking_end_time'));
        $booking_status = sanitize_text_field($request->get_param('booking_status'));

        if (empty($booking_id)) {
            return Zippy_Response_Handler::error('Missing booking_id parameter.');
        }

        $booking = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE ID = %d", $booking_id)
        );

        if (!$booking) {
            return Zippy_Response_Handler::error('Booking not found.');
        }



        /** 
         * 
         * Check if booking time is available or not. 
         * If the time range from booking_start_date + booking_start_time to booking_end_date + booking_end_time is between any other booking time of this product or opposite, return error.
         * 
         */

        $overlap_check = get_option("allow_overlap");

        if (empty($overlap_check)) {
            return Zippy_Response_Handler::error('Failed to get booking config.');
        }

        if ($overlap_check == "F") {
            $query = "SELECT booking_start_date, booking_start_time, booking_end_date, booking_end_time FROM $table_name WHERE product_id = $product_id AND ID != $booking_id";
            $results = $wpdb->get_results($query);
            if (!empty($results)) {
                foreach ($results as $result) {
                    $result_start_timestamp = strtotime($result->booking_start_date . ' ' . $result->booking_start_time);
                    $result_end_timestamp = strtotime($result->booking_end_date . ' ' . $result->booking_end_time);

                    $start_datetime = strtotime($booking_start_date . ' ' . $booking_start_time);
                    $end_datetime = strtotime($booking_end_date . ' ' . $booking_end_time);

                    if (($start_datetime >= $result_start_timestamp && $start_datetime <= $result_end_timestamp) ||
                        ($end_datetime >= $result_start_timestamp && $end_datetime <= $result_end_timestamp) ||
                        ($start_datetime <= $result_start_timestamp && $end_datetime >= $result_end_timestamp)
                    ) {
                        return Zippy_Response_Handler::error('This range of time is already booked for this product.');
                    }
                }
            }
        }


        $data_to_update = array();
        $where = array('ID' => $booking_id);

        if (!empty($booking_start_date)) {
            $data_to_update['booking_start_date'] = $booking_start_date;
        }
        if (!empty($booking_end_date)) {
            $data_to_update['booking_end_date'] = $booking_end_date;
        }
        if (!empty($booking_start_time)) {
            $data_to_update['booking_start_time'] = $booking_start_time;
        }
        if (!empty($booking_end_time)) {
            $data_to_update['booking_end_time'] = $booking_end_time;
        }
        if (!empty($booking_status)) {
            $data_to_update['booking_status'] = $booking_status;
        }

        if (empty($data_to_update)) {
            return Zippy_Response_Handler::error('No valid fields to update.');
        }

        $updated = $wpdb->update($table_name, $data_to_update, $where);

        if ($updated === false) {
            return Zippy_Response_Handler::error('Failed to update the booking.');
        }

        $order_id = $booking->order_id;

        if ($order_id) {
            $order = wc_get_order($order_id);

            if ($order) {
                switch ($booking_status) {
                    case ZIPPY_BOOKING_BOOKING_STATUS_PENDING:
                        $order->update_status(ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD);
                        break;
                    case 'approved':
                        $order->update_status('pending');
                        break;
                    case ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED:
                        $order->update_status(ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED);
                        break;
                    case 'cancel':
                        $order->update_status(ZIPPY_BOOKING_BOOKING_STATUS_CANCELLED);
                        break;
                }

                $order->save();
            }
        }

        return Zippy_Response_Handler::success(
            array(
                'booking_id' => $booking_id,
                'updated_fields' => $data_to_update
            ),
            'Booking and Order updated successfully.'
        );
    }

    public static function check_permission(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';

        $booking_id = intval($request->get_param('booking_id'));

        if (empty($user_id_from_request) || empty($booking_id)) {
            return Zippy_Response_Handler::error('Booking ID or User ID is missing.');
        }

        $booking = $wpdb->get_row(
            $wpdb->prepare("SELECT user_id FROM $table_name WHERE ID = %d", $booking_id)
        );

        if (!$booking) {
            return Zippy_Response_Handler::error('You do not have permission to update this booking.');
        }
    }
}
