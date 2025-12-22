import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import LocationSearch from "../LocationSearch";
import OutletSelect from "../OutletSelect";
import FormHeading from "../FormHeading";
import theme from "../../../../theme/customTheme";
import { getSelectProductId } from "../../../helper/booking";
import { webApi } from "../../../api";
import { showAlert } from "../../../helper/showAlert";
import { useOutletProvider } from "../../../providers/OutletProvider";

const DeliveryForm = ({ onChangeMode }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isCalcDistance, setIsCalcDistance] = useState(false);
  const { selectedOutlet, orderModeData, setOrderModeData } =
    useOutletProvider();

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const handleGetDeliveryConfig = async () => {
    setIsFetching(true);
    const params = {
      outlet_id: selectedOutlet.id,
      delivery_type: "delivery",
    };
    const { data: response } = await webApi.getDeliveryConfig(params);
    if (!response) {
      console.log("Error get config from BE");
      return;
    }
    setOrderModeData(response.data);
    setTimeout(() => {
      setIsFetching(false);
    }, 1000);
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
        blk_no: selectedLocation.BLK_NO ?? '',
        road_name: selectedLocation.ROAD_NAME,
        building: selectedLocation.BUILDING,
        postal: selectedLocation.POSTAL,
        lat: selectedLocation.LATITUDE,
        lng: selectedLocation.LONGITUDE,
      },
      outlet_id: deliveryData.outlet,
      date: deliveryData.date,
      time: deliveryData.time,
    };

    const { data: response } = await webApi.addToCart(params);

    if (!response?.data || response.status !== "success") {
      showAlert("error", "Failed!", "Can not add product. Please try again!");
      setIsLoading(false);
      return false;
    }

    document.body.dispatchEvent(
      new Event("wc_fragment_refresh", {
        bubbles: true,
      })
    );

    showAlert("success", "Success", response?.message, 2000);

    setTimeout(() => {
      window.location.reload();
      setIsLoading(false);
    }, 2000);
  };

  const onChangeDistance = (value) => {
    setIsCalcDistance(value);
  };

  useEffect(() => {
    if (selectedLocation && deliveryData && isCalcDistance) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedLocation, deliveryData, isCalcDistance]);

  useEffect(() => {
    if (selectedOutlet) {
      handleGetDeliveryConfig();
    }
  }, [selectedOutlet]);

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
            onChangeDistance={onChangeDistance}
            onChangeData={handleDeliveryData}
            selectedLocation={selectedLocation}
            isFetching={isFetching}
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
