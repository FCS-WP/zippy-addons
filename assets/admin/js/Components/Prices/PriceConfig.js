import React, { useState } from "react";
import { SearchContainer, StyledPaper } from "../mui-custom-styles";
import {
  Button,
  Grid2,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SyncIcon from "@mui/icons-material/Sync";
import { Api } from "../../api";
import { toast } from "react-toastify";

const PriceConfig = () => {
  const [retailPrice, setRetailPrice] = useState(
    window.admin_data?.retail_price ?? 0
  );
  const [popupPrice, setPopupPrice] = useState(
    window.admin_data?.popup_price ?? 0
  );
  const [reservationFee, setReservationFee] = useState(
    window.admin_data?.reservation_fee ?? 0
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePrices = async () => {
    setIsLoading(true);
    const params = {
      retail_price: retailPrice,
      popup_price: popupPrice,
      reservation_fee: reservationFee,
    };

    const { data: response } = await Api.updateProductPrices(params);
    if (!response || response.data.status != "success") {
      toast.error("Update failed!");
      setIsLoading(false);
      return;
    }
    toast.success("Update successfully!");
    setIsLoading(false);
    return;
  };

  return (
    <StyledPaper>
      <Grid2
        container
        width={{ xs: "100%", md: "50%" }}
        alignItems={"center"}
        spacing={2}
      >
        <Grid2 size={{ xs: 12 }} mb={2}>
          <Typography variant="h6" mb={2}>
            Retail Price
          </Typography>
          <SearchContainer>
            <TextField
              autoComplete="off"
              fullWidth
              label="Enter retail price"
              type="number"
              variant="outlined"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </SearchContainer>
        </Grid2>
        <Grid2 size={{ xs: 12 }} mb={3}>
          <Typography variant="h6" mb={2}>
            Popup Prices
          </Typography>
          <SearchContainer>
            <TextField
              autoComplete="off"
              fullWidth
              label="Enter popup price"
              type="number"
              variant="outlined"
              value={popupPrice}
              onChange={(e) => setPopupPrice(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </SearchContainer>
        </Grid2>
        <Grid2 size={{ xs: 12 }} mb={3}>
          <Typography variant="h6" mb={2}>
            Reservation Fee/Item
          </Typography>
          <SearchContainer>
            <TextField
              autoComplete="off"
              fullWidth
              label="Enter popup price"
              type="number"
              variant="outlined"
              value={reservationFee}
              onChange={(e) => setReservationFee(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </SearchContainer>
        </Grid2>
        <Grid2
          display={"flex"}
          size={3}
          textAlign={"end"}
          alignItems={"center"}
          gap={1}
        >
          <Button
            className="btn-hover-float"
            sx={{ fontSize: "12px" }}
            onClick={handleUpdatePrices}
            variant="contained"
            disabled={isLoading}
            startIcon={<SyncIcon />}
          >
            Update
          </Button>
        </Grid2>
      </Grid2>
    </StyledPaper>
  );
};

export default PriceConfig;
