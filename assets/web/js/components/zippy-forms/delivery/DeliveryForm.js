import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import LocationSearch from "../LocationSearch";
import OutletSelect from "../OutletSelect";
import { toast } from "react-toastify";
import FormHeading from "../FormHeading";
import theme from "../../../../theme/customTheme";
import { getSelectProductId, triggerCloseLightbox } from "../../../helper/booking";
import { webApi } from "../../../api";
import { showAlert } from "../../../helper/showAlert";

const DeliveryForm = ({ onChangeMode }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const handleDeliveryData = (data) => {
    setDeliveryData(data);
  };

  const handleConfirm = async () => {
    if (!deliveryData || !selectedLocation) {
      showAlert('error', "Failed!", "Please fill all required field!");
      return;
    }

    const params = {
      product_id: getSelectProductId(),
      order_mode: "delivery",
      delivery_address: {
        lat: selectedLocation.LATITUDE,
        lng: selectedLocation.LONGITUDE
      },
      outlet_id: deliveryData.outlet,
      delivery_date: deliveryData.date,
      delivery_time: deliveryData.time,
    };

    const response = await webApi.addToCart(params);

    if (!response?.data || response.data.status !== 'success') {
      showAlert('error', "Failed!", "Can not add product. Please try again!");
      return false;
    }

    showAlert('success', "Success", "Product added to cart.");
    setTimeout(() => {
      window.location.reload();
    }, 3000);
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
