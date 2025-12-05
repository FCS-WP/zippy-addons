<?php

/**
 * WooCommerce Booking Settings - Manual Order Enhancements
 */

namespace Zippy_Booking\Src\Woocommerce\Admin;

defined('ABSPATH') or exit;

use Zippy_Booking\Src\Services\Zippy_Handle_Shipping;
use Zippy_Booking\Src\Woocommerce\Admin\Payments\Zippy_Gateway_Paid_Upon_Collection;
use Zippy_Booking\Src\Woocommerce\Admin\Payments\Zippy_Gateway_Cash;

class Zippy_Woo_Manual_Order
{

  protected static $_instance = null;

  const CASH_ON_DELIVERY = 'Cash on delivery';
  const PAID_UPON_COLLECTION = 'Paid Upon Collection';
  const CASH = 'Cash';
  const PENDING = 'pending';
  const ON_HOLD = 'on-hold';
  const PROCESSING = 'processing';

  //Action
  const ACTION_ADMIN_EDIT_ORDER = 'admin_edit_order';

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
    add_action('woocommerce_new_order', [$this, 'maybe_handle_manual_order'], 20, 2);
    add_action('woocommerce_order_item_shipping_after_calculate_taxes', [$this, 'remove_tax_from_shipping_fee'], 10, 2);
    add_filter('woocommerce_payment_gateways', [$this, 'add_payment_gateway']);
    add_action('woocommerce_update_order', [$this, 'maybe_handle_update_manual_order'], 20, 2);
  }

  public function add_payment_gateway($methods)
  {
    if (!is_admin()) {
      return $methods;
    }

    $methods[] = new Zippy_Gateway_Paid_Upon_Collection();
    $methods[] = new Zippy_Gateway_Cash();
    return $methods;
  }

  /**
   * Process shipping fees for manual orders
   *
   * @param \WC_Order $order
   * @param object    $data_store
   */
  public function maybe_handle_manual_order($order_id)
  {
    if (! is_admin()) {
      return; // Only in wp-admin
    }
    $order = wc_get_order($order_id);


    if (! $order instanceof \WC_Order) {
      return;
    }

    if (! $_POST['is_manual_order']) {
      return;
    }

    $this->add_order_meta_data_manual($order);
    $order->save();


    $order_new = wc_get_order($order_id);


    if (! $order instanceof \WC_Order) {
      return;
    }


    // Only run for manual orders
    if ($order->get_meta('is_manual_order') !== 'yes') {
      return;
    }

    $config = Zippy_Handle_Shipping::query_shipping();

    // Add shipping / extra fees
    Zippy_Handle_Shipping::process_add_shipping_fee($order_new, $config);
    Zippy_Handle_Shipping::process_add_extra_fee($order_new, $config);

    // New order calculate
    $order_new->save();
  }

  public function maybe_handle_update_manual_order($order_id)
  {
    if (! is_admin()) {
      return;
    }

    $order = wc_get_order($order_id);
    if (! $order instanceof \WC_Order) {
      return;
    }

    if (! $_POST['is_manual_order']) {
      return;
    }

    $this->update_order_meta_data_manual($order);
    $order->save_meta_data();
  }

  public function update_order_meta_data_manual($order)
  {
    if (isset($_POST['name_admin_created_order'])) {
      $order->update_meta_data('name_admin_created_order', sanitize_text_field($_POST['name_admin_created_order']));
    }
  }

  public function remove_tax_from_shipping_fee($shipping_item)
  {

    $shipping_item->set_taxes([
      'total'    => array(),
      'subtotal' => array(),
    ]);
  }

  private function add_order_meta_data_manual($order)
  {
    // Check and save custom fields if exist
    if (isset($_POST['_billing_outlet'])) {
      $order->update_meta_data('_billing_outlet', sanitize_text_field($_POST['_billing_outlet']));
    }
    if (isset($_POST['_billing_outlet_name'])) {
      $order->update_meta_data('_billing_outlet_name', sanitize_text_field($_POST['_billing_outlet_name']));
    }
    if (isset($_POST['_billing_outlet_address'])) {
      $order->update_meta_data('_billing_outlet_address', sanitize_text_field($_POST['_billing_outlet_address']));
    }
    if (isset($_POST['_billing_date'])) {
      $order->update_meta_data('_billing_date', sanitize_text_field($_POST['_billing_date']));
    }
    if (isset($_POST['_billing_delivery_to'])) {
      $order->update_meta_data('_billing_delivery_to', sanitize_text_field($_POST['_billing_delivery_to']));
    }
    if (isset($_POST['_billing_delivery_postal'])) {
      $order->update_meta_data('_billing_delivery_postal', sanitize_text_field($_POST['_billing_delivery_postal']));
    }
    if (isset($_POST['_billing_distance'])) {
      $order->update_meta_data('_billing_distance', sanitize_text_field($_POST['_billing_distance']));
    }
    if (isset($_POST['_billing_time'])) {
      $order->update_meta_data('_billing_time', sanitize_text_field($_POST['_billing_time']));
    }
    if (isset($_POST['_billing_method_shipping'])) {
      $order->update_meta_data('_billing_method_shipping', sanitize_text_field($_POST['_billing_method_shipping']));
    }
    if (isset($_POST['is_manual_order'])) {
      $order->update_meta_data('is_manual_order', sanitize_text_field($_POST['is_manual_order']));
    }

    $user_id = get_current_user_id();
    if ($user_id) {
      $order->update_meta_data('_created_by_admin', $user_id);
    }

    if (isset($_POST['name_admin_created_order'])) {
      $order->update_meta_data('name_admin_created_order', sanitize_text_field($_POST['name_admin_created_order']));
    }
  }
}
