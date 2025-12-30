<?php

if (!defined('BILLING_DATE'))
  define('BILLING_DATE', '_billing_date');
if (!defined('BILLING_TIME'))
  define('BILLING_TIME', '_billing_time');
if (!defined('BILLING_OUTLET_ADDRESS'))
  define('BILLING_OUTLET_ADDRESS', '_billing_outlet_address');
if (!defined('BILLING_OUTLET'))
  define('BILLING_OUTLET', '_billing_outlet');
if (!defined('BILLING_METHOD'))
  define('BILLING_METHOD', '_billing_method_shipping');
if (!defined('BILLING_DISTANCE'))
  define('BILLING_DISTANCE', '_billing_distance');
if (!defined('BILLING_DELIVERY'))
  define('BILLING_DELIVERY', '_billing_delivery_to');



/* Set constant enpoint to the plugin directory. */
if (!defined('ZIPPY_BOOKING_API_NAMESPACE')) {
  define('ZIPPY_BOOKING_API_NAMESPACE', 'zippy-addons/v1');
}

/* Booking Product Mapping table name */
if (!defined('OUTLET_CONFIG_TABLE_NAME')) {
  define('OUTLET_CONFIG_TABLE_NAME', 'fcs_data_zippy_addons_outlet');
}

/* Booking Shipping Config table name */
if (!defined('OUTLET_SHIPPING_CONFIG_TABLE_NAME')) {
  define('OUTLET_SHIPPING_CONFIG_TABLE_NAME', 'fcs_data_zippy_addons_shipping_config');
}

/* Booking Product Mapping table name */
if (!defined('ZIPPY_LOG_TABLE_NAME')) {
  define('ZIPPY_LOG_TABLE_NAME', 'fcs_data_zippy_log');
}


/* Booking Product Mapping table name */
if (!defined('DELIVERY_TABLE')) {
  define('DELIVERY_TABLE', $wpdb->prefix . 'zippy_addons_delivery');
}

// Booking type
if (!defined('ZIPPY_BOOKING_BOOKING_TYPE_SINGLE')) {
  define('ZIPPY_BOOKING_BOOKING_TYPE_SINGLE', 'single');
}
if (!defined('ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE')) {
  define('ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE', 'multiple');
}


// API Response Message
if (!defined('ZIPPY_BOOKING_SUCCESS')) {
  define('ZIPPY_BOOKING_SUCCESS', 'Operation Successful!');
}
if (!defined('ZIPPY_BOOKING_NOT_FOUND')) {
  define('ZIPPY_BOOKING_NOT_FOUND', 'Nothing Found!');
}
if (!defined('ZIPPY_BOOKING_ERROR')) {
  define('ZIPPY_BOOKING_ERROR', 'An Error Occurred!');
}


if (!defined('ZIPPY_BOOKING_API_TOKEN_NAME')) {
  define('ZIPPY_BOOKING_API_TOKEN_NAME', 'zippy_booking_api_token');
}

if (!defined('ZIPPY_BOOKING_API_TOKEN')) {
  define('ZIPPY_BOOKING_API_TOKEN', 'FEhI30q7ySHtMfzvSDo6RkxZUDVaQ1BBU3lBcGhYS3BrQStIUT09');
}

if (!defined('SHIPPING_CONFIG_META_KEY')) {
  define('SHIPPING_CONFIG_META_KEY', '_zippy_addons_shipping_fee_config');
}

if (!defined('ONEMAP_API_URL')) {
  define('ONEMAP_API_URL', 'https://www.onemap.gov.sg');
}

if (!defined('ONEMAP_ACCESS_TOKEN_KEY')) {
  define('ONEMAP_ACCESS_TOKEN_KEY', "onemap_access_token");
}

if (!defined('ONEMAP_META_KEY')) {
  define('ONEMAP_META_KEY', "one_map_credentials");
}

// Price Book Table Name
if (!defined('PRICEBOOK_TABLE')) {
  define('PRICEBOOK_TABLE', "pricebook_containers");
}
// Price Book Products Table 
if (!defined('PRICEBOOK_PRODUCTS_TABLE')) {
  define('PRICEBOOK_PRODUCTS_TABLE', "pricebook_product_relations");
}
