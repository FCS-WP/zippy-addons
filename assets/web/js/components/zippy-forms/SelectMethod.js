import { Box, Typography, Button, styled } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { deliveryIcon, takeawayIcon } from "../../images";
import OutletContext from "../../contexts/OutletContext";
import SelectCartType from "./SelectCartType";
import { SHOP_TYPE } from "../../consts/consts";

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
  const { cartType } = useContext(OutletContext);

  return (
    <Box>
      {!!cartType ? (
        <>
          <Typography
            variant="h5"
            fontSize={20}
            fontWeight={600}
            textAlign={"center"}
          >
            Select Your Preference
          </Typography>
          <Box display={"flex"} m={4} justifyContent={"space-around"}>
            {cartType === SHOP_TYPE.RETAIL && (
              <Box>
                <CustomButton
                  className="method-icon"
                  onClick={() => onChangeMode("delivery")}
                >
                  <img src={deliveryIcon} alt="delivery" />
                </CustomButton>
                <Typography
                  textAlign={"center"}
                  variant="h5"
                  fontSize={16}
                  fontWeight={700}
                  className="method-title"
                >
                  Delivery
                </Typography>
              </Box>
            )}

            <Box>
              <CustomButton
                className="method-icon"
                onClick={() => onChangeMode("takeaway")}
              >
                <img src={takeawayIcon} alt="takeaway" />
              </CustomButton>
              <Typography
                textAlign={"center"}
                variant="h5"
                fontSize={16}
                fontWeight={700}
                className="method-title"
              >
                Pick Up
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
        </>
      ) : (
        <SelectCartType />
      )}
    </Box>
  );
};

export default SelectMethod;
