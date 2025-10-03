<?php

namespace Zippy_Booking\Src\Woocommerce\Admin;

use WC_Email;


if (! defined('ABSPATH')) {
    exit;
}

class Zippy_Woo_Email_Packed extends WC_Email
{

    public function __construct()
    {
        $this->id             = 'packed';
        $this->title          = 'Packed Order';
        $this->description    = 'This email is sent when an order is marked as Packed.';
        $this->customer_email = true;

        $this->template_html  = 'emails/packed.php';
        $this->template_plain = 'emails/plain/packed.php';
        $this->template_base  = ZIPPY_ADDONS_DIR_PATH . 'src/woocommerce/templates/';

        // Triggers for this email
        add_action('woocommerce_order_status_packed_notification', array($this, 'trigger'), 10, 2);

        parent::__construct();
    }

    public function trigger($order_id, $order = false)
    {
        if (! $order_id) return;

        $this->object = wc_get_order($order_id);
        $this->recipient = $this->object->get_billing_email();

        if (! $this->is_enabled() || ! $this->get_recipient()) return;

        $this->send($this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments());
    }

    public function get_default_subject()
    {
        return 'Your order is Packed';
    }

    public function get_default_heading()
    {
        return 'Order Packed';
    }

    public function get_content_html()
    {
        return wc_get_template_html($this->template_html, array(
            'order'         => $this->object,
            'email_heading' => $this->get_heading(),
            'sent_to_admin' => false,
            'plain_text'    => false,
            'email'         => $this,
        ), '', $this->template_base);
    }

    public function get_content_plain()
    {
        return wc_get_template_html($this->template_plain, array(
            'order'         => $this->object,
            'email_heading' => $this->get_heading(),
            'sent_to_admin' => false,
            'plain_text'    => true,
            'email'         => $this,
        ), '', $this->template_base);
    }
    public function get_heading()
    {
        return 'Your order is packed and ready to ship!';
    }
}
