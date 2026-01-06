<?php

namespace Zippy_Booking\Src\Routers\Price_Books;

use Zippy_Booking\Src\App\Models\Price_Books\Zippy_Price_Books_Model;
use Zippy_Booking\Src\Controllers\Price_Books\Zippy_Price_Books_Controller;
use Zippy_Booking\Src\Controllers\Price_Books\Zippy_Price_Book_Products_Controller;
use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;
use WP_REST_Server;

/**
 * Price Books Router
 *
 *
 */

defined('ABSPATH') or die();

class Price_Books_Router
{
  protected static $_instance = null;

  /**
   * @return Price_Books_Router
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
    add_action('rest_api_init', array($this, 'zippy_price_books_init_api'));
    add_action('rest_api_init', array($this, 'zippy_price_book_product_init_api'));
  }

  public function zippy_price_books_init_api()
  {
    $namespace = ZIPPY_BOOKING_API_NAMESPACE;
    $permission = array(Zippy_Booking_Permission::class, 'zippy_permission_callback');
    $model_args = Zippy_Price_Books_Model::get_args();
    $update_product_rule_model_args = Zippy_Price_Books_Model::update_product_rule_args();


    register_rest_route($namespace, '/price_books', array(
      'methods'             => WP_REST_Server::READABLE, // GET
      'callback'            => [Zippy_Price_Books_Controller::class, 'show'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    // Route: /price_books
    register_rest_route($namespace, '/price_books', array(
      'methods'             => WP_REST_Server::CREATABLE, // POST
      'callback'            => [Zippy_Price_Books_Controller::class, 'store'],
      'args'                => Zippy_Price_Books_Model::store_args(),
      'permission_callback' => $permission,
    ));
    // Route: /price_books
    register_rest_route($namespace, '/price_books/today', array(
      'methods'             => WP_REST_Server::READABLE, // GET
      'callback'            => [Zippy_Price_Books_Controller::class, 'get_todays_active_pricebooks'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    // Route: /price_books/{id}
    register_rest_route($namespace, '/price_books/(?P<id>\d+)', array(
      'methods'             => WP_REST_Server::READABLE, // GET
      'callback'            => [Zippy_Price_Books_Controller::class, 'fetch'],
      'args'                => $model_args,
      'permission_callback' => $permission,
    ));

    // Route: /price_books/{id}
    register_rest_route($namespace, '/price_books/(?P<id>\d+)', array(
      'methods'             => WP_REST_Server::EDITABLE, // PUT/PATCH
      'callback'            => [Zippy_Price_Books_Controller::class, 'update'],
      'args'                => [],
      'permission_callback' => $permission,
    ));
    // Route: /price_books/{id}
    register_rest_route($namespace, '/price_books/(?P<id>\d+)', array(
      'methods'             => WP_REST_Server::DELETABLE, //DELETE
      'callback'            => [Zippy_Price_Books_Controller::class, 'delete_pricebook'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    // Route: /price_books/{pricebook_id}/rules
    register_rest_route($namespace, '/price_books/(?P<pricebook_id>\d+)/rules', array(
      'methods'             => WP_REST_Server::READABLE, // GET
      'callback'            => [Zippy_Price_Books_Controller::class, 'get_rules'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    // Route: /price_books/{pricebook_id}/rules
    register_rest_route($namespace, '/price_books/(?P<pricebook_id>\d+)/rules', array(
      'methods'             => WP_REST_Server::CREATABLE, // POST
      'callback'            => [Zippy_Price_Books_Controller::class, 'store_rule'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    register_rest_route($namespace, '/price_books/(?P<pricebook_id>\d+)/rules/(?P<rule_id>\d+)', [
      'methods'             => WP_REST_Server::EDITABLE, // PUT
      'callback'            => [Zippy_Price_Books_Controller::class, 'update_product_rule'],
      'args'                => $update_product_rule_model_args,
      'permission_callback' => $permission,
    ]);

    // Route: /price_books/{pricebook_id}/rules/{id}
    register_rest_route($namespace, '/price_books/(?P<pricebook_id>\d+)/rules/(?P<id>\d+)', array(
      'methods'             => WP_REST_Server::DELETABLE, // DELETE
      'callback'            => [Zippy_Price_Books_Controller::class, 'delete_rule'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    // Route: /price_books/rules/import
    register_rest_route($namespace, '/price_books/rules/import', array(
      'methods'             => WP_REST_Server::EDITABLE, // POST
      'callback'            => [Zippy_Price_Books_Controller::class, 'bulk_import'],
      'args'                => [],
      'permission_callback' => $permission,
    ));

    // Route: /price_books/rules/import-template
    register_rest_route($namespace, '/price-books/download-template', array(
      'methods'             => WP_REST_Server::READABLE, // POST
      'callback'            => [Zippy_Price_Books_Controller::class, 'download_template'],
      'args'                => [],
      'permission_callback' => [],
    ));
  }

  public function zippy_price_book_product_init_api(): void
  {
    $namespace = ZIPPY_BOOKING_API_NAMESPACE;
    $permission = array(Zippy_Booking_Permission::class, 'zippy_permission_callback');
    register_rest_route($namespace, '/price_books/products', array(
      'methods'             => WP_REST_Server::READABLE, // GET
      'callback'            => [Zippy_Price_Book_Products_Controller::class, 'get_products'],
      'args'                => [],
      'permission_callback' => $permission,
    ));
  }
}
