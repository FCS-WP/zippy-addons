	<table width="100%" bgcolor="#ffffff" border="0" cellspacing="0" cellpadding="0" style="font-family:'Open Sans',Arial,Helvetica,sans-serif;border-collapse:collapse!important">
		<tbody>

			<tr>
				<td height="10"></td>
			</tr>

			<?php

			$item_totals       = $order->get_order_item_totals();
			$item_totals_count = count($item_totals);

			if ($item_totals) {
				$i = 0;
				foreach ($item_totals as $total) {
					$i++;
					$last_class = ($i === $item_totals_count) ? ' order-totals-last' : '';
			?>
					<tr>
						<td align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px"></td>
						<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
							<strong>
								<?php
								echo wp_kses_post($total['label']) . ' ';
								if ($email_improvements_enabled) {
									echo isset($total['meta']) ? wp_kses_post($total['meta']) : '';
								}
								?>
							</strong>
						</td>
						<td width="200" align="right" valign="top" bgcolor="#ffffff" style="font-size:12px;color:#1c2c3a;line-height:14px">
							<?php echo wp_kses_post($total['value']); ?>
						</td>
					</tr>

			<?php
				}
			}
			?>

		</tbody>
	</table>
