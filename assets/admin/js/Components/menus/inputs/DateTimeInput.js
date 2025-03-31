import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const DateTimeInput = ({ onChange, data, type }) => {
  const [selectedDate, setSelectedDate] = useState();
  const handleChangeDate = (date) => {
    setSelectedDate(date);
    onChange(date, data.id, type);
  }

  return (
    <>
      <DatePicker
        width={"100%"}
        selected={selectedDate}
        onChange={(date)=> handleChangeDate(date)}
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
