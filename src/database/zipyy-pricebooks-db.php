<?php

namespace Zippy_Booking\Src\Database;


defined('ABSPATH') or die();

class Zipyy_Pricebooks_DB
{
  protected static $_instance = null;
  protected $version = '1.2';

  public function __construct()
  {
    register_activation_hook(ZIPPY_ADDONS_BASENAME, [$this, 'create_pricebook_tables']);

    add_action('admin_init', [$this, 'maybe_migrate']);
  }

  /**
   * Checks if a database migration.
   */
  public function maybe_migrate()
  {
    $installed_ver = get_option('pricebook_db_version');

    if ($installed_ver !== $this->version) {
      $this->migrate_to_soft_delete();
      $this->migrate_price_book_type();
      update_option('pricebook_db_version', $this->version);
    }
  }


  private function migrate_to_soft_delete()
  {
    global $wpdb;
    $containers_table = $wpdb->prefix . PRICEBOOK_TABLE;
    $relations_table  = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;

    // Columns to add
    $migrations = [
      $containers_table => [
        "ALTER TABLE $containers_table ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE $containers_table ADD COLUMN deleted_at DATETIME DEFAULT NULL"
      ],
      $relations_table => [
        "ALTER TABLE $relations_table ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE $relations_table ADD COLUMN deleted_at DATETIME DEFAULT NULL"
      ]
    ];

    foreach ($migrations as $table => $sqls) {
      // Check if column exists first 
      $column_exists = $wpdb->get_results("SHOW COLUMNS FROM $table LIKE 'deleted_at'");

      if (empty($column_exists)) {
        foreach ($sqls as $sql) {
          $wpdb->query($sql);
        }
      }
    }
  }

  private function migrate_price_book_type()
  {
    global $wpdb;
    $containers_table = $wpdb->prefix . PRICEBOOK_TABLE;
    $column_exists = $wpdb->get_results("SHOW COLUMNS FROM $containers_table LIKE 'is_exclusive'");
    if (empty($column_exists)) {
      $wpdb->query("ALTER TABLE $containers_table ADD COLUMN is_exclusive TINYINT(1) NOT NULL DEFAULT 0 AFTER status");
    }
  }

  public function create_pricebook_tables()
  {
    global $wpdb;
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    $charset_collate = $wpdb->get_charset_collate();

    // PriceBooks Table
    $containers_table_name = $wpdb->prefix . PRICEBOOK_TABLE;
    $sql_containers = "CREATE TABLE $containers_table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            role_id VARCHAR(60) NOT NULL,
            start_date DATETIME DEFAULT NULL,
            end_date DATETIME DEFAULT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            priority INT(3) UNSIGNED NOT NULL DEFAULT 10,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
            deleted_at DATETIME DEFAULT NULL,
            PRIMARY KEY (id),
            KEY role_id (role_id),
            KEY active_period (start_date, end_date),
            KEY idx_deleted (deleted_at)
        ) $charset_collate;";

    dbDelta($sql_containers);

    // PriceBooks Relations Table
    $relations_table_name = $wpdb->prefix . PRICEBOOK_PRODUCTS_TABLE;
    $sql_relations = "CREATE TABLE $relations_table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            pricebook_id BIGINT(20) UNSIGNED NOT NULL,
            product_id BIGINT(20) UNSIGNED NOT NULL,
            price_type VARCHAR(20) NOT NULL,
            price_value DECIMAL(10,2) NOT NULL,
            visibility VARCHAR(10) NOT NULL DEFAULT 'show',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            deleted_at DATETIME DEFAULT NULL,
            PRIMARY KEY (id),
            KEY pricebook_id (pricebook_id),
            KEY product_id (product_id),
            KEY idx_deleted (deleted_at),
            UNIQUE KEY book_product_unique (pricebook_id, product_id)
        ) $charset_collate;";

    dbDelta($sql_relations);

    update_option('pricebook_db_version', $this->version);
  }
}
