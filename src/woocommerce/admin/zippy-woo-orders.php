<?php

/**
 * Woocommece Booking Settings
 *
 *
 */

namespace Zippy_Booking\Src\Woocommerce\Admin;

defined('ABSPATH') or die();

class Zippy_Woo_Orders
{

  protected static $_instance = null;

  /**
   * @return Zippy_Woo_Orders
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
    $this->set_hooks();
  }

  protected function set_hooks()
  {
    add_action('woocommerce_order_list_table_restrict_manage_orders', array($this, 'show_filter_by_billing_date'), 1);

    add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'add_billing_date_col'));
    add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'add_billing_time_col'));
    add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'add_payment_method_col'));
    add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'add_phone_col'));
    add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'add_created_by_admin_col'));

    add_filter('woocommerce_order_query_args', array($this, 'add_meta_billing_date_query'));

    add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'phone_items_column'), 25, 2);
    add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'billing_date_order_items_column'), 25, 2);
    add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'billing_time_order_items_column'), 25, 2);
    add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'payment_method_order_items_column'), 25, 2);
    add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'created_by_admin_order_items_column'), 25, 2);

    //add customer parameter for API Report
    add_filter('woocommerce_order_data_store_cpt_get_orders_query', array($this, 'handle_fulfilment_query_var'), 10, 2);
    add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'rename_order_status_column'));
  }

  public function show_filter_by_billing_date()
  {
    $billing_date = isset($_GET[BILLING_DATE]) ? esc_attr($_GET[BILLING_DATE]) : '';

    $date = $this->format_date_billing($billing_date);

    echo '<div style="display:inline-flex" id="zippy_order_filter" data-name=' . BILLING_DATE . ' data-value=' . $date . '></div>';
  }

  public function add_created_by_admin_col($columns)
  {
    $new_columns = [];

    foreach ($columns as $key => $column) {
      $new_columns[$key] = $column;

      if ($key === 'order_status') {
        $new_columns['created_by_admin'] = __('Created By', 'woocommerce');
      }
    }

    return $new_columns;
  }

  public function created_by_admin_order_items_column($column, $order)
  {
    if ($column === 'created_by_admin') {
      $created_by_admin = $order->get_meta('_created_by_admin');
      if ($created_by_admin) {
        $user = get_user_by('id', $created_by_admin);
        if ($user) {
          echo esc_html($user->user_email);
        } else {
          echo '<em>' . __('User not found', 'your-text-domain') . '</em>';
        }
      } else {
        echo '<em>' . __('customer') . '</em>';
      }
    }
  }

  public function add_phone_col($columns)
  {


    $before  = array_slice($columns, 0, array_search('order_date', array_keys($columns)) + 1, true);
    $after   = array_slice($columns, array_search('order_date', array_keys($columns)) + 1, null, true);



    $new['phone'] = sprintf(
      '<span class="billing_date">%s</span>',
      __('Phone', 'woocommerce'),
    );

    $columns = $before + $new + $after;

    return $columns;
  }
  public function add_billing_time_col($columns)
  {
    // Current sort
    $current_orderby = isset($_GET['orderby']) ? sanitize_text_field($_GET['orderby']) : '';
    $current_order   = isset($_GET['order']) ? strtolower($_GET['order']) : 'desc';

    // Default sort direction when clicking
    $order = 'asc';
    $class = '';

    if ($current_orderby === BILLING_TIME) {
      if ($current_order === 'asc') {
        $order = 'desc';
        $class = 'sorted asc';
      } else {
        $order = 'asc';
        $class = 'sorted desc';
      }
    } else {
      $class = 'sortable desc';
    }

    $url = add_query_arg([
      'orderby' => BILLING_TIME,
      'order'   => $order,
    ]);

    // Sorting indicators
    $sort_label = '<span class="sorting-indicators ' . $current_order . '">
        <span class="sorting-indicator asc" aria-hidden="true"></span>
        <span class="sorting-indicator desc" aria-hidden="true"></span>
    </span>';

    $before  = array_slice($columns, 0, array_search('order_date', array_keys($columns)) + 1, true);
    $after   = array_slice($columns, array_search('order_date', array_keys($columns)) + 1, null, true);



    $new[BILLING_TIME] = sprintf(
      '<a href="%s" class="%s"><span class="billing_date">%s</span>%s</a>',
      esc_url($url),
      esc_attr($class),
      __('Fulfilment Time', 'woocommerce'),
      $sort_label
    );

    $columns = $before + $new + $after;

    return $columns;
  }

  public function rename_order_status_column($columns)
  {
    if (isset($columns['order_status'])) {
      $columns['order_status'] = __('Order Status', 'woocommerce');
    }
    return $columns;
  }

  public function add_payment_method_col($columns)
  {
    // Chèn cột vào sau "order_status"
    $new_columns = [];

    foreach ($columns as $key => $column) {
      $new_columns[$key] = $column;

      if ($key === 'order_status') {
        $new_columns['payment_method'] = __('Payment Method', 'woocommerce');
      }
    }

    return $new_columns;
  }

  public function payment_method_order_items_column($column_name, $order_or_order_id)
  {
    if ($column_name === 'payment_method') {
      $order = $order_or_order_id instanceof \WC_Order ? $order_or_order_id : wc_get_order($order_or_order_id);

      if ($order) {
        echo esc_html($order->get_payment_method_title());
      }
    }
  }

  public function billing_time_order_items_column($column_name, $order_or_order_id)
  {

    $order = $order_or_order_id instanceof WC_Order ? $order_or_order_id : wc_get_order($order_or_order_id);

    if (BILLING_TIME === $column_name) {
      $fulfilment_time = $order->get_meta(BILLING_TIME) ?? '';
      echo  '<span title="converted">'  . $fulfilment_time . '</span>';
    }
  }

  public function add_billing_date_col($columns)
  {
    // Current sort
    $current_orderby = isset($_GET['orderby']) ? sanitize_text_field($_GET['orderby']) : '';
    $current_order   = isset($_GET['order']) ? strtolower($_GET['order']) : 'desc';

    // Default sort direction when clicking
    $order = 'asc';
    $class = '';

    if ($current_orderby === BILLING_DATE) {
      if ($current_order === 'asc') {
        $order = 'desc';
        $class = 'sorted asc';
      } else {
        $order = 'asc';
        $class = 'sorted desc';
      }
    } else {
      $class = 'sortable desc';
    }

    $url = add_query_arg([
      'orderby' => BILLING_DATE,
      'order'   => $order,
    ]);

    // Sorting indicators
    $sort_label = '<span class="sorting-indicators ' . $current_order . '">
        <span class="sorting-indicator asc" aria-hidden="true"></span>
        <span class="sorting-indicator desc" aria-hidden="true"></span>
    </span>';

    $before  = array_slice($columns, 0, array_search('order_date', array_keys($columns)) + 1, true);
    $after   = array_slice($columns, array_search('order_date', array_keys($columns)) + 1, null, true);



    $new[BILLING_DATE] = sprintf(
      '<a href="%s" class="%s"><span class="billing_date">%s</span>%s</a>',
      esc_url($url),
      esc_attr($class),
      __('Fulfilment Date', 'woocommerce'),
      $sort_label
    );

    $columns = $before + $new + $after;

    return $columns;
  }


  public function add_meta_billing_date_query($args)
  {
    // Handle orderby BILLING_DATE
    if (isset($_GET['orderby']) && $_GET['orderby'] === BILLING_DATE) {
      $args['meta_key']  = BILLING_DATE;
      $args['orderby']   = 'meta_value';
      $args['meta_type'] = 'DATE';
      $args['order']     = isset($_GET['order']) ? sanitize_text_field($_GET['order']) : 'DESC';
    }

    // Handle orderby BILLING_TIME
    if (isset($_GET['orderby']) && $_GET['orderby'] === BILLING_TIME) {
      $args['meta_key']  = BILLING_TIME;
      $args['orderby']   = 'meta_value';
      $args['order']     = isset($_GET['order']) ? sanitize_text_field($_GET['order']) : 'DESC';
    }

    // Handle filter by BILLING_DATE
    if (!empty($_GET[BILLING_DATE])) {
      $date = $this->format_date_billing($_GET[BILLING_DATE]);
      $args['meta_query'][] = [
        'key'     => BILLING_DATE,
        'value'   => sanitize_text_field($date),
        'compare' => '='
      ];
    }

    if (!empty($_GET[BILLING_DATE])) {
      $args['status'] = ['pending', 'processing', 'on-hold', 'completed'];
    }

    return $args;
  }


  public function phone_items_column($column_name, $order_or_order_id)
  {

    $order = $order_or_order_id instanceof WC_Order ? $order_or_order_id : wc_get_order($order_or_order_id);

    if ('phone' === $column_name) {
      $phone = $order->get_billing_phone() ?? '';
      echo  '<span>'  . $phone . '</span>';
    }
  }
  public function billing_date_order_items_column($column_name, $order_or_order_id)
  {

    $order = $order_or_order_id instanceof WC_Order ? $order_or_order_id : wc_get_order($order_or_order_id);

    if (BILLING_DATE === $column_name) {
      $fulfilment_date = $order->get_meta(BILLING_DATE) ?? '';
      $converted =  date("M j, Y", strtotime($fulfilment_date));
      echo  '<time datetime="' . $fulfilment_date . '" title="converted">'  . $converted . '</time>';
    }
  }

  private function format_date_billing($billing_date)
  {

    if (empty($billing_date)) return;
    $date_str = urldecode($billing_date);

    // Convert to Y-m-d
    $date = date('Y-m-d', strtotime($date_str));

    return $date;
  }

  private function handle_fulfilment_query_var($query, $query_vars)
  {
    if (! empty($query_vars[BILLING_DATE])) {
      $query['meta_query'][] = array(
        'key' => BILLING_DATE,
        'value' => esc_attr($query_vars[BILLING_DATE]),
        'compare' => '='
      );
    }
    if (! empty($query_vars[BILLING_TIME])) {
      $query['meta_query'][] = array(
        'key' => BILLING_TIME,
        'value' => esc_attr($query_vars[BILLING_TIME]),
        'compare' => '='
      );
    }

    return $query;
  }
}
