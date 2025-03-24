<?php

/**
 * Bookings Admin Settings
 *
 *
 */

namespace Zippy_Booking\Src\Admin;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;
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
    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'generate_zippy_booking_api_token'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_log_table'));
  
    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_outlet_table'));
    
    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_outlet_shipping_config_table'));
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
    add_menu_page('Zippy Add-ons', 'Zippy Add-ons', 'manage_options', 'zippy-bookings', array($this, 'render'), 'dashicons-list-view', 6);
    // SubPage
    add_submenu_page('zippy-bookings', 'Bookings', 'Bookings', 'manage_options', 'bookings', array($this, 'bookings_render'));
    add_submenu_page('zippy-bookings', 'Calendar', 'Calendar', 'manage_options', 'calendar', array($this, 'calendar_render'));
    add_submenu_page('zippy-bookings', 'Settings', 'Settings', 'manage_options', 'settings', array($this, 'settings_render'));
    add_submenu_page('zippy-bookings', 'Store', 'Store', 'manage_options', 'store', array($this, 'store_render'));
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


  function generate_zippy_booking_api_token()
  {
    if (get_option(ZIPPY_BOOKING_API_TOKEN_NAME) == false) {
      add_option(ZIPPY_BOOKING_API_TOKEN_NAME, ZIPPY_BOOKING_API_TOKEN);
    }
  }
  function remove_zippy_booking_api_token()
  {
    if (get_option(ZIPPY_BOOKING_API_TOKEN_NAME) == true) {
      delete_option(ZIPPY_BOOKING_API_TOKEN_NAME);
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }


  function create_outlet_shipping_config_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_addons_shipping_config';
    $outlet_table = $wpdb->prefix . 'zippy_addons_outlet';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id VARCHAR(255) NOT NULL,
        outlet_id VARCHAR(255) NOT NULL,
        min_distance VARCHAR(255) NOT NULL,
        max_distance VARCHAR(255) NULL,
        shipping_fee LONGTEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);

    $fk_sql = "ALTER TABLE $table_name 
               ADD CONSTRAINT fk_outlet_id 
               FOREIGN KEY (outlet_id) 
               REFERENCES $outlet_table(id);";
    $wpdb->query($fk_sql);

  }
}
