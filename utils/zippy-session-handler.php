<?php

/**
 * Zippy Session Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Utils;

defined('ABSPATH') || exit;

use WC_Session_Handler;

class Zippy_Session_Handler
{

  /**
   * Initialize WooCommerce session.
   */
  public function init_session()
  {
    WC()->session = new WC_Session_Handler();
    WC()->session->init();
    WC()->session->set_customer_session_cookie(true);
  }

  /**
   * Set session data
   *
   * @param string $key
   * @param mixed $value
   */
  public function set($key, $value)
  {
    WC()->session->__set($key, $value);
  }

  /**
   * Get session data
   *
   * @param string $key
   * @param mixed $default Optional default value if not found.
   * @return mixed|null
   */
  public function get($key, $default = null)
  {
    $value = WC()->session->__get($key);
    return $value !== null ? $value : $default;
  }

  /**
   * Destroy a session key
   *
   * @param string $key
   */
  public function destroy($key)
  {
    if (WC()->session) {
      WC()->session->__unset($key);
    }
  }
}
