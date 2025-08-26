	<p style="text-align: left;">Order Confirmed (Order: #<?php echo $order->get_order_number(); ?>)</p>

	<p style="text-align: left;"><b>Name:</b> <?php echo $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(); ?></p>
	<p style="text-align: left;"><b>Contact:</b> <?php echo $order->get_billing_phone(); ?></p>
	<p style="text-align: left;"><b>Postal:</b> <?php echo $order->get_billing_postcode(); ?></p>
	<p style="text-align: left;"><b>Order Status:</b> <?php echo wc_get_order_status_name($order->get_status()); ?></p>
