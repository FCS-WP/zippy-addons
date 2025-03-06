<?php
namespace Zippy_booking\Src\App\Models;

class Zippy_Log_Action {
    public static function log($action, $details, $status, $message = '') {
        global $wpdb;
        $table_name = ZIPPY_BOOKING_LOG_TABLE_NAME;
    
        $result = $wpdb->insert(
            $table_name,
            [
                'action' => $action,
                'details' => $details,
                'status' => $status,
                'message' => $message,
                'created_at' => current_time('mysql'),
            ],
            [
                '%s', '%s', '%s', '%s', '%s'
            ]
        );
        return $result !== false;
    }
}