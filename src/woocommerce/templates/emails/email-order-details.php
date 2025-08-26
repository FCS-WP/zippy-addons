<?php

/**
 * Order details table shown in emails.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/emails/email-order-details.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates\Emails
 * @version 9.8.0
 */

use Automattic\WooCommerce\Utilities\FeaturesUtil;

defined('ABSPATH') || exit;

$text_align = is_rtl() ? 'right' : 'left';

$email_improvements_enabled = FeaturesUtil::feature_is_enabled('email_improvements');
$heading_class              = $email_improvements_enabled ? 'email-order-detail-heading' : '';
$order_table_class          = $email_improvements_enabled ? 'email-order-details' : '';
$order_total_text_align     = $email_improvements_enabled ? 'right' : 'left';

if ($email_improvements_enabled) {
	add_filter('woocommerce_order_shipping_to_display_shipped_via', '__return_false');
}

/**
 * Action hook to add custom content before order details in email.
 *
 * @param WC_Order $order Order object.
 * @param bool     $sent_to_admin Whether it's sent to admin or customer.
 * @param bool     $plain_text Whether it's a plain text email.
 * @param WC_Email $email Email object.
 * @since 2.5.0
 */
?>


<div style="margin-bottom: <?php echo $email_improvements_enabled ? '24px' : '40px'; ?>;">
	<table width="100%" border="0" cellspacing="0" cellpadding="0">

		<tbody>

			<tr style="font-size:14px;color:#1c2c3a">
				<td width="250" align="left"><strong>Item(s)</strong></td>
				<td width="70" align="center"><strong>Quantity</strong></td>
				<td width="70" align="right"><strong>Unit Price</strong></td>
				<td width="70" align="right" style="padding-right:5px"><strong>Price</strong></td>
			</tr>

			<tr>
				<td colspan="4">
					<hr>
				</td>
			</tr>
			<tr style="font-size:14px;height:25px">
			</tr>

			<?php
			$image_size = $email_improvements_enabled ? 48 : 32;
			echo wc_get_email_order_items(
				$order,
				array(
					'show_sku'      => $sent_to_admin,
					'show_image'    => $email_improvements_enabled,
					'image_size'    => array($image_size, $image_size),
					'plain_text'    => $plain_text,
					'sent_to_admin' => $sent_to_admin,
				)
			);
			?>
		</tbody>
	</table>
</div>

<?php
if ($email_improvements_enabled) {
	remove_filter('woocommerce_order_shipping_to_display_shipped_via', '__return_false');
}

/**
 * Action hook to add custom content after order details in email.
 *
 * @param WC_Order $order Order object.
 * @param bool     $sent_to_admin Whether it's sent to admin or customer.
 * @param bool     $plain_text Whether it's a plain text email.
 * @param WC_Email $email Email object.
 * @since 2.5.0
 */
do_action('woocommerce_email_after_order_table', $order, $sent_to_admin, $plain_text, $email);
?>
