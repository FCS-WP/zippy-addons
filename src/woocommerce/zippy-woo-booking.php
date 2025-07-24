<?php

/**
 * Woocommece Booking Settings
 *
 *
 */

namespace Zippy_Booking\Src\Woocommerce;

defined('ABSPATH') or die();

use Zippy_Booking\Src\Services\Zippy_Booking_Helper;
use Zippy_Booking\Utils\Zippy_Session_Handler;
use Zippy_Booking\Utils\Zippy_Utils_Core;

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
    add_action('woocommerce_product_options_pricing', array($this, 'add_custom_price_field_to_product'));
    add_filter('woocommerce_add_to_cart_validation', array($this, 'check_product_category_before_add_to_cart'), 10, 5);
  }

  function check_product_category_before_add_to_cart($passed, $product_id, $quantity, $variation_id = null, $variations = null)
  {
    if (isset($_POST['zippy_source_path'])) {
        $cart_item_data['zippy_source_path'] = sanitize_text_field($_POST['zippy_source_path']);
        var_dump(3333);
    }

    $session = new Zippy_Session_Handler;
    if (!$session) {
      return $passed;
    }
    $current_cart_type = $session->get('current_cart');
    $current_url = $_SERVER['REQUEST_URI'];
    // Get product categories (terms)
    $is_retail = str_contains($current_url, 'retail-store');
    $is_popup = str_contains($current_url, 'popup-reservation');
    $flag = true;

    if ($is_retail && $current_cart_type !== 'retail-store') {
      $flag = false;
    }

    if ($is_popup && $current_cart_type !== 'popup-reservation') {
      $flag = false;
    }

    if (!$flag) {
      wc_add_notice(__('This product does not match your current cart type. Please clear your cart to add this product!', 'your-textdomain'), 'error');
      return false;
    }
    return $passed;
  }

  function after_apply_coupon_action($coupon_code)
  {
    echo '<script>jQuery( "body" ).trigger( "update_checkout" ); </script>';
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
  public function add_custom_price_field_to_product()
  {
    woocommerce_wp_text_input(array(
      'id' => '_extra_price',
      'label' => __('Extra price ($)', 'woocommerce'),
      'description' => __('Enter an price by hour for this product.', 'woocommerce'),
      'desc_tip' => 'true',
      'type' => 'number',
      'custom_attributes' => array(
        'step' => '0.1',
        'min' => '0'
      )
    ));
  }
}
