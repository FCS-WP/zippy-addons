import React, { useContext } from "react";
import OutletContext from "../../contexts/OutletContext";
import { Box, Button, Icon, styled, Typography } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

const CustomButton = styled(Button)(({ theme }) => ({
  padding: "16px",
  borderRadius: "50%",
  marginBottom: "10px",

  "&:hover": {
    backgroundColor: theme.palette.primary.main,
  },
  "&:hover > img": {
    filter: "brightness(3)",
  },
}));

const SelectCartType = () => {
  const { setCartType } = useContext(OutletContext);
  const onChangeCartType = (cartType) => {
    setCartType(cartType);
  };

  return (
    <Box>
      <Typography
        variant="h5"
        fontSize={20}
        fontWeight={600}
        textAlign={"center"}
      >
        Select Your Preference
      </Typography>
      <Box display={"flex"} m={4} justifyContent={"space-around"}>
        <Box textAlign={"center"}>
          <CustomButton
            className="method-icon"
            onClick={() => onChangeCartType("retail-store")}
          >
            <StoreIcon color="secondary" sx={{ ":hover": { color: "#fff" } }} />
          </CustomButton>
          <Typography
            textAlign={"center"}
            variant="h5"
            fontSize={16}
            fontWeight={700}
            className="method-title"
          >
            Retail Store
          </Typography>
        </Box>
        <Box textAlign={"center"}>
          <CustomButton
            className="method-icon"
            onClick={() => onChangeCartType("popup-reservation")}
          >
            <BookOnlineIcon
              color="secondary"
              sx={{ ":hover": { color: "#fff" } }}
            />
          </CustomButton>
          <Typography
            textAlign={"center"}
            variant="h5"
            fontSize={16}
            fontWeight={700}
            className="method-title"
          >
            Pop-up Reservation
          </Typography>
        </Box>
      </Box>
      <Button
        className="btn-close-lightbox"
        fullWidth
        sx={{
          background: "#f5e7e7",
          textTransform: "capitalize",
          color: "#000",
          padding: "0px",
          background: "none",
        }}
      >
        Continue Browsing
      </Button>
    </Box>
  );
};

export default SelectCartType;
