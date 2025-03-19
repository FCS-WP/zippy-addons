import React from "react";
import DatePicker from "react-datepicker";
import { Box } from "@mui/material";

// Custom TimePicker component
const TimePicker = (props) => {
  const {
    selectedTime,
    onChange,
    duration = 15,
    width,
    placeholderText = "Pick a time",
  } = props;

  return (
    <Box sx={{ width }}>
      <DatePicker
        selected={selectedTime}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly
        timeCaption="Time"
        dateFormat="HH:mm"
        timeIntervals={duration}
        isClearable
        placeholderText={placeholderText}
      />
    </Box>
  );
};

export default TimePicker;
