<?php

namespace Zippy_Booking\Src\Services;

use WC_Order;
use WC_Tax;
use WC_Order_Item_Shipping;
use WC_Order_Item_Fee;
use Zippy_Booking\Utils\Zippy_Wc_Calculate_Helper;

class Zippy_Handle_Shipping
{
  private const DEFAULT_MAX_DISTANCE = 99999999;

  public static function process_add_shipping_fee(WC_Order $order, $config)
  {
    $distance         = (float) $order->get_meta(BILLING_DISTANCE);
    $order_type       = $order->get_meta(BILLING_METHOD);

    if ($distance <= 0 || $order_type !== 'delivery') {
      return;
    }

    if ($order->get_shipping_total() > 0) {
      return;
    }

    if (!$config) {
      return;
    }

    $shipping_fee = (float) self::get_fee_from_config(maybe_unserialize($config->minimum_order_to_delivery), $distance);

    // Shipping
    if ($shipping_fee > 0) {
      self::add_shipping_item($order, 'Shipping Fee', $shipping_fee);
      $order->calculate_totals();
    }
  }


  public static function process_add_extra_fee(WC_Order $order, $config)
  {

    if (!$config) {
      return;
    }

    $customer_address = $order->get_meta(BILLING_DELIVERY);

    $extra_fee = (float) self::calculate_extra_fee(maybe_unserialize($config->extra_fee), $customer_address);
    // Extra Fee

    if ($extra_fee > 0) {
      self::add_fee_item($order, __('Extra Fee', 'zippy-booking'), $extra_fee);
      $order->calculate_totals();
    }
  }

  public static function process_free_shipping($order_id)
  {
    $order = wc_get_order(intval($order_id));


    $distance         = (float) $order->get_meta(BILLING_DISTANCE);
    $order_type       = $order->get_meta(BILLING_METHOD);

    if ($distance <= 0 || $order_type !== 'delivery') {
      return;
    }

    $config = self::query_shipping();

    $free_shipping_threshold = (float) self::get_fee_from_config(maybe_unserialize($config->minimum_order_to_freeship), $distance);
    if (self::is_free_shipping($order->get_total(), $free_shipping_threshold)) {
      self::add_free_shipping($order);
      $new_order = wc_get_order(intval($order_id));

      self::add_shipping_item($new_order, 'Free Shipping', 0);
      $new_order->calculate_totals();
    } else {
      $new_order = wc_get_order(intval($order_id));

      // add fee shipping Back
      self::process_add_shipping_fee($new_order, $config);
    }
  }

  public static function is_free_shipping($order_subtotal,  $minimum_order_to_freeship)
  {
    return $order_subtotal >= $minimum_order_to_freeship;
  }

  public static function query_shipping()
  {
    global $wpdb;
    $table = OUTLET_SHIPPING_CONFIG_TABLE_NAME;
    return $wpdb->get_row("SELECT * FROM {$table}");
  }

  public static function get_fee_from_config($config_data, $distance)
  {
    foreach ($config_data as $rule) {
      $min = (float) ($rule['greater_than'] ?? 0);
      $max = (float) ($rule['lower_than'] ?? self::DEFAULT_MAX_DISTANCE);

      if ($distance >= $min && $distance <= $max) {
        return (float) $rule['fee'];
      }
    }
    return 0.0;
  }

  public static function calculate_extra_fee($config_data, $delivery_address)
  {
    $postal_code = self::extract_postal_code($delivery_address);

    foreach ($config_data as $rule) {
      if (
        $rule['type'] === 'postal_code'
        && $postal_code >= $rule['from']
        && $postal_code <= $rule['to']
      ) {
        return floatval($rule['fee']);
      }
    }

    return 0;
  }

  public static function extract_postal_code($address)
  {
    if (is_array($address) && !empty($address['address_name'])) {
      $address = $address['address_name'];
    }

    $parts = preg_split('/\s+/', (string) $address);
    return trim(end($parts) ?: '');
  }

  public static function add_shipping_item($order, $method_title, $total)
  {
    $tax = Zippy_Wc_Calculate_Helper::get_tax($total);

    $shipping = new WC_Order_Item_Shipping();
    $shipping->set_method_title($method_title);
    $shipping->set_method_id('flat_rate');

    $shipping->set_total(floatval(value: $total - $tax));

    $taxes = array(
      'total'    => array(1 => $tax),
      'subtotal' => array(1 => $tax),
    );
    $shipping->set_taxes($taxes);

    $order->add_item($shipping);
  }

  private static function add_fee_item($order, $name, $amount)
  {
    $tax       = Zippy_Wc_Calculate_Helper::get_tax($amount);
    $subtotal  = $amount - $tax;

    $fee = new WC_Order_Item_Fee();
    $fee->set_name($name);
    $fee->set_total($subtotal);
    $fee->set_total_tax($tax);

    $taxes = array();
    if ($tax > 0) {
      $taxes[1] = $tax;
    }

    $fee->set_taxes(array(
      'total' => $taxes,
    ));

    $order->add_item($fee);
  }

  private static function add_free_shipping($order)
  {
    $old_shipping_fee = $order->get_items('shipping');

    if (sizeof($old_shipping_fee) > 0) {
      foreach ($old_shipping_fee as $item_id => $item) {
        $order->remove_item($item_id);
      }
      $order->calculate_totals();
    }
  }
}
