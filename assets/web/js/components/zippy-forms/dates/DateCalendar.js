import { Box } from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { getDisabledDays, isCloseDate, isDisabledDate } from "../../../helper/datetime";

const DateCalendar = ({ onSelectDate, defaultDate, menusConfig, selectedOutlet, type }) => {
  const closedDays = getDisabledDays(selectedOutlet, type);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const handleClick = (date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };
  let minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  let maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  return (
    <Box className="date-box">
      <DatePicker
        minDate={minDate}
        maxDate={maxDate}
        selected={selectedDate}
        onChange={(date) => handleClick(date)}
        filterDate={(date) =>
          !isDisabledDate(date, selectedOutlet, menusConfig, type)
        }
        inline
      />
    </Box>
  );
};
export default DateCalendar;
