<?php

namespace Zippy_Booking\Src\Database;


defined('ABSPATH') or die();

class Zipyy_Addons_Shipping_Role_Config_DB
{
  protected static $_instance = null;
  protected $version = '1.0';

  public function __construct()
  {
    add_action('admin_init', [$this, 'maybe_migrate']);
  }

  /**
   * Checks if a database migration.
   */
  public function maybe_migrate()
  {
    $installed_ver = get_option('shipping_role_config_db_version');
    if ($installed_ver !== $this->version) {
      $this->create_shipping_role_config_tables();
      update_option('shipping_role_config_db_version', $this->version);
    }
  }

  public function create_shipping_role_config_tables()
  {
    global $wpdb;
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    $charset_collate = $wpdb->get_charset_collate();

    // PriceBooks Table
    $containers_table_name = $wpdb->prefix . SHIPPING_ROLE_CONFIG_TABLE;
    $sql_containers = "CREATE TABLE $containers_table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            outlet_id VARCHAR(60) DEFAULT NULL,
            role_user VARCHAR(60) NOT NULL,
            service_type VARCHAR(60) NOT NULL,
            visible TINYINT(1) NOT NULL DEFAULT 1,
            min_order DECIMAL(10,2) NOT NULL DEFAULT 0,
            start_date DATETIME DEFAULT NULL,
            end_date DATETIME DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at DATETIME DEFAULT NULL,
            PRIMARY KEY (id),
            KEY role_user (role_user),
            KEY active_period (start_date, end_date),
            KEY idx_deleted (deleted_at)
        ) $charset_collate;";

    dbDelta($sql_containers);

    update_option('shipping_role_config_db_version', $this->version);
  }
}
