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
    add_action('woocommerce_order_status_changed', array($this, 'update_booking_status_in_db_on_order_status_change'), 10, 3);



    /* Create New Table For Booking */
    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_booking_table'));

    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_product_booking_table'));

    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_booking_configs_table'));

    /* Create Zippy API Token */
    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'generate_zippy_booking_api_token'));

    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_zippy_booking_log_table'));

    /* Delete Table Booking */
    // register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_booking_table'));

    // /* Delete Table Booking Config */
    // register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_booking_config_table'));

    // register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_product_booking_mapping'));

    // register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_zippy_booking_log_table'));

    // /* Delete Zippy API Token */
    // register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'remove_zippy_booking_api_token'));
  }

  public function admin_booking_assets()
  {
    $version = time();
    $current_user_id = get_current_user_id();
    //lib
    // wp_enqueue_style('admin-jquery-ui-css', ZIPPY_BOOKING_URL . 'assets/libs/jquery-ui/jquery-ui.min.css', [], $version);
    // Pass the user ID to the script
    wp_enqueue_script('admin-booking-js', ZIPPY_BOOKING_URL . '/assets/dist/js/admin.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_BOOKING_URL . '/assets/dist/css/admin.min.css', [], $version);





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

  function create_booking_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'bookings';

    $charset_collate = $wpdb->get_charset_collate();

    // SQL query to create the table
    $sql = "CREATE TABLE $table_name (
      ID BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT(20) UNSIGNED DEFAULT NULL,
      email VARCHAR(255) NOT NULL,
      product_id BIGINT(20) UNSIGNED NOT NULL,
      order_id BIGINT(20) UNSIGNED NOT NULL,
      booking_start_date DATE NOT NULL,
      booking_start_time TIME NOT NULL,
      booking_end_date DATE NOT NULL,
      booking_end_time TIME NOT NULL,
      booking_status VARCHAR(50) NOT NULL,
      created_at DATETIME NOT NULL,
      PRIMARY KEY  (ID),
      KEY product_id (product_id),
      FOREIGN KEY (order_id) REFERENCES {$wpdb->prefix}wc_orders(ID) ON DELETE CASCADE
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    dbDelta($sql);
  }

  function create_product_booking_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'products_booking';

    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
      $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            items_id BIGINT(20) NOT NULL,
            mapping_type VARCHAR(255) NOT NULL,
            mapping_status VARCHAR(255) NOT NULL,
            PRIMARY KEY  (id)
        );";

      require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
      dbDelta($sql);
    }
  }
  function create_booking_configs_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'booking_configs';

    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
      $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            weekday INT NOT NULL,
            is_open VARCHAR(255) NOT NULL,
            open_at TIME NULL,
            close_at TIME NULL,
            extra_time LONGTEXT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            PRIMARY KEY  (id)
        );";

      require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
      dbDelta($sql);
    }
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


  function create_zippy_booking_log_table()
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

  function delete_zippy_booking_log_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'zippy_booking_log';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }
  public function update_booking_status_in_db_on_order_status_change($order_id, $old_status, $new_status)
  {
    global $wpdb;

    $order = wc_get_order($order_id);

    $booking_status = '';
    switch ($new_status) {
      case 'on-hold':
        $booking_status = 'pending';
        break;
      case 'pending':
        $booking_status = 'approved';
        break;
      case 'completed':
        $booking_status = 'completed';
        break;
      case 'cancelled':
        $booking_status = 'cancelled';
        break;
      default:
        return;
    }


    $booking_id = $order->get_meta('booking_id');
    if (!$booking_id) {
      error_log("Booking ID not found for order ID: " . $order_id);
      return;
    }

    $table_name = $wpdb->prefix . 'bookings';

    $wpdb->update(
      $table_name,
      array('booking_status' => $booking_status),
      array('order_id' => $order_id),
      array('%s'),
      array('%d')
    );

    if ($wpdb->last_error) {
      error_log("Error updating booking status for order ID " . $order_id . ": " . $wpdb->last_error);
    } else {
      error_log("Booking status updated to '$booking_status' for order ID " . $order_id);
    }
  }
}
