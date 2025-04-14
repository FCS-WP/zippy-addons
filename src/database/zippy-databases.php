<?php

/**
 * Bookings Admin Settings
 *
 *
 */

namespace Zippy_Booking\Src\Database;

defined('ABSPATH') or die();


class Zippy_Databases
{
  protected static $_instance = null;

  /**
   * @return Zippy_Databases
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
    /* Create Zippy API Token */
    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_log_table'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_outlet_table'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_menus_table'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_menu_products_table'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_shipping_table'));
  }


  public function create_log_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_log';

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

  public function create_outlet_table()
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

  public function create_menus_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_menus';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          start_date DATE NULL,
          end_date DATE NULL,
          days_of_week VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
      ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
  }

  public function create_menu_products_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_menu_products';
    $menus_table = $wpdb->prefix . 'zippy_menus';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
          id INT NOT NULL AUTO_INCREMENT,
          id_menu INT NOT NULL,
          id_product INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          CONSTRAINT fk_menu FOREIGN KEY (id_menu) REFERENCES $menus_table(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
  }


  public function create_shipping_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_addons_shipping_config';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id VARCHAR(255) NOT NULL,
        outlet_id VARCHAR(255) NOT NULL,
        minimum_order_to_delivery LONGTEXT NULL,
        minimum_order_to_freeship LONGTEXT NULL,
        extra_fee LONGTEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }
}
