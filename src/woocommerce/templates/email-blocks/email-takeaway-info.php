	<?php $order_date = !empty($order->get_meta('_billing_date')) ? $order->get_meta('_billing_date') : ''; ?>

	<table width="286" border="0" align="center" cellpadding="0" cellspacing="0" style="width:286px!important;color:#1c2c3a;font-size:12px;text-decoration:none;outline:none" bgcolor="#ffffff">
		<tbody>
			<tr>
				<td align="right" valign="top"><strong>Order No.:</strong> #<?php echo $order->get_order_number(); ?></td>
			</tr>
			<tr>
			<tr>
				<td align="right" valign="top"><strong>Order Date:</strong> <?php echo $order->get_date_created()->date('D, j M Y'); ?></td>
			</tr>
			<tr>
				<td align="right" valign="top"><strong>Takeaway Date: </strong> <?php echo date("D, j M Y", strtotime($order_date)) ?></td>
			</tr>
			<tr>
				<td align="right" valign="top"><strong>Takeaway Time: </strong> <?php echo $order->get_meta('_billing_time'); ?></td>
			</tr>
			<tr>
				<td align="right" valign="top"><strong>Order Mode:</strong> <?php echo ucfirst($order->get_meta('_billing_method_shipping')); ?></td>
			</tr>
			<tr>
				<td align="right" valign="top"><strong>Payment Method:</strong> <?php echo esc_html($order->get_payment_method_title()); ?></td>
			</tr>
			<tr>
				<td align="right" valign="top"><b>Telephone:</b> <?php echo $order->get_billing_phone(); ?></td>
			</tr>
			<tr>
				<td align="right" valign="top"><b>Email:</b> <a href="mailto:<?php echo $order->get_billing_email(); ?>" target="_blank"><?php echo $order->get_billing_email(); ?></a></td>
			</tr>
		</tbody>
	</table>
