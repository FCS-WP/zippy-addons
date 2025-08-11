<?php

/**
 * Zippy Cart Handler
 *
 * @package Zippy_Booking
 */

namespace Zippy_Booking\Utils;

defined('ABSPATH') || exit;

use WC_Cart;

class Zippy_Cart_Handler
{
  public function __construct()
  {
    if (!WC()->cart) {
      wc_load_cart();
    }
  }

  /**
   * Add product to cart
   *
   * @param int   $product_id
   * @param int   $quantity
   * @param array $custom_data (Optional) Custom data to attach to the cart item
   * @return string|false Cart item key or false on failure
   */
  public function add_to_cart($product_id, $quantity = 1, $custom_data = [])
  {
    if (!$product_id) {
      return false;
    }

    // Add product to cart
 
    $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, 0, [], $custom_data);
    return $cart_item_key;
  }

  /**
   * Update quantity of an existing cart item
   *
   * @param string $cart_item_key
   * @param int    $new_quantity
   */
  public function update_cart_item($cart_item_key, $new_quantity)
  {
    if (WC()->cart->get_cart_item($cart_item_key)) {
      WC()->cart->set_quantity($cart_item_key, $new_quantity);
    }
  }

  /**
   * Remove an item from the cart
   *
   * @param string $cart_item_key
   */
  public function remove_cart_item($cart_item_key)
  {
    WC()->cart->remove_cart_item($cart_item_key);
  }

  /**
   * Empty the cart
   */
  public function clear_cart()
  {
    WC()->cart->empty_cart();
  }

  /**
   * Get all items in the cart
   *
   * @return array
   */
  public function get_cart_items()
  {
    return WC()->cart->get_cart();
  }
}
