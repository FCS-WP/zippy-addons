<?php

namespace Zippy_Booking\Src\Services\adp;

use ADP\BaseVersion\Includes\Cache\CacheHelper;
use ADP\BaseVersion\Includes\Functions;
use ADP\BaseVersion\Includes\PriceDisplay\ProcessedGroupedProduct;
use ADP\BaseVersion\Includes\PriceDisplay\ProcessedProductSimple;
use ADP\BaseVersion\Includes\PriceDisplay\ProcessedVariableProduct;
use WC_Product;

class Zippy_Functions extends Functions
{
    public function getDiscountedProductPrice($theProd, $qty, $useEmptyCart = true, $user_id = null)
    {
        $customer = !empty($user_id) ? new \WC_Customer($user_id) : WC()->customer;
        if ($useEmptyCart || ! $this->isGlobalEngineExisting()) {
            $productProcessor = $this->productProcessor;
            $cart             = $this->cartBuilder->create($customer, WC()->session);
            $productProcessor->withCart($cart);
        } else {
            $productProcessor = $this->globalEngine->getProductProcessor();
        }

        if (is_numeric($theProd)) {
            $product = CacheHelper::getWcProduct($theProd);
        } elseif ($theProd instanceof WC_Product) {
            $product = clone $theProd;
        } else {
            return null;
        }

        $processedProduct = $productProcessor->calculateProduct($product, $qty);

        if (is_null($processedProduct)) {
            return array();
        }

        if ($processedProduct instanceof ProcessedVariableProduct) {
            return array($processedProduct->getLowestPrice(), $processedProduct->getHighestPrice());
        } elseif ($processedProduct instanceof ProcessedGroupedProduct) {
            return array($processedProduct->getLowestPrice(), $processedProduct->getHighestPrice());
        } elseif ($processedProduct instanceof ProcessedProductSimple) {
            return $processedProduct->getPrice();
        } else {
            return null;
        }
    }
}
