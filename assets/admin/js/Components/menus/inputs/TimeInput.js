import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const TimeInput = (props) => {
  const { onChange, value, minDate, maxDate } = props;
  const [selectedTime, setSelectedTime] = useState(null);

  const handleChangeTime = (date) => {
    setSelectedTime(date);
    onChange(date);
  };

  useEffect(() => {
    if (value) {
      setSelectedTime(new Date(value));
    } else {
      setSelectedTime(null);
    }
  }, [value]);

  useEffect(() => {
    checkMinDate();
  }, [minDate]);

  const handleFilterTime = (time) => {
    if (!minDate) return true; // if no minDate → allow all times
    const minTime = new Date(minDate).getTime();
    return time.getTime() >= minTime;
  };

  const checkMinDate = () => {
    if (!value || !minDate) {
      return;
    }

    const getMinDate = new Date(minDate);
    const getCurrentDate = new Date(value);
    if (getCurrentDate < getMinDate) {
      handleChangeTime(null);
    }
  };

  return (
    <>
      <DatePicker
        selected={selectedTime ?? null}
        onChange={(date) => handleChangeTime(date)}
        showTimeSelect
        showTimeSelectOnly
        dateFormat="h:mm aa"
        timeCaption="Time"
        // minDate={minDate ?? null}
        filterTime={handleFilterTime}
        // maxDate={maxDate ?? null}
        autoComplete="off"
        da
        customInput={
          <TextField
            size="small"
            fullWidth
            sx={{ width: "100%" }}
            autoComplete="off"
            color="success"
            placeholder="Select time"
          />
        }
      />
    </>
  );
};

export default TimeInput;
