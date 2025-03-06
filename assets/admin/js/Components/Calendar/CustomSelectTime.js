import { TextField } from "@mui/material";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const CustomSelectTime = ({ duration, onChangeTime, type, timeSlots = [], bookingConfig }) => {
  const [time, setTime] = useState(null);

  const handleTimeChange = (date) => {
    setTime(date);
    onChangeTime(date, type)
  };

  const isTimeInSlot = (time, slot, type) => {
    const compareTime = new Date(`${time}`);
    const dateString = format(new Date(time), "HH:mm:ss");
    let flag = false;
    switch (type) {
      case "from":
        if (slot.start == dateString) {
          flag = true;
        }
        break;
      case "to":
        if (slot.end == dateString) {
          flag = true;
        }
        break;
      default:
        break;
    }

    return flag;
  }

  const isTimeDisabled = (time) => {
    if (bookingConfig?.booking_type == 'single') {
      const isValidTime = timeSlots.find(slot=>isTimeInSlot(time, slot, type));
      if (!isValidTime || isValidTime.isDisabled) {
        return false;
      }
    }
    return true;
  };

  return (
    <DatePicker
      width={"100%"}
      selected={time}
      onChange={handleTimeChange}
      showTimeSelect
      showTimeSelectOnly
      filterTime={isTimeDisabled}
      timeCaption="Time"
      dateFormat="HH:mm"
      timeIntervals={duration}
      isClearable
      placeholderText="Pick a time"
      customInput={
        <TextField
          label="Select Time"
          fullWidth
          sx={{ width: "100%" }}
          color="success"
        />
      }
    />
  );
};

export default CustomSelectTime;
