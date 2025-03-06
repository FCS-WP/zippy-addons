<?php

/**
 * Bookings FontEnd Form
 *
 *
 */

namespace Zippy_Booking\Src\Web;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;

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
    date_default_timezone_set('Asia/Singapore');

    /* Shortcode add btn booking */
    add_shortcode('btn_booking_form', array($this, 'btn_booking_on_single_product_page'));

    /* Shortcode booking login page */
    add_shortcode('booking_login_page', array($this, 'booking_login_page'));

    /* Booking Assets  */
    add_action('wp_enqueue_scripts', array($this, 'booking_assets'));
    add_shortcode('zippy_booking_form',  array($this, 'zippy_booking_form_shortcode'));
    add_shortcode('zippy_booking_history',  array($this, 'zippy_booking_history_shortcode'));
    add_action('pre_get_posts', array($this, 'exclude_products_by_category'));
  }

  public function btn_booking_on_single_product_page()
  {
    global $product;

    $product_id = $product->get_id();

    echo "<div id='btn_booking' data-id-product='" . esc_attr($product_id) . "'></div>";
  }


  public function booking_assets()
  {
    // if (!is_archive() && !is_single() && !is_checkout()) return;
    $version = time();

    $current_user_id = get_current_user_id();
    $user_info = get_userdata($current_user_id);
    // Form Assets
    wp_enqueue_script('booking-js', ZIPPY_BOOKING_URL . '/assets/dist/js/web.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_BOOKING_URL . '/assets/dist/css/web.min.css', [], $version);
    wp_localize_script('booking-js', 'admin_data', array(
      'userID' => $current_user_id,
      'user_email' => $user_info->user_email
    ));
  }
  function zippy_booking_form_shortcode()
  {
    // Output content for the shortcode
    return '<div id="zippy-booking-root"></div>';
  }

  function zippy_booking_history_shortcode()
  {
    // Output content for the shortcode
    return '<div id="zippy-booking-history"></div>';
  }

  function exclude_products_by_category($query)
  {
    if (! is_admin() && $query->is_main_query() && is_post_type_archive('product')) {
      $excluded_category_slugs = array('field', 'support-booking', 'test-support-booking');

      $excluded_category_ids = array();
      foreach ($excluded_category_slugs as $slug) {
        $term = get_term_by('slug', $slug, 'product_cat');
        if ($term) {
          $excluded_category_ids[] = $term->term_id;
        }
      }

      if (! empty($excluded_category_ids)) {
        $query->set('tax_query', array_merge($query->get('tax_query', array()), array(
          array(
            'taxonomy' => 'product_cat',
            'field'    => 'term_id',
            'terms'    => $excluded_category_ids,
            'operator' => 'NOT IN',
          ),
        )));
      }
    }
  }

}