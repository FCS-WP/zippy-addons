<?php
/**
 * Checkout Form
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/checkout/form-checkout.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see              https://docs.woocommerce.com/document/template-structure/
 * @package          WooCommerce/Templates
 * @version          3.5.0
 * @flatsome-version 3.16.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wrapper_classes = array();
$row_classes     = array();
$main_classes    = array();
$sidebar_classes = array();

$layout = get_theme_mod( 'checkout_layout' );

if ( ! $layout ) {
	$sidebar_classes[] = 'has-border';
}

if ( $layout == 'simple' ) {
	$sidebar_classes[] = 'is-well';
}

$wrapper_classes = implode( ' ', $wrapper_classes );
$row_classes     = implode( ' ', $row_classes );
$main_classes    = implode( ' ', $main_classes );
$sidebar_classes = implode( ' ', $sidebar_classes );

do_action( 'woocommerce_before_checkout_form', $checkout );

// If checkout registration is disabled and not logged in, the user cannot checkout.
if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
	echo esc_html( apply_filters( 'woocommerce_checkout_must_be_logged_in_message', __( 'You must be logged in to checkout.', 'woocommerce' ) ) );
	return;
}

// Social login.
if ( flatsome_option( 'facebook_login_checkout' ) && get_option( 'woocommerce_enable_myaccount_registration' ) == 'yes' && ! is_user_logged_in() ) {
	wc_get_template( 'checkout/social-login.php' );
}
?>

<form name="checkout" method="post" class="checkout woocommerce-checkout <?php echo esc_attr( $wrapper_classes ); ?>" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data">

	<div class="row pt-0 <?php echo esc_attr( $row_classes ); ?>">
		<div class="large-7 col  <?php echo esc_attr( $main_classes ); ?>">
			<?php if ( $checkout->get_checkout_fields() ) : ?>

				<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>

				<div id="customer_details">
					<div class="clear">
						<?php do_action( 'woocommerce_checkout_billing' ); ?>
					</div>

					<div class="clear">
						<?php do_action( 'woocommerce_checkout_shipping' ); ?>
					</div>
				</div>
				
				<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>
				<?php
				if ( WC()->cart->is_empty() ) {
					return '<p>Emty cart.</p>';
				}?>

				<table class="shop_table cart_custom" cellspacing="0">
					<thead>
						<tr>
							<th class="product-thumbnail">Image</th>
							<th class="product-name">Product Name</th>
							<th class="product-price">Price</th>
							<th class="product-quantity">Quantity</th>
							<th class="product-subtotal">Total</th>
						</tr>
					</thead>
					<tbody>
						<?php 
						$cart_subtotal = 0;
						foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
							$_product   = $cart_item['data'];
							$product_id = $cart_item['product_id'];

							if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 ) {
								$product_permalink = get_permalink( $product_id );
								$cart_subtotal += $cart_item['line_total'];
								?>

								<tr>
									<td class="product-thumbnail">
										<?php echo $_product->get_image(); ?>
									</td>

									<td class="product-name">
										<a href="<?php echo esc_url( $product_permalink ); ?>">
											<?php echo $_product->get_name(); ?>
										</a>
									</td>

									<td class="product-price">
										<?php echo wc_price( $_product->get_price() ); ?>
									</td>

									<td class="product-quantity">
										x <?php echo esc_html( $cart_item['quantity'] ); ?>
									</td>

									<td class="product-subtotal">
										<?php echo wc_price( $cart_item['line_total'] ); ?>
									</td>
								</tr>

							<?php } 
						} 
						
						$gst = $cart_subtotal * 0.09;
						$cart_total = $cart_subtotal + $gst;
						?>

						<tr>
							<td colspan="4" class="text-right"><strong>Sub-total:</strong></td>
							<td><?php echo wc_price( $cart_subtotal ); ?></td>
						</tr>
						<tr>
							<td colspan="4" class="text-right"><strong>Shipping Fee:</strong></td>
							<td><?php echo wc_price( $_SESSION['shipping_fee'] ); ?></td>
						</tr>

						<tr>
							<td colspan="4" class="text-right"><strong>GST:</strong></td>
							<td><?php echo wc_price( $gst ); ?></td>
						</tr>

						<tr>
							<td colspan="4" class="text-right"><strong>Total:</strong></td>
							<td><strong><?php echo wc_price( $cart_total + $_SESSION['shipping_fee'] ); ?></strong></td>
						</tr>
					</tbody>
				</table>


				

			<?php endif; ?>

		</div>

		<div class="large-5 col action_order">
			<?php flatsome_sticky_column_open( 'checkout_sticky_sidebar' ); ?>

					<div class="col-inner <?php echo esc_attr( $sidebar_classes ); ?>">
						<div class="checkout-sidebar sm-touch-scroll">

							<?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>

							<?php do_action( 'woocommerce_checkout_before_order_review' ); ?>
							<div id="method_shipping">
								<div class="quickcheckout-heading"><i class="fa fa-truck"></i> Delivery Method</div>
								<div class="quickcheckout-content">
									<p>Please select the preferred shipping method to use on this order.</p>
									<div class="row_item_method_shipping">
										<div class="select_method_shipping">
											<input type="radio" id="<?php echo $_SESSION['order_mode'];?>" name="<?php echo $_SESSION['order_mode'];?>" checked value="<?php echo $_SESSION['order_mode'];?>"><label for="<?php echo $_SESSION['order_mode'];?>"><?php echo $_SESSION['order_mode'];?></label>
										</div>
										<div class="price_method_shipping">
											<span>$<?php echo $_SESSION ["shipping_fee"];?></span>
										</div>
									</div>
								</div>
								<div class="quickcheckout-heading"><i class="fa fa-truck"></i> Order Information</div>
								<p class="title_cutlery">Do you need cutlery?</p>
								<div class="row_order_information">
									<label class="switch">
										<input type="checkbox" id="switchInput">
										<span class="slider round" id="switchButton"></span>
									</label>
									<p id="labelSwitch">No, thanks.</p>
								</div>
								<div class="quickcheckout-order-info">
									<table>
										<tbody>
											<tr>
												<td>Outlet Name:</td>
												<td><?php echo $_SESSION['outlet_name']; ?></td>
											</tr>
											<?php
											if($_SESSION['order_mode'] == 'delivery'){
												?>
												<tr>
													<td>Delivery Address:</td>
													<td><?php echo $_SESSION['delivery_address']; ?></td>
												</tr>
												<?php
											}
											?>
											<tr>
												<td>Date:</td>
												<td><?php echo $_SESSION['date']; ?></td>
											</tr>
											<tr>
												<td>Time:</td>
												<td><?php echo 'From ' . $_SESSION['time']['from'] . ' To ' . $_SESSION['time']['to']; ?></td>
											</tr>
										</tbody>
									</table>
								</div>
								<div class="quickcheckout-heading"><i class="fa fa-truck"></i> Payment Method</div>
								<div class="quickcheckout-content">
									<p>Please select the preferred shipping method to use on this order.</p>
								</div>
							</div>
							<div id="order_review" class="woocommerce-checkout-review-order">
							
								<?php do_action( 'woocommerce_checkout_order_review' ); ?>
							</div>
							
							<?php do_action( 'woocommerce_checkout_after_order_review' ); ?>
						</div>
					</div>

			<?php flatsome_sticky_column_close( 'checkout_sticky_sidebar' ); ?>
		</div>

	</div>
</form>

<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
