<?php
$item_totals       = $order->get_order_item_totals();
?>
<table width="100%" bgcolor="#ffffff" border="0" cellspacing="0" cellpadding="0" style="font-family:'Open Sans',Arial,Helvetica,sans-serif;border-collapse:collapse!important">
	<tbody>

		<tr>
			<td align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px"></td>
			<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<strong>
					Subtotal:
				</strong>
			</td>
			<td width="200" align="right" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<?php echo $item_totals['cart_subtotal']['value']; ?>
			</td>
		</tr>
		<tr>
			<td align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px"></td>
			<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<strong>
					GST (included):
				</strong>
			</td>
			<td width="200" align="right" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<?php echo wc_price($order->get_total() - ($order->get_total() / 1.09)); ?>
			</td>
		</tr>
		<tr>
			<td align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px"></td>
			<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<strong>
					Shipping Fee:
				</strong>
			</td>
			<td width="200" align="right" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<?php echo wc_price($order->get_shipping_total()); ?>
			</td>
		</tr>
		<tr>
			<td align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px"></td>
			<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<strong>
					Extra Fee:
				</strong>
			</td>
			<td width="200" align="right" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<?php echo wc_price($order->get_total_fees()); ?>
			</td>
		</tr>

		<tr>
			<td align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px"></td>
			<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<strong>
					Total:
				</strong>
			</td>
			<td width="200" align="right" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<?php echo wc_price($order->get_total()); ?>
			</td>
		</tr>
		<tr>
			<td align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px"></td>
			<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<strong>
					Payment Method:
				</strong>
			</td>
			<td width="200" align="right" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
				<?php echo $order->get_payment_method_title(); ?>
			</td>
		</tr>
	</tbody>
</table>
