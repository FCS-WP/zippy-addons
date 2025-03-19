import { Box, Typography, Button, styled } from "@mui/material";
import React, { useEffect } from "react";
import { deliveryIcon, takeawayIcon } from "../../images";

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

const SelectMethod = ({ onChangeMode }) => {
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
        <Box>
          <CustomButton onClick={() => onChangeMode("delivery")}>
            <img src={deliveryIcon} alt="delivery" />
          </CustomButton>
          <Typography
            textAlign={"center"}
            variant="h6"
            fontSize={16}
            fontWeight={700}
          >
            Delivery
          </Typography>
        </Box>

        <Box>
          <CustomButton onClick={() => onChangeMode("takeaway")}>
            <img src={takeawayIcon} alt="takeaway" />
          </CustomButton>
          <Typography
            textAlign={"center"}
            variant="h6"
            fontSize={16}
            fontWeight={700}
          >
            Take Away
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
        }}
      >
        Continue Browsing
      </Button>
    </Box>
  );
};

export default SelectMethod;
