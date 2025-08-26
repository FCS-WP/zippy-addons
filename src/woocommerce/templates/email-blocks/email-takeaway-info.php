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
	      <td align="right" valign="top"><strong>Takeaway Date: </strong> <?php echo $order->get_meta('_billing_date'); ?></td>
	    </tr>
	    <tr>
	      <td align="right" valign="top"><strong>Takeaway Time: </strong> <?php echo $order->get_meta('_billing_time'); ?></td>
	    </tr>

	    <tr>
	      <td align="right" valign="top"><strong>Order Mode:</strong> <?php echo ucfirst($order->get_meta('_billing_method_shipping')); ?></td>
	    </tr>

	    <tr>
	      <td align="right" valign="top"><b>Telephone:</b> <?php echo $order->get_billing_phone(); ?></td>
	    </tr>
	    <tr>
	      <td align="right" valign="top"><b>Email:</b> <a href="mailto:<?php echo $order->get_billing_email(); ?>" target="_blank"><?php echo $order->get_billing_email(); ?></a></td>
	    </tr>
	  </tbody>
	</table>
