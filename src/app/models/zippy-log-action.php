<?php

namespace Zippy_booking\Src\App\Models;

class Zippy_Log_Action
{

    public static $logger;

    const LOG_FILENAME = 'zippy_addon_woocommerce';

    public static function log($action, $details, $status, $message = '')
    {
        if (!class_exists('WC_Logger')) {
            return;
        }

        $logger = wc_get_logger();

        $log_entry = sprintf('==== Zippy Addon Log Start [%s] ==== ', date('d/m/Y H:i:s')) . "\n";
        $log_entry .= 'Action:' . $action . "\n";
        $log_entry .= 'Details:' . $details . "\n";
        $log_entry .= 'Status:' . $status . "\n";
        $log_entry .= 'Message:' . $message . "\n";
        $log_entry .= '==== Zippy Addon Log End====' . "\n\n";

        $logger->debug($log_entry, ['source' => self::LOG_FILENAME]);
    }
}
