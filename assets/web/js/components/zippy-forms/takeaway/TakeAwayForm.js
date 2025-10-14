import { Box, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import FormHeading from "../FormHeading";
import OutletSelect from "../OutletSelect";
import theme from "../../../../theme/customTheme";
import { webApi } from "../../../api";
import { getSelectProductId } from "../../../helper/booking";
import { showAlert } from "../../../helper/showAlert";
import { useOutletProvider } from "../../../providers/OutletProvider";

const TakeAwayForm = ({ onChangeMode }) => {
  const [takeawayData, setTakeawayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDisabled, setIsDisabled] = useState(true);
  const { selectedOutlet, orderModeData, setOrderModeData } =
    useOutletProvider();
  const handletakeawayData = (data) => {
    setTakeawayData(data);
  };

  const handleGetTakeAwayConfig = async () => {
    setIsFetching(true);
    const params = {
      outlet_id: selectedOutlet.id,
      delivery_type: "takeaway",
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

  const handleConfirm = async () => {
    if (!takeawayData) {
      showAlert("error", "Failed!", "Please fill all required field!");
      return;
    }
    setIsLoading(true);

    const params = {
      product_id: getSelectProductId(),
      order_mode: "takeaway",
      outlet_id: takeawayData.outlet,
      time: takeawayData.time,
      date: takeawayData.date,
    };

    const { data: response } = await webApi.addToCart(params);

    if (!response || response.status !== "success") {
      showAlert("error", "Failed!", "Can not add product. Please try again!");
      setIsLoading(false);
      return false;
    }

    document.body.dispatchEvent(
      new Event("wc_fragment_refresh", {
        bubbles: true,
      })
    );

    showAlert("success", "Success", response.message, 2000);

    setTimeout(() => {
      window.location.reload();
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

  useEffect(() => {
    if (selectedOutlet) {
      handleGetTakeAwayConfig();
    }
  }, [selectedOutlet]);

  return (
    <Box>
      <Box>
        <FormHeading
          onBack={() => onChangeMode("select-method")}
          title={"Take Away Details"}
        />

        <Box p={2}>
          <Box>
            <OutletSelect
              type="takeaway"
              onChangeData={handletakeawayData}
              isFetching={isFetching}
            />
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
};

export default TakeAwayForm;
