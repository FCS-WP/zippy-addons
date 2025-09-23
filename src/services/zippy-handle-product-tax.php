<?php

/**
 * Zippy_Handle_Product_Tax controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

use WC_Order_Item_Product;
use WC_Tax;


class Zippy_Handle_Product_Tax
{


  /**
   * Set order item totals when product price includes tax.
   *
   * @param WC_Order_Item_Product $item
   * @param float $price_incl_tax Price INCLUDING tax (per unit)
   * @param int   $quantity
   */
  public static function  set_order_item_totals_with_wc_tax($item, $price_incl_tax, $quantity = 1)
  {
    if (! $item instanceof WC_Order_Item_Product) {
      return false;
    }

    $product = $item->get_product();
    if (! $product) {
      return false;
    }

    // Get tax rates for this product
    $tax_rates = WC_Tax::get_rates($product->get_tax_class());

    if (empty($tax_rates)) {
      // No tax: treat as tax-free
      $subtotal = $price_incl_tax * $quantity;
      $item->set_subtotal($subtotal);
      $item->set_total($subtotal);
      $item->set_taxes(['total' => [], 'subtotal' => []]);
      $item->save();
      return [
        'subtotal_excl_tax' => $subtotal,
        'total_tax'         => 0,
        'total_incl_tax'    => $subtotal,
      ];
    }

    // Calculate inclusive tax breakdown
    $line_price = $price_incl_tax * $quantity;
    $taxes      = WC_Tax::calc_inclusive_tax($line_price, $tax_rates);

    $total_tax        = array_sum($taxes);
    $subtotal_excl_tax = $line_price - $total_tax;

    // Update item totals
    $item->set_subtotal($subtotal_excl_tax);
    $item->set_total($subtotal_excl_tax);
    $item->set_taxes([
      'total'    => $taxes,
      'subtotal' => $taxes,
    ]);

    $item->save();

    return [
      'subtotal_excl_tax' => $subtotal_excl_tax,
      'total_tax'         => $total_tax,
      'total_incl_tax'    => $line_price,
    ];
  }
}
