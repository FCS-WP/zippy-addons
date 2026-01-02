<?php

/**
 * Bookings Admin Settings
 *
 *
 */

namespace Zippy_Booking\Src\Admin;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;
use Zippy_Booking\Src\Services\One_Map_Api;

class Zippy_Admin_Settings
{
  protected static $_instance = null;

  /**
   * @return Zippy_Admin_Settings
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

    /* Register Menu Admin Part */
    add_action('admin_menu',  array($this, 'zippy_booking_page'));

    add_action('admin_enqueue_scripts', array($this, 'remove_default_stylesheets'));
    /* Register Assets Admin Part */
    add_action('admin_enqueue_scripts', array($this, 'admin_booking_assets'));
    /* Create Zippy API Token */
    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_one_map_credentials'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'get_one_map_access_token'));

    register_deactivation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'remove_one_map_credentials'));

    add_shortcode('admin_order_table', array($this, 'generate_admin_order_table_div'));
  }

  public function admin_booking_assets()
  {
    $version = time();
    $current_user_id = get_current_user_id();
    $day_limited = get_option('zippy_day_limited', '');
    //lib
    // Pass the user ID to the script
    wp_enqueue_script('admin-booking-js', ZIPPY_ADDONS_URL . '/assets/dist/js/admin.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_ADDONS_URL . '/assets/dist/css/admin.min.css', [], $version);

    wp_localize_script('admin-booking-js', 'admin_data', array(
      'userID' => $current_user_id,
      'day_limited' => $day_limited
    ));

    wp_localize_script('admin-booking-js', 'zippyConfig', [
      'apiUrl' => rest_url('/zippy-addons/v1'),
      'nonce'  => wp_create_nonce('wp_rest'),
      'siteUrl' => get_site_url(),
    ]);
  }

  public function zippy_booking_page()
  {
    add_menu_page('Zippy Add-ons', 'Zippy Add-ons', 'manage_options', 'zippy-bookings', array($this, 'store_render'), 'dashicons-list-view', 6);
    // SubPage
    add_submenu_page('zippy-bookings', 'Shipping', 'Shipping', 'manage_options', 'shipping', array($this, 'shipping_render'));
    add_submenu_page('zippy-bookings', 'Menus', 'Menus', 'manage_options', 'menus', array($this, 'menus_render'));
    add_submenu_page('zippy-bookings', 'Settings', 'Settings', 'manage_options', 'settings', array($this, 'settings_render'));
    add_submenu_page('zippy-bookings', 'Price Books', 'Price Books', 'manage_options', 'price_books', array($this, 'price_books_render'));
  }

  public function render()
  {
    echo Zippy_Utils_Core::get_template('booking-dashboard.php', [], dirname(__FILE__), '/templates');
  }

  public function bookings_render()
  {
    echo Zippy_Utils_Core::get_template('bookings.php', [], dirname(__FILE__), '/templates');
  }
  public function settings_render()
  {
    echo Zippy_Utils_Core::get_template('settings.php', [], dirname(__FILE__), '/templates');
  }
  public function price_books_render()
  {
    echo Zippy_Utils_Core::get_template('price_books.php', [], dirname(__FILE__), '/templates');
  }
  public function menus_render()
  {
    echo Zippy_Utils_Core::get_template('menus.php', [], dirname(__FILE__), '/templates');
  }
  public function store_render()
  {
    echo Zippy_Utils_Core::get_template('booking-store.php', [], dirname(__FILE__), '/templates');
  }
  public function shipping_render()
  {
    echo Zippy_Utils_Core::get_template('shipping.php', [], dirname(__FILE__), '/templates');
  }
  public function calendar_render()
  {
    echo Zippy_Utils_Core::get_template('booking-calendar.php', [], dirname(__FILE__), '/templates');
  }
  public function remove_default_stylesheets($handle)
  {
    $apply_urls = [
      'toplevel_page_zippy-bookings',
      'zippy-bookings_page_bookings',
      'zippy-bookings_page_calendar',
      'zippy-add-ons_page_store',
      'zippy-bookings_page_customize',
      'zippy-add-ons_page_price_books'
    ];

    if (in_array($handle, $apply_urls)) {
      // Deregister the 'forms' stylesheet
      wp_deregister_style('forms');

      add_action('admin_head', function () {
        $admin_url = get_admin_url();
        $styles_to_load = [
          'dashicons',
          'admin-bar',
          'common',
          'admin-menu',
          'dashboard',
          'list-tables',
          'edit',
          'revisions',
          'media',
          'themes',
          'about',
          'nav-menus',
          'wp-pointer',
          'widgets',
          'site-icon',
          'l10n',
          'buttons',
          'wp-auth-check'
        ];

        $wp_version = get_bloginfo('version');

        // Generate the styles URL
        $styles_url = $admin_url . '/load-styles.php?c=0&dir=ltr&load=' . implode(',', $styles_to_load) . '&ver=' . $wp_version;

        // Enqueue the stylesheet
        echo '<link rel="stylesheet" href="' . esc_url($styles_url) . '" media="all">';
      });
    }
  }

  function create_one_map_credentials()
  {
    if (get_option(ONEMAP_META_KEY) == false) {

      $credentials = [
        "email" => "dev@zippy.sg",
        "password" => Zippy_Utils_Core::encrypt_data_input("dev@zippysgnhale@2025"),
      ];

      add_option(ONEMAP_META_KEY, Zippy_Utils_Core::encrypt_data_input(json_encode($credentials), true));
    }
  }

  function remove_one_map_credentials()
  {
    if (!empty(get_option(ONEMAP_META_KEY))) {

      delete_option(ONEMAP_META_KEY);
      delete_option(ONEMAP_ACCESS_TOKEN_KEY);
    }
  }
  function get_one_map_access_token()
  {

    $one_map_credentials = get_option(ONEMAP_META_KEY);
    $credentials_json = Zippy_Utils_Core::decrypt_data_input($one_map_credentials);
    if ($credentials_json == false) {
      return [
        "error" => "No credentials found",
      ];
    }

    $credentials = json_decode($credentials_json, true);
    $credentials["password"] = Zippy_Utils_Core::decrypt_data_input($credentials["password"]);

    $authen = One_Map_Api::authenticate($credentials);
    if (!empty($authen["access_token"])) {
      update_option(ONEMAP_ACCESS_TOKEN_KEY, Zippy_Utils_Core::encrypt_data_input($authen["access_token"]));
    }
  }

  function generate_admin_order_table_div($atts)
  {
    $atts = shortcode_atts([
      'order_id' => 0,
      'enable_edit' => false,
    ], $atts, 'admin_order_table');

    $order_id = intval($atts['order_id']);
    $enable_edit = filter_var($atts['enable_edit'], FILTER_VALIDATE_BOOLEAN);

    if (!$order_id) {
      return '';
    }

    return '<div id="admin-table-order" data-order-id="' . esc_attr($order_id) . '" data-enable-edit="' . esc_attr($enable_edit) . '"></div>';
  }
}
