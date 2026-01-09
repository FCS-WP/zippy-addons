	<p style="text-align: left;">Order Confirmed (Order: #<?php echo $order->get_order_number(); ?>)</p>

	<p style="text-align: left;"><b>Name:</b> <?php echo $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(); ?></p>
	<p style="text-align: left;"><b>Contact:</b> <?php echo $order->get_billing_phone(); ?></p>
	<?php
	if (!empty($order->get_billing_postcode())) {
		echo '<p style="text-align: left;"><b>Postal Code:</b> ' . $order->get_billing_postcode() . '</p>';
	}
	?>
	<p style="text-align: left;"><b>Order Status:</b> <?php echo wc_get_order_status_name($order->get_status()); ?></p>

	<!-- Order Note here  -->
	<?php if (!empty($order->get_customer_note())) {
		echo '<p style="text-align: left;"><b>Order Note:</b> ' . esc_html($order->get_customer_note()) . '</p>';
	} ?>
