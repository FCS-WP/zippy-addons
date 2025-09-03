import { Box, Typography } from "@mui/material";
import React from "react";
import DatePicker from "react-datepicker";
import { useOrderProvider } from "../../providers/OrderProvider";
import { formatDate } from "date-fns";
import { isDisabledDate } from "../../utils/dateHelper";

const ShippingDate = () => {
  const {
    selectedDate,
    updateState,
    orderModeData,
    selectedMode,
    holidayConfig,
  } = useOrderProvider();

  const handleSelectDate = (date) => {
    updateState({ selectedDate: date });
  };
  
  return (
    <Box className="date-box">
      {orderModeData ? (
        <DatePicker
          minDate={new Date()}
          selected={selectedDate}
          onChange={(date) => handleSelectDate(date)}
          filterDate={(date) =>
            !isDisabledDate(
              date,
              orderModeData,
              null,
              selectedMode,
              holidayConfig,
              null
            )
          }
          inline
        />
      ) : (
        <Typography fontSize={14}>Please select outlet to continue</Typography>
      )}
    </Box>
  );
};

export default ShippingDate;
