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
    if (!deliveryData || !selectedLocation) {
      toast.error("Please select all required field!");
      return;
    }
    const data = {
      location: selectedLocation,
      deliveryData: deliveryData,
    };

    /**
     * Todo list:
     * 1. Handle Submit Data
     * 2. Send message
     */
    Swal.fire({
      title: "Success",
      icon: 'success',
      timer: 3000,
      showConfirmButton: false,
      timerProgressBar: true
    });

  };

  return (
    <Box>
      <FormHeading
        onBack={() => onChangeMode("select-method")}
        title={"Delivery Details"}
      />

      <Box p={2}>
        <Box>
          <h5>
            Delivery to: <span style={{ color: "red" }}>(*)</span>
          </h5>
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
