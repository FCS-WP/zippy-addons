<?php

/**
 * WooCommerce Booking Settings - Manual Order Enhancements
 */

namespace Zippy_Booking\Src\Woocommerce\Admin;

defined('ABSPATH') or exit;

use Zippy_Booking\Src\Services\Zippy_Handle_Shipping;

class Zippy_Woo_Manual_Order
{

  protected static $_instance = null;

  /**
   * Singleton instance
   *
   * @return Zippy_Woo_Manual_Order
   */
  public static function get_instance()
  {
    if (is_null(self::$_instance)) {
      self::$_instance = new self();
    }
    return self::$_instance;
  }

  /**
   * Constructor
   */
  public function __construct()
  {
    $this->set_hooks();
  }

  /**
   * Hook into WooCommerce
   */
  protected function set_hooks()
  {
    add_action('woocommerce_after_order_object_save', [$this, 'maybe_handle_manual_order'], 20, 2);
  }

  /**
   * Process shipping fees for manual orders
   *
   * @param \WC_Order $order
   * @param object    $data_store
   */
  public function maybe_handle_manual_order($order, $data_store)
  {
    if (! is_admin()) {
      return; // Only in wp-admin
    }

    if (! $order instanceof \WC_Order) {
      return;
    }

    // Only run for manual orders
    if ($order->get_meta('is_manual_order') !== 'yes') {
      return;
    }

    // Add shipping / extra fees
    Zippy_Handle_Shipping::process_add_shipping_fee($order);


    if ($this->is_order_edit_screen()) {
      echo '<script>setTimeout(function(){ location.reload(); }, 2000);</script>';
    }
  }

  private function is_order_edit_screen()
  {
    global $pagenow;

    return ($pagenow === 'admin-ajax.php'  && isset($_POST['action']) && $_POST['action'] === 'woocommerce_calc_line_taxes');
  }
}
