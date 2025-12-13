<?php

/**
 * Bookings FontEnd Form
 *
 *
 */

namespace Zippy_Booking\Src\Web;

defined('ABSPATH') or die();

use Zippy_Booking\Src\Services\Zippy_Booking_Helper;
use Zippy_Booking\Utils\Zippy_Utils_Core;
use DateTime;

class Zippy_Booking_Web
{
  protected static $_instance = null;

  /**
   * @return Zippy_Booking_Web
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

    /* Init Function */
    add_action('wp_head', array($this, 'zippy_lightbox_flatsome'));
    add_action('woocommerce_before_checkout_form', array($this, 'zippy_add_shortcode_to_checkout'));

    add_action('pre_get_posts', array($this, 'hook_to_pre_get_posts'));
    add_filter('post_class', array($this, 'custom_class_products'), 10, 3);

    /**
     * Shortcode
     */

    add_shortcode('form_take_away', array($this, 'form_take_away'));
    add_shortcode('form_delivery', array($this, 'form_delivery'));
    add_shortcode('zippy_form', array($this, 'zippy_form'));
    add_shortcode('pickup_date_calander', array($this, 'pickup_date_calander_callback'));
    add_shortcode('login_form', array($this, 'login_form'));

    /* Booking Assets  */
    add_action('wp_enqueue_scripts', array($this, 'booking_assets'));
  }

  public function function_init()
  {
    return;
  }

  public function zippy_lightbox_flatsome()
  {
    if (!is_admin()) {
      echo do_shortcode('[lightbox id="takeaway" width="550px"][form_take_away][/lightbox]');
      echo do_shortcode('[lightbox id="delivery" title="222" width="550px"][form_delivery][/lightbox]');
    }
  }

  public function booking_assets()
  {
    // if (!is_archive() && !is_single() && !is_checkout()) return;
    $version = time();
    $day_limited = get_option('zippy_day_limited', '');

    $current_user_id = get_current_user_id();
    $user_info = get_userdata($current_user_id);
    // Form Assets
    wp_enqueue_script('booking-js', ZIPPY_ADDONS_URL . '/assets/dist/js/web.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_ADDONS_URL . '/assets/dist/css/web.min.css', [], $version);
    wp_localize_script('booking-js', 'admin_data', array(
      'userID' => $current_user_id,
      'user_email' => $user_info ? $user_info->user_email : null,
      'day_limited' => $day_limited,
      'url' => esc_url_raw(rest_url(ZIPPY_BOOKING_API_NAMESPACE)),
      'nonce'  => wp_create_nonce('wp_rest'),
    ));
  }

  public function zippy_form($atts)
  {
    return '<div id="zippy-form"></div>';
  }

  public function hook_to_pre_get_posts($query)
  {
    if (is_admin() || ! $query->is_main_query()) {
      return;
    }
    global $products_with_special_class;
    $products_with_special_class = [];

    $disabled_ids = Zippy_Booking_Helper::handle_check_disabled_products();
    // Check condition
    if (!empty($disabled_ids)) {
      $products_with_special_class = $disabled_ids;
    }
  }

  public function custom_class_products($classes, $class, $post_id)
  {

    if ('product' === get_post_type($post_id)) {
      global $products_with_special_class;
      $is_in_range_period = Zippy_Booking_Helper::is_in_range_period_window($post_id);
      $condition1 = !empty($products_with_special_class) && in_array($post_id, $products_with_special_class);
      if ($condition1 || $is_in_range_period) {
        $classes[] = 'custom-disabled-product';
      }
    }
    return $classes;
  }

  public function login_form()
  {
    return '<div id="custom-login-form" data-forgot_url="' . esc_url(wp_login_url()) . '?action=lostpassword' . '"></div>';
  }

  function zippy_add_shortcode_to_checkout()
  {
    $current_user_id = get_current_user_id();
    if ($current_user_id) {
      return;
    }
    echo do_shortcode('[login_form]');
    return;
  }
}
