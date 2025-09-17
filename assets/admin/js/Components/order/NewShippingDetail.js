import {
  Box,
  FormControl,
  Grid2,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useOrderProvider } from "../../providers/OrderProvider";
import StoreIcon from "@mui/icons-material/Store";
import LocationSearch from "../../../../web/js/components/zippy-forms/LocationSearch";
import ShippingDate from "./ShippingDate";
import ShippingTime from "./ShippingTime";

const CustomSelect = styled(Select)({
  padding: "5px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ccc",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ec7265",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline, &.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#ccc",
      borderWidth: "1px",
    },
});

const NewShippingDetail = () => {
  const {
    outlets,
    selectedOutlet,
    updateState,
    selectedMode,
    deliveryDistance,
  } = useOrderProvider();

  const handleChangeOutlet = (e) => {
    console.log(e.target.value);
    updateState({ selectedOutlet: e.target.value });
  };

  const formatMetersToKm = (meters) => {
    const value = parseFloat(meters);
    if (isNaN(value)) return "Invalid input";

    return value >= 1000 ? (value / 1000).toFixed(2) + " km" : value + " m";
  };

  const handleSelectLocation = (location) => {
    updateState({ selectedLocation: location });
  };

  const handleSelectMode = (e) => {
    updateState({ selectedMode: e.target.value });
  };

  useEffect(() => {
    if (outlets.length > 0){
      updateState({ selectedOutlet: outlets[0] });
    } 
  }, [outlets, deliveryDistance]);

  return (
    <Box className="testing" width={"100%"}>
      <h3>Shipping Details</h3>
      <Grid2 width={"100%"} container spacing={2} alignItems={"center"} my={3}>
        <Grid2 size={12}>
          <Typography fontWeight={600} fontSize={12}>
            Shipping Method:
          </Typography>
        </Grid2>
        <Grid2 size={12}>
          <FormControl fullWidth>
            <Select
              id="custom-shipping-method"
              value={selectedMode}
              size="small"
              onChange={(e) => handleSelectMode(e)}
            >
              <MenuItem value={"takeaway"}>Takeaway</MenuItem>
              <MenuItem value={"delivery"}>Delivery</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
      </Grid2>

      {selectedMode == "delivery" && (
        <Grid2 container spacing={2} alignItems={"center"} mb={3}>
          <Grid2 size={12}>
            <Typography fontWeight={600} fontSize={12}>
              Delivery To:
            </Typography>
          </Grid2>
          <Grid2 size={12}>
            <LocationSearch onSelectLocation={handleSelectLocation} />
          </Grid2>
        </Grid2>
      )}

      <Grid2 container spacing={2} alignItems={"center"} mb={3}>
        <Grid2 size={12}>
          <Typography fontWeight={600} fontSize={12}>
            Outlet:
          </Typography>
        </Grid2>
        <Grid2 size={12}>
          <CustomSelect
            sx={{ mb: 1 }}
            fullWidth
            variant="outlined"
            id="outlet-id"
            size="small"
            value={selectedOutlet ?? ""}
            onChange={handleChangeOutlet}
            displayEmpty
            startAdornment={
              <InputAdornment position="start" sx={{ paddingLeft: "11px" }}>
                <StoreIcon sx={{ color: "#ec7265" }} />
              </InputAdornment>
            }
          >
            <MenuItem value={""} disabled>
              <Typography sx={{ textWrap: "wrap" }} color="#ccc" fontSize={12}>
                SELECT AN OUTLET
              </Typography>
            </MenuItem>
            {/* Multi outlets */}
            {outlets.length > 0 &&
              outlets.map((outlet, index) => (
                <MenuItem key={index} value={outlet}>
                  <Typography sx={{ textWrap: "wrap" }} fontSize={12}>
                    {outlet.outlet_address.address}
                  </Typography>
                </MenuItem>
              ))}
          </CustomSelect>

          {deliveryDistance && (
            <Typography fontWeight={600} fontSize={13}>
              Distance: {formatMetersToKm(deliveryDistance)}
            </Typography>
          )}
        </Grid2>
      </Grid2>

      {/* Outlet DateTime */}
      <Grid2 container spacing={2} alignItems={"center"} mb={3}>
        <Grid2 size={12}>
          {selectedMode == "takeaway" && (
            <Typography fontWeight={600} fontSize={12}>
              Takeaway Date:
            </Typography>
          )}
          {selectedMode == "delivery" && (
            <Typography fontWeight={600} fontSize={12}>
              Delivery Date:
            </Typography>
          )}
        </Grid2>
        <Grid2 size={12}>
          <ShippingDate />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2} alignItems={"center"} mb={3}>
        <Grid2 size={12}>
          {selectedMode == "takeaway" && (
            <Typography fontWeight={600} fontSize={12}>
              Takeaway Time:
            </Typography>
          )}
          {selectedMode == "delivery" && (
            <Typography fontWeight={600} fontSize={12}>
              Delivery Time:
            </Typography>
          )}
        </Grid2>
        <Grid2 size={12}>
          <ShippingTime type={selectedMode} />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default NewShippingDetail;
