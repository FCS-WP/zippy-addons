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
use  WC_Order_Item_Product;

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

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_log_table'));
  
    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_outlet_table'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'get_one_map_access_token'));
  }

  public function admin_booking_assets()
  {
    $version = time();
    $current_user_id = get_current_user_id();
    //lib
    // wp_enqueue_style('admin-jquery-ui-css', ZIPPY_ADDONS_URL . 'assets/libs/jquery-ui/jquery-ui.min.css', [], $version);
    // Pass the user ID to the script
    wp_enqueue_script('admin-booking-js', ZIPPY_ADDONS_URL . '/assets/dist/js/admin.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_ADDONS_URL . '/assets/dist/css/admin.min.css', [], $version);



    wp_localize_script('booking-js-current-id', 'admin_id', array(
      'userID' => $current_user_id,
    ));
  }

  public function zippy_booking_page()
  {
    add_menu_page('Zippy Add-ons', 'Zippy Add-ons', 'manage_options', 'zippy-bookings', array($this, 'store_render'), 'dashicons-list-view', 6);
    // SubPage
    // add_submenu_page('zippy-bookings', 'Bookings', 'Bookings', 'manage_options', 'bookings', array($this, 'bookings_render'));
    // add_submenu_page('zippy-bookings', 'Calendar', 'Calendar', 'manage_options', 'calendar', array($this, 'calendar_render'));
    add_submenu_page('zippy-bookings', 'Settings', 'Settings', 'manage_options', 'settings', array($this, 'settings_render'));
    // add_submenu_page('zippy-bookings', 'Store', 'Store', 'manage_options', 'store', array($this, 'store_render'));
  }

  function delete_booking_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'bookings';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }

  function delete_booking_config_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'booking_configs';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }
  function delete_product_booking_mapping()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'products_booking';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
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

  public function store_render()
  {
    echo Zippy_Utils_Core::get_template('booking-store.php', [], dirname(__FILE__), '/templates');
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
      'zippy-bookings_page_products-booking',
      'zippy-bookings_page_customize'
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
        "password" => Zippy_Utils_Core::encrypt_data_input("Zippy12345678@"),
      ];

      add_option(ONEMAP_META_KEY, Zippy_Utils_Core::encrypt_data_input(json_encode($credentials), true));
    }
  }


  function create_log_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_booking_log';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        action VARCHAR(255) NOT NULL,
        details LONGTEXT NOT NULL,
        status VARCHAR(20) NOT NULL,
        message LONGTEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }



  function create_outlet_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_addons_outlet';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id VARCHAR(255) NOT NULL,
        outlet_name VARCHAR(255) NOT NULL,
        display VARCHAR(255) NOT NULL,
        outlet_phone VARCHAR(255) NULL,
        outlet_address LONGTEXT NULL,
        operating_hours LONGTEXT NULL,
        closed_dates LONGTEXT NULL,
        takeaway LONGTEXT NULL,
        shipping_config LONGTEXT NULL,
        minimum_total_to_shipping VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }


  function create_shipping_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_addons_shipping_config';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id VARCHAR(255) NOT NULL,
        outlet_id VARCHAR(255) NOT NULL,
        minimum_order_to_delivery VARCHAR(255) NOT NULL,
        minimum_order_to_freeship VARCHAR(255) NOT NULL,
        extra_fee VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }



  function get_one_map_access_token(){

    $one_map_credentials = get_option(ONEMAP_META_KEY);
    if(empty($one_map_credentials)){
        return [
            "status_message"=> "No credentials found",
        ];
    }
    $credentials_json = Zippy_Utils_Core::decrypt_data_input($one_map_credentials);
    $credentials = json_decode($credentials_json, true);

    $credentials["password"] = Zippy_Utils_Core::decrypt_data_input($credentials["password"]);

    $authen = One_Map_Api::authentication($credentials);
    if(!empty($authen["access_token"])){
      
      update_option(ONEMAP_ACCESS_TOKEN_KEY, Zippy_Utils_Core::encrypt_data_input($authen["access_token"]));
    }
  }
}
