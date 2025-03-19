import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import LocationSearch from "../LocationSearch";
import OutletSelect from "../OutletSelect";
import { toast } from "react-toastify";
import FormHeading from "../FormHeading";
import theme from "../../../../theme/customTheme";
import { getSelectProductId, triggerCloseLightbox } from "../../../helper/booking";

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
      Swal.fire({
        title: "Failed!",
        text: "Please fill all required field!",
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    const data = {
      product_id: getSelectProductId(),
      order_mode: "delivery",
      delivery_address: (selectedLocation.LATITUDE + "," + selectedLocation.LONGITUDE),
      outlet_id: deliveryData.outlet.id,
      delivery_date: deliveryData.date,
      delivery_time: deliveryData.time,
    };

    Swal.fire({
      title: "Success",
      icon: "success",
      timer: 3000,
      showConfirmButton: false,
      timerProgressBar: true,
    });

    triggerCloseLightbox();
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
