import { Box } from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { isDisabledDate } from "../../../helper/datetime";
import { useOutletProvider } from "../../../providers/OutletProvider";

const DateCalendar = (props) => {
  const {
    onSelectDate,
    defaultDate,
    currentMenu,
    periodGapDays,
    selectedOutlet,
    type,
  } = props;
  const { orderModeData, holidayConfig, menusConfig, periodWindow } =
    useOutletProvider();
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const handleClick = (date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  let minDate = new Date();
  minDate.setDate(minDate.getDate() + periodGapDays);

  let maxDate = currentMenu ? new Date(currentMenu.end_date) : new Date();
  let day_limited = parseInt(orderModeData?.day_limited) || 30;
  currentMenu ? null : maxDate.setDate(maxDate.getDate() + day_limited - 1);

  return (
    <Box className="date-box">
      <DatePicker
        minDate={minDate}
        maxDate={maxDate}
        selected={selectedDate}
        onChange={(date) => handleClick(date)}
        filterDate={(date) =>
          !isDisabledDate(
            date,
            orderModeData,
            currentMenu,
            type,
            holidayConfig,
            menusConfig
          )
        }
        inline
      />
    </Box>
  );
};
export default DateCalendar;
