<?
namespace Zippy_booking\Src\Controllers\Mail;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();
class Zippy_Booking_Mail_Controller
{
    public static function send_mail(WP_REST_Request $request){

        try {

            $required_fields = [
                "subject" => ["required" => true, "data_type" => "string"],
                "content" => ["required" => true, "data_type" => "string"],
                "customer_email" => ["required" => true, "data_type" => "email"]
            ];

            // Validate Request Fields
            $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
            if(!empty($validate)){
                return Zippy_Response_Handler::error($validate);
            }

            $sender_name = get_bloginfo('name');
            $subject = sanitize_text_field($request["subject"]);
            $content = wp_kses_post($request["content"]);
            $customer_email = sanitize_text_field($request["customer_email"]);

            global $wpdb;
            $table_name     = ZIPPY_BOOKING_CONFIG_TABLE_NAME;
            $query = "SELECT store_email FROM $table_name WHERE 1=1";
            $store_email = $wpdb->get_results($query);
            $store_email = !empty($store_email) ? $store_email[0]->store_email : get_bloginfo('admin_email');
            $headers = [
                "Content-Type: text/html; charset=UTF-8",
                "From: $sender_name <$store_email>",
            ];
    
            $status = wp_mail($customer_email, $subject, $content, $headers);

            if ($status) {
                Zippy_Log_Action::log(
                    'mail',
                    json_encode(['to' => $customer_email, 'subject' => $subject, 'content' => $content]),
                    $status ? 'success' : 'failure',
                    $status ? ZIPPY_BOOKING_SUCCESS : 'Email failed to send.'
                );

                return Zippy_Response_Handler::error(ZIPPY_BOOKING_ERROR);    
            } else {
                return Zippy_Response_Handler::error("Fail to send email, please check the log!");
            }
        } catch (\Throwable $th) {
            Zippy_Log_Action::log(
                'mail',
                json_encode(['to' => $customer_email, 'subject' => $subject, 'content' => $content]),
                'failure',
                $th->getMessage()
            );
            return Zippy_Response_Handler::error("Fail to send email, please check the log!");
        }
    }
}
