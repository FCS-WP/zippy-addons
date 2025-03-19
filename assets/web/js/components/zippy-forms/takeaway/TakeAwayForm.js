import { Box, Button } from "@mui/material";
import React, { useState } from "react";
import FormHeading from "../FormHeading";
import OutletSelect from "../OutletSelect";
import { toast } from "react-toastify";
import theme from "../../../../theme/customTheme";
import { webApi } from "../../../api";

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
    const data = {
      product_id: getSelectProductId(),
      order_mode: "takeaway",
      outlet_id: takeawayData.outlet.id,
      delivery_time: takeawayData.time,
    };
    /**
     * Todo list:
     * 1. Handle Submit Data
     * 2. Send message
     */
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
