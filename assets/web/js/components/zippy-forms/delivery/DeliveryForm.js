import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import LocationSearch from "../LocationSearch";
import OutletSelect from "../OutletSelect";
import { toast } from "react-toastify";
import FormHeading from "../FormHeading";
import theme from "../../../../theme/customTheme";

const DeliveryForm = ({ onChangeMode }) => {
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
      <FormHeading
        onBack={() => onChangeMode("select-method")}
        title={"Delivery Details"}
      />

      <Box p={2}>
        <Box>
          <h5>Delivery to</h5>
          <LocationSearch onSelectLocation={handleSelectLocation} />
        </Box>
        <Box>
          <OutletSelect
            onChangeData={handleDeliveryData}
            selectedLocation={selectedLocation}
          />
        </Box>
      </Box>

      <Box p={2}>
        <Button
          fullWidth
          sx={{
            paddingY: "10px",
            background: theme.palette.primary.main,
            color: "#fff",
            fontWeight: "600",
          }}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Box>
    </Box>
  );
};

export default DeliveryForm;
