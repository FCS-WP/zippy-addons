import { Box, Button, Grid2, Input, TextField, Typography } from "@mui/material";
import React from "react";

const DeliveryForm = () => {
  return (
    <Box>
      <Box className="method_shipping_popup">
        <Grid2 className="method_shipping_popup_section row_title_form">
          <Grid2 className="method_shipping_popup_back">
            <Button>Back</Button>
          </Grid2>
          <Grid2 className="method_shipping_popup_title">
            <Typography variant="h2" fontSize={20} fontWeight={600}>Delivery Details</Typography>
          </Grid2>
          <Grid2 className="method_shipping_popup_exit">
            <Button>Exit</Button>
          </Grid2>
        </Grid2>

        <Box className="content_form_popup">
          <Box className="method_shipping_popup_section">
            <Typography>Delivery To</Typography>
            <TextField
              className="form-control"
              name="input_address_1"
              placeholder="Key in your address/postal code to proceed"
              id="input-adress"
              autocomplete="nope"
            />
          </Box>

          <div className="method_shipping_popup_section">
            <label>Select an Outlet</label>
            <select name="selectOutlet" id="selectOutlet">
              <option value="JI XIANG ANG KU KUEH PTE LTD (Block1  Everton Park, 01-33)">
                JI XIANG ANG KU KUEH PTE LTD (Block1 Everton Park, 01-33)
              </option>
            </select>
          </div>
          <div className="method_shipping_popup_section">
            {/* <?php echo do_shortcode('[pickup_date_calander]'); ?> */}
          </div>
          <div className="method_shipping_popup_section">
            <label>Select Delivery Time</label>
            <select name="selectTakeAwayTime" id="selectTakeAwayTime">
              <option value="11:00 AM to 12:00 PM">11:00 AM to 12:00 PM</option>
              <option value="12:00 PM to 1:00 PM">12:00 PM to 1:00 PM</option>
              <option value="1:00 PM to 2:00 PM">1:00 PM to 2:00 PM</option>
              <option value="2:00 PM to 3:00 PM">2:00 PM to 3:00 PM</option>
            </select>
          </div>
        </Box>
        <div className="method_shipping_popup_section">
          <button className="button_action_confirm">Confirm</button>
        </div>
      </Box>
    </Box>
  );
};

export default DeliveryForm;
