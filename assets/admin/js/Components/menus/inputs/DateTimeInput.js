import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { isInDisabledRange } from "../../../utils/dateHelper";

const DateTimeInput = (props) => {
  const { onChange, disabledRanges = [], minDate = "", value, type } = props;
  const [selectedDate, setSelectedDate] = useState();

  const handleChangeDate = (date) => {
    setSelectedDate(date);
    onChange(date, type);
  };

  const handleDate = (val) => {
    const result =
      val === "0000-00-00" || val == "" ? new Date() : new Date(val);
    return result;
  };

  let maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  useEffect(() => {
    if (type == "end") {
      if (new Date(selectedDate) < new Date(minDate)) {
        handleChangeDate(null);
      }
    }
  }, [minDate]);

  useEffect(() => {
    if (value && value != "0000-00-00") {
      setSelectedDate(value);
    }
  }, []);

  return (
    <>
      <DatePicker
        width={"100%"}
        selected={selectedDate}
        onChange={(date) => handleChangeDate(date)}
        minDate={new Date(handleDate(minDate))}
        maxDate={maxDate}
        filterDate={(date) => !isInDisabledRange(date, disabledRanges)}
        customInput={
          <TextField
            size="small"
            label="Select Date"
            fullWidth
            sx={{ width: "100%" }}
            autoComplete="off"
            color="success"
          />
        }
        dateFormat="MMMM d, yyyy"
        isClearable
        autoComplete="off"
      />
    </>
  );
};

export default DateTimeInput;
