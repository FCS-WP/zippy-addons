import { Box, Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import FormHeading from "../FormHeading";
import OutletSelect from "../OutletSelect";
import theme from "../../../../theme/customTheme";
import { webApi } from "../../../api";
import { getSelectProductId } from "../../../helper/booking";
import { showAlert } from "../../../helper/showAlert";
import OutletContext from "../../../contexts/OutletContext";

const TakeAwayForm = ({ onChangeMode, isEnableDelivery }) => {
  const [takeawayData, setTakeawayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const { cartType } = useContext(OutletContext);

  const handletakeawayData = (data) => {
    setTakeawayData(data);
  };

  const handleConfirm = async () => {
    if (!takeawayData) {
      showAlert("error", "Failed!", "Please fill all required field!");
      return;
    }
    setIsLoading(true);

    const params = {
      product_id: getSelectProductId()[0],
      quantity: getSelectProductId()[1],
      order_mode: "takeaway",
      current_cart: cartType,
      outlet_name: takeawayData.outlet.outlet_name,
      time: takeawayData.time,
      date: takeawayData.date,
      outlet_id: takeawayData.outlet.id,
    };

    const response = await webApi.addToCart(params);

    if (!response?.data || response.data.status !== "success") {
      showAlert("error", "Failed!", "Can not add product. Please try again!");
      setIsLoading(false);
      return false;
    }

    showAlert("success", "Success", "Product added to cart.", 2000);

    setTimeout(() => {
      document.body.dispatchEvent(
        new Event("wc_fragment_refresh", { bubbles: true })
      );
      window.location.reload(true);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (takeawayData) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [takeawayData]);

  return (
    <Box>
      <Box>
        <FormHeading
          onBack={() => onChangeMode("select-method")}
          title={"Pickup Details"}
        />

        <Box p={2}>
          <Box>
            <OutletSelect type="takeaway" onChangeData={handletakeawayData} />
          </Box>
        </Box>

        <Box p={2}>
          <Button
            disabled={isDisabled}
            loading={isLoading}
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
    </Box>
  );
  s;
};

export default TakeAwayForm;
