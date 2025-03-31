import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const DateTimeInput = ({ onChange, minDate = "", type }) => {
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

  useEffect(() => {
    if (type == "end") {
      if (new Date(selectedDate) < new Date(minDate)) {
        handleChangeDate(null);
      }
    }
  }, [minDate]);

  return (
    <>
      <DatePicker
        width={"100%"}
        selected={selectedDate}
        onChange={(date) => handleChangeDate(date)}
        minDate={new Date(handleDate(minDate))}
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
