<?php

namespace Zippy_Booking\Src\Woocommerce\Admin\Payments;

defined('ABSPATH') or exit;

class Zippy_Gateway_Paid_Upon_Collection extends \WC_Payment_Gateway
{
    public function __construct()
    {
        $this->id                 = 'paid_upon_collection';
        $this->method_title       = __('Paid Upon Collection', 'woocommerce');
        $this->method_description = __('Customer will pay when collecting goods.', 'woocommerce');
        $this->has_fields         = false;
        $this->title   = __('Paid Upon Collection', 'woocommerce');
        $this->enabled = 'yes';

        $this->init_form_fields();
        $this->init_settings();

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
    }

    public function init_form_fields()
    {
        $this->form_fields = [
            'enabled' => [
                'title'   => __('Enable/Disable', 'woocommerce'),
                'type'    => 'checkbox',
                'label'   => __('Enable Paid Upon Collection', 'woocommerce'),
                'default' => 'yes'
            ],
            'title' => [
                'title'       => __('Title', 'woocommerce'),
                'type'        => 'text',
                'description' => __('This controls the title seen during checkout.', 'woocommerce'),
                'default'     => __('Paid Upon Collection', 'woocommerce'),
            ],
        ];
    }
}
