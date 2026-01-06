<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

class Zippy_Handle_Product_Add_On
{
  /**
   * Build addon rules (min/max for each sub product)
   */
  public static function get_list_addons($list_sub_products, $is_composite_product = false, $grouped_addons = [], $product_parent = null)
  {
    $addons = [];
    $is_baby_shower = self::is_baby_shower_product($product_parent);

    if (!empty($list_sub_products)) {
      foreach ($list_sub_products as $sub_product) {
        if (empty($sub_product) || !is_array($sub_product) || empty($sub_product['product'])) {
          continue;
        }

        $sub_product_id = $sub_product['product']->ID;

        $min_qty        = $is_baby_shower ? 0 : intval($sub_product['minimum_quantity'] ?? 0);
        // $min_qty        = 0;

        $prod      = wc_get_product($sub_product_id);
        $image_url = wp_get_attachment_image_url($prod->get_image_id(), 'thumbnail');
        $max_qty = $prod ? intval($prod->get_stock_quantity()) : 0;

        if ($is_composite_product && !$is_baby_shower) {
          $max_qty = $min_qty;
          // $max_qty = intval($grouped_addons['quantity_products_group'] ?? 0);
          // if (!in_array($sub_product_id, $grouped_addons['product_ids'] ?? [])) {
          //   $max_qty = $min_qty;
          // }
        }


        $addons[] = [
          'id'    => $sub_product_id,
          'name'  => get_the_title($sub_product_id),
          'sku'   => $prod ? $prod->get_sku() : '',
          'image' => $image_url,
          'min'   => $min_qty,
          'max'   => $max_qty,
        ];
      }
    }

    return $addons;
  }

  public static function is_baby_shower_product($product)
  {
    $categories = get_the_terms($product->get_id(), 'product_cat');
    if (!empty($categories)) {
      foreach ($categories as $category) {
        if ($category->slug === 'baby-shower') {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get grouped addon rules
   */
  public static function get_grouped_addons($groups)
  {
    $grouped_addons = [
      'product_ids'             => [],
      'quantity_products_group' => 0,
    ];

    // if (!empty($groups)) {
    //   $grouped_addons['quantity_products_group'] = intval($groups['quantity_products_group'] ?? 0);

    //   if (!empty($groups['product_group']) && is_array($groups['product_group'])) {
    //     foreach ($groups['product_group'] as $group) {
    //       $grouped_addons['product_ids'][] = $group->ID;
    //     }
    //   }
    // }

    return $grouped_addons;
  }


  public static function build_addon_data($addons = [], $quantity = 1, $user_id = null)
  {
    $data = [];
    if (!empty($addons) && is_array($addons)) {
      foreach ($addons as $key => $addon) {
        if (empty($addon) || !is_array($addon) || !isset($addon['item_id'])) {
          continue;
        }
        $addon_id = intval($addon['item_id']);


        $qty = intval($addon['quantity'] * $quantity ?? 0);

        if ($qty > 0) {
          $product = wc_get_product($addon_id);

          $data[$addon_id] = [$qty, get_product_pricing_rules($product, 1, $user_id)]; // [0 -> quantity , 1 -> price]
        }
      }
    }

    return $data;
  }

  public static function calculate_addon_total($addons = [], $combo_extra_price = 0)
  {
    $total = 0;
    if (!empty($addons) && is_array($addons)) {
      foreach ($addons as $key => $addon) {
        if (empty($addon) || !is_array($addon) || count($addon) < 2) {
          continue;
        }

        $quantity = intval($addon[0] ?? 0);
        $price = floatval($addon[1] ?? 0);

        $total += $quantity * $price;
      }
    }
    $total += floatval($combo_extra_price);

    return $total;
  }
}
