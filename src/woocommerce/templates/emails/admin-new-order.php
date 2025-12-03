<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #cccccc;border-collapse:collapse">
    <tbody>
        <tr>
            <td align="center" bgcolor="#ffffff" style="padding:40px 0 30px 0;color:#153643;font-size:28px;font-weight:bold;font-family:Arial,sans-serif">
                <img src="https://jixiangeverton.com.sg/wp-content/uploads/2025/05/ji-xiang-logo-for-website.png" style="display:block;width:150px" class="CToWUd a6T" data-bit="iit" tabindex="0">
            </td>
        </tr>
        <tr>
            <td bgcolor="#ffffff" style="padding:40px 30px 40px 30px">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">

                    <tbody>
                        <tr>
                            <td style="padding:20px 0 30px 0;color:#153643;font-family:Arial,sans-serif;font-size:13px;line-height:20px">
                                <?php
                                // Email header
                                wc_get_template(
                                    'email-blocks/email-header.php',
                                    array(
                                        'order'         => $order,
                                    )
                                )
                                ?>

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

                                                                                    <?php
                                                                                    // Email Customer Billing Info

                                                                                    wc_get_template(
                                                                                        'email-blocks/email-customer-billing.php',
                                                                                        array(
                                                                                            'order'         => $order,
                                                                                        )
                                                                                    )
                                                                                    ?>

                                                                                </td>
                                                                            </tr>

                                                                            <tr>
                                                                                <td height="30"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <!-- Order Items -->
                                                                                <?php
                                                                                do_action('woocommerce_email_order_details', $order, $sent_to_admin, $plain_text, $email);
                                                                                ?>
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

                                                                    <?php
                                                                    // Email Order Total

                                                                    wc_get_template(
                                                                        'email-blocks/email-order-total.php',
                                                                        array(
                                                                            'order'         => $order,
                                                                        )
                                                                    )
                                                                    ?>

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
                                                                    Block1 Everton Park 01-33 081001 <br>
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
