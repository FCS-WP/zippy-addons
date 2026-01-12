import { Box, Typography, Button, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import { deliveryIcon, takeawayIcon } from "../../images";
import { shippingRoleConfigAPI } from "../../../../admin/js/api/shipping-role-config";
import { webApi } from "../../api";

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
  const [userConfig, setUserConfig] = useState(null);

  const getShippingRoleConfigByUser = async () => {
    try {
      const { data } = await webApi.getShippingRoleConfigByUser();
      if (data?.status === "success" && data?.data) {
        setUserConfig(data.data);
        return data.data;
      }
    } catch (error) {
      console.error("Error fetching shipping role config by user:", error);
    }

    return null;
  };

  useEffect(() => {
    getShippingRoleConfigByUser();
  }, []);

  const shippingConfig = userConfig?.config ?? null;

  const showDelivery =
    !shippingConfig || Object.keys(shippingConfig).length === 0
      ? true
      : shippingConfig.delivery?.visible === true;

  const showTakeAway =
    !shippingConfig || Object.keys(shippingConfig).length === 0
      ? true
      : shippingConfig.take_away?.visible === true;

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
      <Box display="flex" m={4} justifyContent="space-around">
        {showDelivery && (
          <Box>
            <CustomButton onClick={() => onChangeMode("delivery")}>
              <img src={deliveryIcon} alt="delivery" />
            </CustomButton>
            <Typography textAlign="center" fontSize={16} fontWeight={700}>
              Delivery
            </Typography>
          </Box>
        )}

        {showTakeAway && (
          <Box>
            <CustomButton onClick={() => onChangeMode("takeaway")}>
              <img src={takeawayIcon} alt="takeaway" />
            </CustomButton>
            <Typography textAlign="center" fontSize={16} fontWeight={700}>
              Take Away
            </Typography>
          </Box>
        )}
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
