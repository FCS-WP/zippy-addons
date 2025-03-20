import { Box, Button } from "@mui/material";
import React, { useState } from "react";
import FormHeading from "../FormHeading";
import OutletSelect from "../OutletSelect";
import theme from "../../../../theme/customTheme";
import { webApi } from "../../../api";
import { getSelectProductId } from "../../../helper/booking";
import { showAlert } from "../../../helper/showAlert";

const TakeAwayForm = ({ onChangeMode }) => {
  const [takeawayData, setTakeawayData] = useState(null);

  const handletakeawayData = (data) => {
    setTakeawayData(data);
  };

  const handleConfirm = async () => {
    if (!takeawayData) {
      Swal.fire({
        title: "Failed!",
        text: "Please fill all required field!",
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }
    const params = {
      product_id: getSelectProductId(),
      order_mode: "takeaway",
      outlet_id: takeawayData.outlet,
      time: takeawayData.time,
      date: takeawayData.date,
    };
    
    const response = await webApi.addToCart(params);

    if (!response?.data || response.data.status !== 'success') {
      showAlert('error', "Failed!", "Can not add product. Please try again!");
      return false;
    }

    showAlert('success', "Success", "Product added to cart.");
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  return (
    <Box>
      <Box>
        <FormHeading
          onBack={() => onChangeMode("select-method")}
          title={"Take Away Details"}
        />

        <Box p={2}>
          <Box>
            <OutletSelect type="takeaway" onChangeData={handletakeawayData} />
          </Box>
        </Box>

        <Box p={2}>
          <Button
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
