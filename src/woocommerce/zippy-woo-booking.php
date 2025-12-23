<?php

/**
 * Woocommece Booking Settings
 *
 *
 */

namespace Zippy_Booking\Src\Woocommerce;


defined('ABSPATH') or die();

use Zippy_Booking\Src\Woocommerce\Admin\Zippy_Woo_Orders;
use Zippy_Booking\Src\Woocommerce\Admin\Zippy_Product_Composite;
use Zippy_Booking\Src\Woocommerce\Admin\Zippy_Woo_Manual_Order;
use Zippy_Booking\Src\Woocommerce\Zippy_Price_Books;
use WC_Session_Handler;

class Zippy_Woo_Booking
{
  protected static $_instance = null;

  /**
   * @return Zippy_Woo_Booking
   */

  public static function get_instance()
  {
    if (is_null(self::$_instance)) {
      self::$_instance = new self();
    }
    return self::$_instance;
  }

  public function __construct()
  {
    if (!function_exists('is_plugin_active')) {

      include_once(ABSPATH . 'wp-admin/includes/plugin.php');
    }
    if (!is_plugin_active('woocommerce/woocommerce.php')) return;

    $this->set_hooks();

    /* Update Checkout After Applied Coupon */
    add_action('woocommerce_applied_coupon', array($this, 'after_apply_coupon_action'));

    add_action('init', array($this, 'init_woo_session'), 5);

    add_action('woocommerce_init', array($this, 'init_pricebook'), 5);

    Zippy_Woo_Orders::get_instance();

    Zippy_Woo_Manual_Order::get_instance();

    new Zippy_Product_Composite;
  }

  function after_apply_coupon_action($coupon_code)
  {
    echo '<script>jQuery( "body" ).trigger( "update_checkout" ); </script>';
  }

  public function init_pricebook()
  {
    new Zippy_Price_Books();
  }

  public function init_woo_session()
  {
    if (!WC()->session) {
      WC()->session = new WC_Session_Handler();
      WC()->session->init();
    }

    if (!WC()->session->has_session()) {
      WC()->session->set_customer_session_cookie(true);
    }
  }

  protected function set_hooks()
  {
    add_filter('wc_get_template_part', array($this, 'override_woocommerce_template_part'), 1, 3);
    add_filter('woocommerce_locate_template', array($this, 'override_woocommerce_template'), 1, 3);
  }

  /**
   * Template Part's
   *
   * @param  string $template Default template file path.
   * @param  string $slug     Template file slug.
   * @param  string $name     Template file name.
   * @return string           Return the template part from plugin.
   */
  public function override_woocommerce_template_part($template, $slug, $name)
  {

    $template_directory = untrailingslashit(plugin_dir_path(__FILE__)) . "/templates/";
    if ($name) {
      $path = $template_directory . "{$slug}-{$name}.php";
    } else {
      $path = $template_directory . "{$slug}.php";
    }
    return file_exists($path) ? $path : $template;
  }
  /**
   * Template File
   *
   * @param  string $template      Default template file  path.
   * @param  string $template_name Template file name.
   * @param  string $template_path Template file directory file path.
   * @return string                Return the template file from plugin.
   */
  public function override_woocommerce_template($template, $template_name, $template_path)
  {

    $template_directory = untrailingslashit(plugin_dir_path(__FILE__)) . "/templates/";

    $path = $template_directory . $template_name;
    // echo 'template: ' . $path . '<br/>';

    return file_exists($path) ? $path : $template;
  }
}
