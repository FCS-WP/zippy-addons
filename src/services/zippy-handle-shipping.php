<?php

namespace Zippy_Booking\Src\Services;

use WC_Order;
use WC_Tax;
use WC_Order_Item_Shipping;
use WC_Order_Item_Fee;

class Zippy_Handle_Shipping
{
  private const DEFAULT_MAX_DISTANCE = 99999999;

  public static function process_add_shipping_fee(WC_Order $order)
  {
    $distance         = (float) $order->get_meta(BILLING_DISTANCE);
    $order_type       = $order->get_meta(BILLING_METHOD);
    $customer_address = $order->get_meta(BILLING_DELIVERY);

    if ($distance <= 0 || $order_type !== 'delivery') {
      return;
    }

    if ($order->get_shipping_total() > 0) {
      return;
    }

    $config = self::query_shipping();
    if (!$config) {
      return;
    }

    $shipping_fee = (float) self::get_fee_from_config(maybe_unserialize($config->minimum_order_to_delivery), $distance);
    $extra_fee = (float) self::calculate_extra_fee(maybe_unserialize($config->extra_fee), $customer_address);

    // Shipping
    if ($shipping_fee > 0) {
      self::add_shipping_item($order, 'Shipping Fee', $shipping_fee);
    }

    // Extra Fee
    if ($extra_fee > 0) {
      self::add_fee_item($order, __('Extra Fee', 'zippy-booking'), $extra_fee);
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
    }
  }

  public static function is_free_shipping($order_total,  $minimum_order_to_freeship)
  {
    return $order_total >= $minimum_order_to_freeship;
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
    $shipping = new WC_Order_Item_Shipping();
    $shipping->set_method_title($method_title);
    $shipping->set_total(floatval($total));

    $tax_rates = WC_Tax::get_shipping_tax_rates();
    $taxes     = WC_Tax::calc_tax($total, $tax_rates, false);
    $total_tax = array_sum($taxes);

    $shipping->set_taxes(['total' => $taxes]);
    // $shipping->set_tax_class('standard');

    $order->add_item($shipping);

    $order->calculate_totals();
  }





  private static function add_fee_item($order, $name, $amount)
  {
    $fee = new WC_Order_Item_Fee();
    $fee->set_name($name);
    $fee->set_total(floatval($amount));

    $tax_rates   = WC_Tax::get_rates('standard');
    $taxes       = WC_Tax::calc_tax($amount, $tax_rates, false);
    $total_tax   = array_sum($taxes);

    $fee->set_taxes(['total' => $taxes]);
    $fee->set_total_tax($total_tax);
    $fee->set_tax_class('standard');

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
