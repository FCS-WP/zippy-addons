	<table style="width:100%">
		<tbody>
			<tr>
				<td style="vertical-align:top">
					<table style="display:inline-block;border-collapse:collapse!important;float:left!important;width:286px!important;color:#1c2c3a;font-size:12px">
						<tbody>
							<?php $address = !empty($order->get_meta(BILLING_DELIVERY)) ? $order->get_meta(BILLING_DELIVERY) : $order->get_billing_address_1(); ?>
							<tr>
								<td>
									<b>Customer Name: </b><?php echo $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(); ?><br>
									<b>Billing Email: </b><a href="mailto: <?php echo $order->get_billing_email(); ?>" target="_blank"> <?php echo $order->get_billing_email(); ?></a><br>
									<b>Billing Telephone: </b><?php echo $order->get_billing_phone(); ?><br>
									<b>Billing Address: </b><?php echo $address; ?>
								</td>
							</tr>
							<tr>
								<td><br><strong>Shop:</strong> JI XIANG ANG KU KUEH PTE LTD</td>
							</tr>
							<tr>
								<td><strong>Shop Address:</strong> Block1 Everton Park 01-33 081001</td>
							</tr>
							<tr>
								<td><strong>Shop Telephone:</strong> 6223 1631 WhatsApps: 9270 0510</td>
							</tr>
						</tbody>
					</table>
				</td>
				<td style="vertical-align:top">
					<?php
					// Email Shipping Address
					if (!empty($order->get_meta('_billing_method_shipping')) && $order->get_meta('_billing_method_shipping') == 'delivery') {
						wc_get_template(
							'email-blocks/email-delivery-info.php',
							array(
								'order'         => $order,
							)
						);
					}

					if (!empty($order->get_meta('_billing_method_shipping')) && $order->get_meta('_billing_method_shipping') == 'takeaway') {
						wc_get_template(
							'email-blocks/email-takeaway-info.php',
							array(
								'order'         => $order,
							)
						);
					}

					?>
				</td>
			</tr>
		</tbody>
	</table>
