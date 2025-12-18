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

    add_filter('woocommerce_add_cart_item_data', array($this, 'zippy_add_custom_price_on_add_to_cart'), 10, 4);
    add_filter('woocommerce_get_cart_item_from_session', array($this, 'zippy_restore_cart_item_data'), 20, 2);
    add_action('woocommerce_before_calculate_totals', array($this, 'zippy_apply_custom_price'), 100);
  }
  public function add_custom_order_fee($cart)
  {
    if (is_admin() && !defined('DOING_AJAX')) return;

    $reservation_fee = get_option('zippy_prices_reservation_fee', null);
    if (!$reservation_fee || $cart->is_empty()) return;

    $total_fee = floatval($reservation_fee);
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

  public function zippy_add_custom_price_on_add_to_cart($cart_item_data, $product_id, $variation_id, $quantity)
  {


    $session = new Zippy_Session_Handler;
    $current_cart = $session->get('current_cart');
    $product_id =  empty($variation_id) ? $product_id : $variation_id;
    $retail_price = 0;
    $popup_price   = floatval(get_post_meta($product_id, '_popup_price', true)) ?? 0;

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

    $session = new Zippy_Session_Handler();
    $retail_add = (float) get_option('zippy_prices_retail', 0);

    /**
     * --------------------------------------------------
     * RESOLVE PRODUCT CONTEXT (Simple / Variable)
     * --------------------------------------------------
     */
    $base_price  = 0;
    $popup_price = 0;
    $has_retail  = false;
    $has_popup   = false;

    // 1️⃣ Simple or selected variation
    if ($product->is_type('simple') || $product->is_type('variation')) {

      $base_price  = (float) $product->get_price();
      $popup_price = (float) $product->get_meta('_popup_price', true);

      $has_retail = $base_price > 0;
      $has_popup  = $popup_price > 0;
    }

    // 2️⃣ Variable product (no variation selected)
    if ($product->is_type('variable')) {

      $children = $product->get_children();

      foreach ($children as $child_id) {
        $variation = wc_get_product($child_id);

        if (! $variation) continue;

        if ($variation->get_price() > 0) {
          $has_retail = true;
        }

        if ((float) $variation->get_meta('_popup_price', true) > 0) {
          $has_popup = true;
        }
      }
    }

    /**
     * --------------------------------------------------
     * PRICE TYPE
     * --------------------------------------------------
     */
    if ($has_popup && $has_retail) {
      $price_type = 'all';
    } elseif ($has_popup) {
      $price_type = 'popup-only';
    } elseif ($has_retail) {
      $price_type = 'retail-only';
    } else {
      return '';
    }

    /**
     * --------------------------------------------------
     * NO CART SELECTED → SHOW OPTIONS
     * --------------------------------------------------
     */
    if (! $session->get('current_cart')) {

      // Variable product → show ranges
      if ($product->is_type('variable')) {

        $html = [];

        if ($price_type !== 'popup-only') {
          $min = (float) $product->get_variation_price('min', false) + $retail_add;
          $max = (float) $product->get_variation_price('max', false) + $retail_add;

          $html[] = sprintf(
            '<span class="custom-price retail-price">Retail Store: %s</span></br>',
            wc_price($min) . ($min !== $max ? ' – ' . wc_price($max) : '')
          );
        }

        if ($price_type !== 'retail-only') {
          $popup_prices = [];

          foreach ($product->get_children() as $child_id) {
            $p = (float) get_post_meta($child_id, '_popup_price', true);
            if ($p > 0) $popup_prices[] = $p;
          }

          if ($popup_prices) {
            $html[] = sprintf(
              '<span class="custom-price popup-price">Popup Reservation: %s</span>',
              wc_price(min($popup_prices)) .
                (min($popup_prices) !== max($popup_prices)
                  ? ' – ' . wc_price(max($popup_prices))
                  : '')
            );
          }
        }

        return implode('', $html);
      }

      // Simple / variation
      $html = [];

      if ($price_type !== 'popup-only') {
        $html[] = sprintf(
          '<span class="custom-price retail-price">Retail Store: %s</span>',
          wc_price($base_price + $retail_add)
        );
      }

      if ($price_type !== 'retail-only') {
        $html[] = sprintf(
          '<span class="custom-price popup-price">Popup Reservation: %s</span>',
          wc_price($popup_price)
        );
      }

      return implode('', $html);
    }

    /**
     * --------------------------------------------------
     * CART SELECTED → SHOW ACTIVE PRICE
     * --------------------------------------------------
     */
    $current_cart = $session->get('current_cart');

    if ($current_cart === 'retail-store' && $has_retail) {

      if ($product->is_type('variable')) {
        $min = (float) $product->get_variation_price('min', false) + $retail_add;
        $max = (float) $product->get_variation_price('max', false) + $retail_add;

        return sprintf(
          '<span class="custom-price">%s</span>',
          wc_price($min) . ($min !== $max ? ' – ' . wc_price($max) : '')
        );
      }

      return sprintf(
        '<span class="custom-price">%s</span>',
        wc_price($base_price + $retail_add)
      );
    }

    if ($current_cart === 'popup-reservation' && $has_popup) {

      if ($product->is_type('variable')) {
        $prices = [];

        foreach ($product->get_children() as $child_id) {
          $p = (float) get_post_meta($child_id, '_popup_price', true);
          if ($p > 0) $prices[] = $p;
        }

        return sprintf(
          '<span class="custom-price">%s</span>',
          wc_price(min($prices)) .
            (min($prices) !== max($prices) ? ' – ' . wc_price(max($prices)) : '')
        );
      }

      return sprintf(
        '<span class="custom-price">%s</span>',
        wc_price($popup_price)
      );
    }

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
