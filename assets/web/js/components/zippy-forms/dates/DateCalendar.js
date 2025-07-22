import { Box } from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import {
  getDisabledDays,
  isCloseDate,
  isDisabledDate,
} from "../../../helper/datetime";

const DateCalendar = ({
  onSelectDate,
  defaultDate,
  menusConfig,
  selectedOutlet,
  type,
}) => {
  const closedDays = getDisabledDays(selectedOutlet, type);
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const handleClick = (date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  const minDate = new Date("06/19/2025");
  const maxDate = new Date("07/07/2025");

  return (
    <Box className="date-box">
      <DatePicker
        minDate={minDate}
        maxDate={maxDate}
        selected={selectedDate}
        onChange={handleClick}
        filterDate={(date) =>
          !isDisabledDate(date, selectedOutlet, menusConfig, type)
        }
        inline
      />
    </Box>
  );
};

export default DateCalendar;
