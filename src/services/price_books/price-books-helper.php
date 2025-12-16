<?php

namespace Zippy_Booking\Src\Services\Price_Books;

use Zippy_Booking\Src\Services\Zippy_Datetime_Helper;
use Zippy_Booking\Src\Woocommerce\Admin\Zippy_Woo_Manual_Order;
use DateTimeZone;
use DateTime;

/**
 * Price_Books_Helper
 *
 *
 */
class Price_Books_Helper
{

  /**
   * Retrieves the final price for a given product and user.
   * * @param int|WC_Product $product    The product ID or WC_Product object.
   * @param int $user_id               The ID of the user requesting the price.
   * @return float                     The calculated price.
   */
  public static function get_pricebook_date()
  {
    $timezone = new DateTimeZone('Asia/Singapore');
    $now      = new DateTime('now', $timezone);

    // Default fallback (today at 00:00:00)
    $default_date = $now->format('Y-m-d 00:00:00');

    if (
      isset($_GET['order_id'], $_GET['action']) &&
      $_GET['action'] === Zippy_Woo_Manual_Order::ACTION_ADMIN_EDIT_ORDER
    ) {
      $order = wc_get_order((int) $_GET['order_id']);

      if ($order) {
        $billing_date = $order->get_meta(BILLING_DATE);

        if (!empty($billing_date)) {
          return (new DateTime($billing_date, $timezone))
            ->format('Y-m-d 00:00:00');
        }
      }

      return $default_date;
    }


    if (!empty(WC()->session)) {
      $session_date = WC()->session->get('date');

      if (!empty($session_date)) {
        return (new DateTime($session_date, $timezone))
          ->format('Y-m-d 00:00:00');
      }
    }

    return $default_date;
  }
}
