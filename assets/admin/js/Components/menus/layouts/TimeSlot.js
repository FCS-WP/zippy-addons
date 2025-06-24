import { Grid2, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import TimeInput from "../inputs/TimeInput";
import DeleteIcon from "@mui/icons-material/Delete";
import { createDateWithHourStr } from "../../../utils/dateHelper";

const TimeSlot = (props) => {
  const { startDate, endDate, index, handleChangeTime, handleDeleteHappyHour } =
    props;
  const [startValue, setStartValue] = useState(startDate ?? null);
  const [endValue, setEndValue] = useState(endDate ?? null);
  const [minDate, setMinDate] = useState(startDate ?? null);

  const validateTimeRange = (start, end) => {
    if (!start || !end) return false;
    try {
      const startDate = createDateWithHourStr(start);
      const endDate = createDateWithHourStr(end);
      return (
        isDateValid(startDate) && isDateValid(endDate) && endDate > startDate
      );
    } catch {
      return false;
    }
  };
  
  const checkEndTime = (date) => {
    if (endValue <= date) {
      setEndValue(null);
    }
  } 

  const onChangeTime = (date, key) => {
    switch (key) {
      case "start":
        handleChangeTime(date, "start", index);
        setStartValue(date);
        setMinDate(date);
        checkEndTime(date);
        break;

      case "end":
        handleChangeTime(date, "end", index);
        setEndValue(date);
        break;
      
      default:
        break;
    }
  };

  return (
    <>
      <Grid2 container spacing={2} mt={1} align="center">
        <Grid2>
          <TimeInput
            label="Start Time"
            value={startValue}
            onChange={(val) => onChangeTime(val, "start")}
            error={!startValue}
          />
        </Grid2>
        <Grid2>
          <TimeInput
            label="End Time"
            value={endValue}
            onChange={(val) => onChangeTime(val, "end")}
            error={!validateTimeRange(startDate, endValue)}
            minDate={minDate}
          />
        </Grid2>
        <Grid2>
          <IconButton onClick={() => handleDeleteHappyHour(index)}>
            <DeleteIcon />
          </IconButton>
        </Grid2>
      </Grid2>
    </>
  );
};

export default TimeSlot;
