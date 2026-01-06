<?php

/**
 * Woocommece Booking Settings
 *
 *
 */

namespace Zippy_Booking\Src\Woocommerce;

defined('ABSPATH') or die();

use Zippy_Booking\Src\Services\Price_Books\Price_Books_Woocommerce;

class Zippy_Price_Books
{

  protected $service;

  public function __construct()
  {
    $this->service = new Price_Books_Woocommerce();

    add_action('init', [$this, 'register_frontend_hooks']);
  }

  public function register_frontend_hooks()
  {

    // --- Pricing Hook ---
    // Filter price displayed to the user
    add_filter('woocommerce_product_get_price', [$this->service, 'apply_custom_pricing'], 10, 2);
    // add_filter('woocommerce_product_get_regular_price', [$this->service, 'apply_custom_pricing'], 10, 2);
    // add_filter('woocommerce_product_get_sale_price', [$this->service, 'apply_custom_pricing'], 10, 2);

    // --- Visibility Hook ---
    // Filter whether the product should be visible in the catalog/shop
    add_filter('woocommerce_product_is_visible', [$this->service, 'control_product_visibility'], 10, 2);

    add_filter('woocommerce_product_query_meta_query', [$this->service, 'filter_search_results'], 10, 2);

    add_filter('woocommerce_product_is_visible', [$this->service, 'handle_flatsome_exclusive_visibility'], 10, 2);
  }
}
