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

    add_filter('woocommerce_order_query_args', array($this, 'add_meta_billing_date_query'));

    add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'billing_date_order_items_column'), 25, 2);
  }

  public function show_filter_by_billing_date()
  {
    $billing_date = isset($_GET[BILLING_DATE]) ? esc_attr($_GET[BILLING_DATE]) : '';

    $date = $this->format_date_billing($billing_date);
    echo '<div style="display:inline-flex" id="zippy_order_filter" data-name=' . BILLING_DATE . ' data-value=' . $date . '></div>';
    // echo 'Fulfilment Date: <input type="date" name="' . BILLING_DATE . '" value="' . esc_attr($billing_date) . '"/>';
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
    if (isset($_GET['orderby']) && $_GET['orderby'] === BILLING_DATE) {
      $args['meta_key']  = BILLING_DATE;
      $args['orderby']   = 'meta_value';

      $args['meta_type'] = 'DATE';
      $args['order']     = isset($_GET['order']) ? sanitize_text_field($_GET['order']) : 'DESC';
    }
    if (isset($_GET['_billing_date'])) {
      $date = $this->format_date_billing($_GET['_billing_date']);
      $args['meta_value']   = sanitize_text_field($date);
    }
    return $args;
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
}
