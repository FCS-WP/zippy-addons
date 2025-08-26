<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #cccccc;border-collapse:collapse">
	<tbody>
		<tr>
			<td align="center" bgcolor="#ffffff" style="padding:40px 0 30px 0;color:#153643;font-size:28px;font-weight:bold;font-family:Arial,sans-serif">
				<img src="https://ci3.googleusercontent.com/meips/ADKq_NYG1-mhVM-phyMXN_b8W-2FoKfra2xDkbu4X1eN2CNdi7OhqEJPn3G25B04FGoXZUF1BLC5HGf5ZjGD8xxmCp1R8d-gIfYe9npMMYETdTsM_0bZIKzvTUGS2B8T2QbrOzQcVaLtpwC-n8XAu-ACfGf74riPamu1FopTQcygAXw=s0-d-e1-ft#https://jixiangeverton.com.sg//image/catalog/Ji%20Xiang/Logo%20and%20Banner/ji-xiang-logo-for-website.png" style="display:block;width:150px" class="CToWUd a6T" data-bit="iit" tabindex="0">
			</td>
		</tr>
		<tr>
			<td bgcolor="#ffffff" style="padding:40px 30px 40px 30px">
				<table border="0" cellpadding="0" cellspacing="0" width="100%">

					<tbody>
						<tr>
							<td style="padding:20px 0 30px 0;color:#153643;font-family:Arial,sans-serif;font-size:13px;line-height:20px">
								<p>Order Confirmed (Order: #<?php echo $order->get_order_number(); ?>)</p>

								<p><b>Name:</b> <?php echo $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(); ?></p>
								<p><b>Contact:</b> <?php echo $order->get_billing_phone(); ?></p>
								<p><b>Postal:</b> <?php echo $order->get_billing_postcode(); ?></p>
								<p><b>Order Status:</b> <?php echo wc_get_order_status_name($order->get_status()); ?></p>

								<p></p>
								<div style="font-family:'Open Sans',Arial,Helvetica,sans-serif;margin:0px;padding:0px;border:1px solid #ccc">

									<table width="100%">
										<tbody>
											<tr>
												<td align="center">
													<table width="600">
														<tbody>
															<tr>
																<td>

																	<table width="100%">
																		<tbody>
																			<tr>
																				<td>
																					<table width="100%" style="border-collapse:collapse!important">
																						<tbody>
																							<tr>
																								<td style="font-size:20px;line-height:20px;width:160px"><strong>Order Receipt</strong></td>
																							</tr>
																							<tr>
																								<td height="5"></td>
																							</tr>

																						</tbody>
																					</table>
																				</td>
																			</tr>
																			<tr>
																				<td height="20"></td>
																			</tr>
																			<tr>
																				<td>
																					<table style="width:100%">
																						<tbody>
																							<tr>
																								<td style="vertical-align:top">
																									<table style="display:inline-block;border-collapse:collapse!important;float:left!important;width:286px!important;color:#1c2c3a;font-size:12px">
																										<tbody>
																											<tr>
																												<td>
																													<b>Customer Name: </b><?php echo $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(); ?>
																													<br>
																													<b>Billing Email: </b>
																													<p><b>Email:</b> <?php echo $order->get_billing_email(); ?></p>
																													<br>
																													<b>Billing Telephone: </b><?php echo $order->get_billing_phone(); ?><br>
																													<b>Billing Address: </b><?php echo $order->get_meta('delivery_address'); ?>
																												</td>
																											</tr>
																											<tr>
																												<td><br><strong>Restaurant:</strong> JI XIANG ANG KU KUEH PTE LTD</td>
																											</tr>
																											<tr>
																												<td><strong>Restaurant Address:</strong> Block1 Everton Park 081001 01-33</td>
																											</tr>
																											<tr>
																												<td><strong>Restaurant Telephone:</strong> 6223 1631 WhatsApps: 9270 0510</td>
																											</tr>
																											<tr>
																												<td><strong>Remarks:</strong> Blk 414 Yishun Ring Road S`pore 760414 delivery 1 to 2pm<br>
																													Approve by Jack</td>
																											</tr>
																										</tbody>
																									</table>
																								</td>
																								<td style="vertical-align:top">
																									<table width="286" border="0" align="center" cellpadding="0" cellspacing="0" style="width:286px!important;color:#1c2c3a;font-size:12px;text-decoration:none;outline:none" bgcolor="#ffffff">
																										<tbody>
																											<tr>
																												<td align="right" valign="top"><strong>Order No.:</strong> #<?php echo $order->get_order_number(); ?></td>
																											</tr>
																											<tr>
																											<tr>
																												<td align="right" valign="top"><strong>Order Date:</strong> <?php echo $order->get_date_created(); ?></td>
																											</tr>
																											<tr>
																												<td align="right" valign="top"><strong>Delivery Date: </strong> <?php echo $order->get_meta('_billing_date'); ?></td>
																											</tr>
																											<tr>
																												<td align="right" valign="top"><strong>Delivery Time: </strong> <?php echo $order->get_meta('billing_time'); ?></td>
																											</tr>

																											<tr>
																												<td align="right" valign="top"><strong>Order Mode:</strong> <?php echo $order->get_meta('_billing_method_shipping'); ?></td>
																											</tr>

																											<tr>
																												<td align="right" valign="top"><br>
																													<b>Delivery Address</b><br><?php echo $order->get_shipping_address_1(); ?>
																												</td>
																											</tr>
																											<tr>
																												<td align="right" valign="top"><b>Telephone:</b> <?php echo $order->get_billing_phone(); ?></td>
																											</tr>
																											<tr>
																												<td align="right" valign="top"><b>Email:</b> <a href="mailto:<?php echo $order->get_billing_email(); ?>" target="_blank"><?php echo $order->get_billing_email(); ?></a></td>
																											</tr>
																										</tbody>
																									</table>
																								</td>
																							</tr>
																						</tbody>
																					</table>


																				</td>
																			</tr>

																			<tr>
																				<td height="30"></td>
																			</tr>

																			<tr>
																				<td>
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
																								<?php foreach ($order->get_items() as $item_id => $item) :
																									$product = $item->get_product();
																								?>
																							<tr>
																								<td><?php echo $item->get_name(); ?></td>
																								<td align="center"><?php echo $item->get_quantity(); ?></td>
																								<td align="center"><?php echo $product->get_price(); ?></td>
																								<td align="right"><?php echo wc_price($item->get_total()); ?></td>
																							</tr>
																						<?php endforeach; ?>
																			</tr>

																			<tr>
																				<td colspan="4">
																					<hr>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</td>
															</tr>

															<tr>
																<td height="6"></td>
															</tr>

															<tr>
																<td align="center" valign="top" bgcolor="#ffffff" style="font-family:'Open Sans',Arial,Helvetica,sans-serif;border-collapse:collapse!important">

																	<table width="100%" bgcolor="#ffffff" border="0" cellspacing="0" cellpadding="0" style="font-family:'Open Sans',Arial,Helvetica,sans-serif;border-collapse:collapse!important">

																		<tbody>
																			<tr>
																				<td align="left" valign="top" bgcolor="#ffffff" style="font-family:'Open Sans',Arial,Helvetica,sans-serif;color:#ffffff;font-size:14px;line-height:14px;border-collapse:collapse!important">.</td>
																				<td width="180" align="left" valign="top" bgcolor="#ffffff" style="font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;color:#1c2c3a;line-height:14px;border-collapse:collapse!important"><strong>Subtotal</strong></td>
																				<td width="100" align="right" valign="top" bgcolor="#ffffff" style="font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;color:#1c2c3a;line-height:14px;border-collapse:collapse!important"><strong>$96.50</strong></td>
																			</tr>

																			<tr>
																				<td height="10"></td>
																			</tr>


																			<tr>
																				<td align="left" style="font-size:12px;line-height:14px"></td>
																				<td width="180" align="left" style="font-size:12px">+ Delivery fee</td>
																				<td width="100" align="right" style="font-size:12px"> $20.00</td>
																			</tr>

																			<tr>
																				<td height="10"></td>
																			</tr>

																			<tr>
																				<td height="10"></td>
																			</tr>

																			<tr>
																				<td colspan="3">
																					<hr>
																				</td>
																			</tr>
																			<tr>

																			</tr>
																			<tr>
																				<td height="15"></td>
																			</tr>

																			<tr>
																				<td align="left" style="color:#ffffff;font-size:14px;line-height:14px">.</td>
																				<td width="180" align="left" style="font-size:14px;color:#1c2c3a;line-height:14px"><strong>Total (inclusive of GST) </strong></td>
																				<td width="100" align="right" style="font-size:14px;color:#1c2c3a;line-height:14px"><strong> $116.50</strong></td>
																			</tr>


																			<tr>
																				<td height="15"></td>
																			</tr>

																			<tr>
																				<td colspan="3">
																					<hr>
																				</td>
																			</tr>
																			<tr>

																			</tr>
																			<tr>
																				<td height="10"></td>
																			</tr>

																			<tr>
																				<td align="left" style="color:#ffffff;font-size:14px;line-height:14px">.</td>
																				<td width="180" align="left" style="font-size:12px;color:#1c2c3a;line-height:14px"><strong>GST</strong></td>
																				<td width="100" align="right" style="font-size:12px;color:#1c2c3a;line-height:14px"> $9.62</td>
																			</tr>





																			<tr>
																				<td height="10"></td>
																			</tr>

																			<tr>
																				<td align="left" valign="top"></td>
																				<td colspan="2" align="left" style="font-size:12px;color:#1c2c3a;line-height:12px"><strong>Payment method: Credit Card (Powered by Omise)</strong></td>
																			</tr>

																		</tbody>
																	</table>

																</td>
															</tr>

															<tr>
																<td height="10"></td>
															</tr>

															<tr>
																<td colspan="3">
																	<hr>
																</td>
															</tr>
															<tr>

															</tr>
															<tr>
																<td style="font-size:12px;color:#333;line-height:12px">
																	Block1 Everton Park 081001 01-33 <br>
																	<br>
																	<span style="color:#333;font-family:'Open Sans',Arial,Helvetica,sans-serif">JI XIANG ANG KU KUEH PTE LTD © 2025</span>
																</td>
															</tr>

														</tbody>
													</table>

												</td>
											</tr>
										</tbody>
									</table>
							</td>
						</tr>
					</tbody>
				</table>


				</div>
				<p></p>
			</td>
		</tr>
	</tbody>
</table>
</td>
</tr>
<tr>
	<td bgcolor="#000000" style="padding:30px 30px 30px 30px">
		<table border="0" cellpadding="0" cellspacing="0" width="100%">
			<tbody>
				<tr>
					<td style="color:#f2f2f2;font-family:Arial,sans-serif;font-size:14px" width="75%">
						JI XIANG ANG KU KUEH PTE LTD<br>
					</td>
				</tr>
			</tbody>
		</table>
	</td>
</tr>
</tbody>
</table>
