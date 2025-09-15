<?php

/**
 * WooCommerce Combo Product Type
 */

namespace Zippy_Booking\Src\Woocommerce\Admin;

defined('ABSPATH') or die();

use WC_Product;

class Zippy_Product_Composite extends WC_Product
{

  protected $product_type = 'composite';
  public function __construct($product = 0)
  {
    $this->product_type = 'composite'; // set type
    parent::__construct($product);

    add_filter('product_type_selector', [$this, 'register_dropdown']);
    add_filter('woocommerce_product_class', [$this, 'map_product_class'], 10, 2);

    add_filter('woocommerce_product_data_tabs', [$this, 'add_general_tab']);
  }

  public function get_type()
  {
    return 'composite';
  }

  public static function register_dropdown($types)
  {
    $types['composite'] = __('Composite Product', 'zippy-addon');
    return $types;
  }

  public static function map_product_class($classname, $product_type)
  {
    if ($product_type === 'composite') {
      $classname = __CLASS__;
    }
    return $classname;
  }

  public static function add_general_tab($tabs)
  {
    if (isset($tabs['inventory']['class'])) {
      $tabs['inventory']['class'][] = 'show_if_composite';
    }

    return $tabs;
  }


  public static function woocommerce_composite_add_to_cart($tabs)
  {
    wc_get_template('single-product/add-to-cart/composite.php');
  }



  /**
   * Add Regular & Sale price fields
   */
  public static function add_pricing_fields()
  {
    global $post;
    $product_id = $post->ID;
    $product_object   = wc_get_product_object('composite', $product_id);
    echo '<div class="options_group pricing show_if_composite hidden">';
    woocommerce_wp_text_input(
      array(
        'id'        => '_composite_regular_price',
        'value'     => $product_object->get_regular_price('edit'),
        'label'     => __('Regular price', 'woocommerce') . ' (' . get_woocommerce_currency_symbol() . ')',
        'data_type' => 'price',
      )
    );

    woocommerce_wp_text_input(
      array(
        'id'          => '_composite_sale_price',
        'value'       => $product_object->get_sale_price('edit'),
        'data_type'   => 'price',
        'label'       => __('Sale price', 'woocommerce') . ' (' . get_woocommerce_currency_symbol() . ')',
        'description' => '<a href="#" class="sale_schedule">' . __('Schedule', 'woocommerce') . '</a>',
      )
    );

    $sale_price_dates_from_timestamp = $product_object->get_date_on_sale_from('edit') ? $product_object->get_date_on_sale_from('edit')->getOffsetTimestamp() : false;
    $sale_price_dates_to_timestamp   = $product_object->get_date_on_sale_to('edit') ? $product_object->get_date_on_sale_to('edit')->getOffsetTimestamp() : false;

    $sale_price_dates_from = $sale_price_dates_from_timestamp ? date_i18n('Y-m-d', $sale_price_dates_from_timestamp) : '';
    $sale_price_dates_to   = $sale_price_dates_to_timestamp ? date_i18n('Y-m-d', $sale_price_dates_to_timestamp) : '';

    echo '<p class="form-field sale_price_dates_fields">
				<label for="_sale_price_dates_from">' . esc_html__('Sale price dates', 'woocommerce') . '</label>
				<input type="text" class="short" name="_sale_price_dates_from" id="_sale_price_dates_from" value="' . esc_attr($sale_price_dates_from) . '" placeholder="' . esc_html(_x('From&hellip;', 'placeholder', 'woocommerce')) . ' YYYY-MM-DD" maxlength="10" pattern="' . esc_attr(apply_filters('woocommerce_date_input_html_pattern', '[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])')) . '" />
				<input type="text" class="short" name="_sale_price_dates_to" id="_sale_price_dates_to" value="' . esc_attr($sale_price_dates_to) . '" placeholder="' . esc_html(_x('To&hellip;', 'placeholder', 'woocommerce')) . '  YYYY-MM-DD" maxlength="10" pattern="' . esc_attr(apply_filters('woocommerce_date_input_html_pattern', '[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])')) . '" />
				<a href="#" class="description cancel_sale_schedule">' . esc_html__('Cancel', 'woocommerce') . '</a>' . wc_help_tip(__('The sale will start at 00:00:00 of "From" date and end at 23:59:59 of "To" date.', 'woocommerce')) . '
			</p>';

    do_action('woocommerce_product_options_pricing');


    echo  '</div>';

    if (wc_tax_enabled()) : ?>
      <div class="options_group show_if_composite">
        <?php
        woocommerce_wp_select(
          array(
            'id'          => '_composite_tax_status',
            'value'       => $product_object->get_tax_status('edit'),
            'label'       => __('Tax status', 'woocommerce'),
            'options'     => array(
              'taxable'  => __('Taxable', 'woocommerce'),
              'shipping' => __('Shipping only', 'woocommerce'),
              'none'     => _x('None', 'Tax status', 'woocommerce'),
            ),
            'desc_tip'    => 'true',
            'description' => __('Define whether or not the entire product is taxable, or just the cost of shipping it.', 'woocommerce'),
          )
        );

        woocommerce_wp_select(
          array(
            'id'          => '_composite_tax_class',
            'value'       => $product_object->get_tax_class('edit'),
            'label'       => __('Tax class', 'woocommerce'),
            'options'     => wc_get_product_tax_class_options(),
            'desc_tip'    => 'true',
            'description' => __('Choose a tax class for this product. Tax classes are used to apply different tax rates specific to certain types of product.', 'woocommerce'),
          )
        );

        do_action('woocommerce_product_options_tax');
        ?>
      </div>
    <?php endif; ?>
<?php
  }

  /**
   * Save pricing fields for combo product
   */

  public static function save_pricing_fields($product)
  {
    if ($product->get_type() === 'composite') {
      if (isset($_POST['_composite_regular_price'])) {
        $product->set_regular_price(wc_clean(wp_unslash($_POST['_composite_regular_price'])));
      }
      if (isset($_POST['_composite_sale_price'])) {
        $product->set_sale_price(wc_clean(wp_unslash($_POST['_composite_sale_price'])));
      }
    }
  }
}

add_action('woocommerce_composite_add_to_cart',  [Zippy_Product_Composite::class, 'woocommerce_composite_add_to_cart'], 30);
add_action('woocommerce_product_options_general_product_data', [Zippy_Product_Composite::class, 'add_pricing_fields']);
add_action('woocommerce_admin_process_product_object', [Zippy_Product_Composite::class, 'save_pricing_fields']);
