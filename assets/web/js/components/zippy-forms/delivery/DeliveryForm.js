import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import LocationSearch from "../LocationSearch";
import OutletSelect from "../OutletSelect";
import { toast } from "react-toastify";

const DeliveryForm = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const handleDeliveryData = (data) => {
    setDeliveryData(data);
  };

  const handleConfirm = () => {
    if (!deliveryData) {
      toast.error("Please select all required field!");
      return;
    }
    const data = {
      location: selectedLocation,
      deliveryData: deliveryData,
    };
  };

  return (
    <Box>
      <Box className="">
        <Box display={"flex"} py={2} justifyContent={"space-between"}>
          <Button color="gray">Back</Button>
          <Typography
            variant="h2"
            fontSize={20}
            fontWeight={600}
            textAlign={"center"}
          >
            Delivery Details
          </Typography>
          <Button color="gray">Exit</Button>
        </Box>

        <Box className="content_form_popup">
          <Box>
            <h5>Delivery to</h5>
            <LocationSearch onSelectLocation={handleSelectLocation} />
          </Box>
          <Box>
            <OutletSelect onChangeData={handleDeliveryData} selectedLocation={selectedLocation} />
          </Box>
        </Box>

        <Box className="method_shipping_popup_section">
          <Button className="button_action_confirm" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Box>
  );s
};

export default DeliveryForm;
