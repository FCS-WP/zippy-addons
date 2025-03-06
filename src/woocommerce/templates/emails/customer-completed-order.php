<?php

/**
 * Customer completed order email
 *
 * @package WooCommerce\Templates\Emails
 * @version 3.7.0
 */

if (! defined('ABSPATH')) {
	exit;
}

/*
 * @hooked WC_Emails::email_header() Output the email header
 */
do_action('woocommerce_email_header', $email_heading, $email);

// Fetch booking details
$booking_id = $order->get_meta('booking_id', true);
$booking_start_time = $order->get_meta('booking_start_time', true);
$booking_end_time = $order->get_meta('booking_end_time', true);
$booking_start_date = $order->get_meta('booking_start_date', true);
$booking_end_date = $order->get_meta('booking_end_date', true);

// Format the booking dates and times
$booking_start_date = !empty($booking_start_date) ? date_i18n('F j, Y', strtotime($booking_start_date)) : '';
$booking_end_date = !empty($booking_end_date) ? date_i18n('F j, Y', strtotime($booking_end_date)) : '';
$booking_start_time = !empty($booking_start_time) ? date_i18n('g:i A', strtotime($booking_start_time)) : '';
$booking_end_time = !empty($booking_end_time) ? date_i18n('g:i A', strtotime($booking_end_time)) : '';

?>
<p><?php printf( esc_html__( 'Hi %s,', 'woocommerce' ), esc_html( $order->get_billing_email() ) ); ?></p>
<p><?php esc_html_e('We have completed processing your order. Here are the details:', 'woocommerce'); ?></p>

<?php if (! empty($booking_id)) : ?>
	<h2><?php esc_html_e('Your Booking Details', 'woocommerce'); ?></h2>
	<p><strong><?php esc_html_e('Booking ID:', 'woocommerce'); ?></strong> <?php echo esc_html($booking_id); ?></p>

    <table cellspacing="0" cellpadding="6" style="width: 100%; margin-bottom: 30px" border="1">
        <thead>
            <tr>
                <th scope="col" style="text-align:left;"><?php esc_html_e('Product', 'woocommerce'); ?></th>
				<th scope="col" style="text-align:left;"><?php esc_html_e('Start date and time', 'woocommerce'); ?></th>
				<th scope="col" style="text-align:left;"><?php esc_html_e('End date and time', 'woocommerce'); ?></th>
                <th scope="col" style="text-align:left;"><?php esc_html_e('Price', 'woocommerce'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php
            // Loop through order items
            foreach ($order->get_items() as $item_id => $item) {
                // Skip over shipping and fee lines.
                if (!apply_filters('woocommerce_order_item_visible', true, $item)) {
                    continue;
                }
            ?>
                <tr>
                    <td style="text-align:left;">
                        <?php echo wp_kses_post(apply_filters('woocommerce_order_item_name', $item->get_name(), $item, false)); ?>
                    </td>
                    <td style="text-align:left;"><?php echo esc_html($booking_start_date); ?> -  <?php echo esc_html($booking_start_time); ?></td>
                    <td style="text-align:left;"><?php echo esc_html($booking_end_date); ?> - <?php echo esc_html($booking_end_time); ?></td>
                    <td style="text-align:left;">
                        <?php echo wp_kses_post($order->get_formatted_line_subtotal($item)); ?>
                    </td>
                </tr>
            <?php
            }
            ?>
        </tbody>
        <tfoot>
            <tr>
                <th scope="row" colspan="3" style="text-align:left;"><?php esc_html_e('Total', 'woocommerce'); ?></th>
                <td style="text-align:left;"><?php echo wp_kses_post($order->get_formatted_order_total()); ?></td>
            </tr>
        </tfoot>
    </table>
<?php else : ?>
	<p><?php esc_html_e('Your order details are as follows:', 'woocommerce'); ?></p>
	<?php
	/*
 * @hooked WC_Emails::order_details() Shows the order details table.
 * @hooked WC_Structured_Data::generate_order_data() Generates structured data.
 * @hooked WC_Structured_Data::output_structured_data() Outputs structured data.
 */
	do_action('woocommerce_email_order_details', $order, $sent_to_admin, $plain_text, $email);

	/*
 * @hooked WC_Emails::order_meta() Shows order meta data.
 */
	do_action('woocommerce_email_order_meta', $order, $sent_to_admin, $plain_text, $email);

	/*
 * @hooked WC_Emails::customer_details() Shows customer details
 * @hooked WC_Emails::email_address() Shows email address
 */
	do_action('woocommerce_email_customer_details', $order, $sent_to_admin, $plain_text, $email);
	?>
<?php endif; ?>

<?php

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ($additional_content) {
	echo wp_kses_post(wpautop(wptexturize($additional_content)));
}

/*
 * @hooked WC_Emails::email_footer() Output the email footer
 */
do_action('woocommerce_email_footer', $email);
