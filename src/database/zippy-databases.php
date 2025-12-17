<?php

/**
 * Bookings Admin Settings
 *
 *
 */

namespace Zippy_Booking\Src\Database;

defined('ABSPATH') or die();

use Zippy_Booking\Src\Database\Zipyy_Pricebooks_DB;


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

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_delivery_times_table'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_delivery_time_slots_table'));

    register_activation_hook(ZIPPY_ADDONS_BASENAME, array($this, 'create_holiday_config_table'));

    new Zipyy_Pricebooks_Db;
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
        day_limited INT NULL,
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
          happy_hours TEXT NULL,
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

  public function create_delivery_times_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_addons_delivery_times';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
      id VARCHAR(255) NOT NULL PRIMARY KEY,
      outlet_id VARCHAR(255) NOT NULL,
      delivery_type VARCHAR(255) NOT NULL,
      week_day INT NOT NULL,
      is_active ENUM('T', 'F') DEFAULT 'T',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (outlet_id) REFERENCES {$wpdb->prefix}zippy_addons_outlet(id) ON DELETE CASCADE
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }

  public function create_delivery_time_slots_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_addons_delivery_time_slots';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
      id VARCHAR(255) NOT NULL PRIMARY KEY,
      delivery_time_id VARCHAR(255) NOT NULL,
      time_from VARCHAR(255) NOT NULL,
      time_to VARCHAR(255) NOT NULL,
      delivery_slot INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (delivery_time_id) REFERENCES {$wpdb->prefix}zippy_addons_delivery_times(id) ON DELETE CASCADE
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }

  public function create_holiday_config_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_addons_holiday_configs';
    $outlet_table = $wpdb->prefix . 'zippy_addons_outlet';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id VARCHAR(255) NOT NULL,
        outlet_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NULL,
        date DATE NOT NULL,
        is_active_take_away ENUM('T','F') DEFAULT 'F',
        is_active_delivery ENUM('T','F') DEFAULT 'F',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (outlet_id) REFERENCES $outlet_table(id) ON DELETE CASCADE
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }
}
