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
use Zippy_Booking\Utils\Zippy_Session_Handler;

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
    /* Set timezone SG */
    // date_default_timezone_set('Asia/Singapore');

    /* Init Function */
    // add_action('wp_head', array($this, 'zippy_lightbox_flatsome'));
    add_action('woocommerce_before_checkout_form', array($this, 'zippy_add_shortcode_to_checkout'));

    // add_action('pre_get_posts', array($this, 'hook_to_pre_get_posts'));
    add_filter('post_class', array($this, 'custom_class_products'), 10, 3);
    add_filter('woocommerce_get_price_html', array($this, 'custom_archive_price_html'), 10, 2);
    add_action('woocommerce_cart_calculate_fees', array($this, 'add_custom_order_fee'));
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

    add_filter('woocommerce_add_cart_item_data', array($this, 'zippy_add_custom_price_on_add_to_cart'), 10, 2);
    add_filter('woocommerce_get_cart_item_from_session', array($this, 'zippy_restore_cart_item_data'), 20, 2);
    add_action('woocommerce_before_calculate_totals', array($this, 'zippy_apply_custom_price'), 100);
  }
  public function add_custom_order_fee($cart)
  {
    if (is_admin() && !defined('DOING_AJAX')) return;

    $reservation_fee = get_option('zippy_prices_reservation_fee', null);
    if (!$reservation_fee || $cart->is_empty()) return;

    $total_quantity = 0;
    foreach ($cart->get_cart() as $cart_item) {
      $total_quantity += $cart_item['quantity'];
    }

    $total_fee = floatval($reservation_fee) * $total_quantity;
    $cart->add_fee(__('Reservation Fee', 'your-text-domain'), $total_fee, false);
  }

  public function custome_display($item_data, $cart_item_data)
  {
    var_dump($cart_item_data);

    return $item_data;
  }
  public  function zippy_refresh_cart_fragments($fragments)
  {
    ob_start();
    woocommerce_mini_cart();
    $fragments['div.widget_shopping_cart_content'] = ob_get_clean();
    return $fragments;
  }

  public function zippy_add_custom_price_on_add_to_cart($cart_item_data, $product_id)
  {

    $session = new Zippy_Session_Handler;
    $current_cart = $session->get('current_cart');

    $retail_price = get_option('zippy_prices_retail', 0);
    $popup_price = get_option('zippy_prices_popup', 0);
    $is_retail = str_contains($current_cart, 'retail-store');

    $added_price = $is_retail ? floatval($retail_price) : floatval($popup_price);
    // Save it into cart item data
    $cart_item_data['zippy_added_price'] = $added_price;

    return $cart_item_data;
  }

  public function zippy_apply_custom_price($cart)
  {
    if (is_admin() && !defined('DOING_AJAX')) return;

    foreach ($cart->get_cart() as $cart_item) {
      if (isset($cart_item['zippy_added_price'])) {
        $base_price = $cart_item['data']->get_regular_price(); // Or get_price() if you prefer
        $custom_price = $base_price + floatval($cart_item['zippy_added_price']);
        $cart_item['data']->set_price($custom_price);
      }
    }
  }

  public function zippy_restore_cart_item_data($cart_item, $values)
  {
    if (isset($values['zippy_added_price'])) {
      $cart_item['zippy_added_price'] = $values['zippy_added_price'];
    }
    return $cart_item;
  }

  public function function_init()
  {
    return;
  }

  public function custom_archive_price_html($price_html, $product)
  {
    if (is_admin()) {
      return $price_html;
    }

    $session       = new Zippy_Session_Handler();
    $retail_price  = floatval(get_option('zippy_prices_retail', 0));
    $popup_price   = floatval(get_option('zippy_prices_popup', 0));
    $base_price    = floatval($product->get_price());

    if (!$session->get('current_cart')) {
      $tags = get_the_terms($product->get_id(), 'product_tag');
      $first_tag_slug = (!empty($tags) && !is_wp_error($tags)) ? $tags[0]->slug : '';

      // Retail-only products => show only retail price
      if ($first_tag_slug === 'retails-only') {
        $custom_price = $base_price + $retail_price;
        return sprintf(
          '<span class="custom-price" style="display:block">Retail Store: %s</span>',
          wc_price($custom_price)
        );
      }

      // Show both retail and popup options
      $retail_total = $base_price + $retail_price;
      $popup_total  = $base_price + $popup_price;

      return sprintf(
        '<span class="custom-price" style="display:block">Retail Store: %s</span>
             <span class="custom-price" style="display:block">Popup Reservation: %s</span>',
        wc_price($retail_total),
        wc_price($popup_total)
      );
    }

    $current_cart = $session->get('current_cart');
    if ($current_cart === 'retail-store' || $current_cart === 'popup-reservation') {
      $add_price   = ($current_cart === 'retail-store') ? $retail_price : $popup_price;
      $custom_price = $base_price + $add_price;

      return sprintf(
        '<span class="custom-price">%s</span>',
        wc_price($custom_price)
      );
    }

    $current_path   = $_SERVER['REQUEST_URI'] ?? '';
    $is_retail_path = strpos($current_path, 'retail-store') !== false;
    $is_popup_path  = strpos($current_path, 'popup-reservation') !== false;

    if ($is_retail_path || $is_popup_path) {
      $add_price   = $is_retail_path ? $retail_price : $popup_price;
      $custom_price = $base_price + $add_price;

      return sprintf(
        '<span class="custom-price">%s</span>',
        wc_price($custom_price)
      );
    }

    // Default return (unchanged price)
    return $price_html;
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

    $current_user_id = get_current_user_id();
    $user_info = get_userdata($current_user_id);
    // Form Assets
    wp_enqueue_script('booking-js', ZIPPY_ADDONS_URL . '/assets/dist/js/web.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_ADDONS_URL . '/assets/dist/css/web.min.css', [], $version);
    if ($user_info) {
      wp_localize_script('booking-js', 'admin_data', array(
        'userID' => $current_user_id,
        'user_email' => $user_info->user_email
      ));
    }
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

      if (! empty($products_with_special_class) && in_array($post_id, $products_with_special_class)) {
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
