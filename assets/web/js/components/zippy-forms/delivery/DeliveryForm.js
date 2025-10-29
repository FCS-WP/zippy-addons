import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import LocationSearch from "../LocationSearch";
import OutletSelect from "../OutletSelect";
import FormHeading from "../FormHeading";
import theme from "../../../../theme/customTheme";
import { getSelectProductId } from "../../../helper/booking";
import { webApi } from "../../../api";
import { showAlert } from "../../../helper/showAlert";

const DeliveryForm = ({ onChangeMode }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const handleDeliveryData = (data) => {
    setDeliveryData(data);
  };

  const handleConfirm = async () => {
    if (!deliveryData || !selectedLocation) {
      showAlert("error", "Failed!", "Please fill all required field!");
      return;
    }
    setIsLoading(true);

    const params = {
      product_id: getSelectProductId(),
      order_mode: "delivery",
      delivery_address: {
        address_name: selectedLocation.ADDRESS,
        lat: selectedLocation.LATITUDE,
        lng: selectedLocation.LONGITUDE,
      },
      outlet_id: deliveryData.outlet,
      date: deliveryData.date,
      time: deliveryData.time,
    };

    const response = await webApi.addToCart(params);

    if (!response?.data || response.data.status !== "success") {
      showAlert("error", "Failed!", "Can not add product. Please try again!");
      setIsLoading(false);
      return false;
    }
    showAlert("success", "Success", response.data.message, 2000);

    setTimeout(() => {
      document.body.dispatchEvent(
        new Event("wc_fragment_refresh", { bubbles: true })
      );

      window.location.reload(true);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (selectedLocation && deliveryData) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedLocation, deliveryData]);

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
          disabled={isDisabled}
          loading={isLoading}
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
