import React from "react";
import { DateBoxedItem } from "../../../mui-styled";
import { Typography } from "@mui/material";

const DateBoxed = (props) => {
  const { date, selected, onClick, disabled: disabledProp } = props;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disableDates = ["2025-08-09", "2025-08-12", "2025-09-23"];

  const dateItem = date.toISOString().slice(0, 10);

  const disabled = disabledProp || disableDates.includes(dateItem);

  const dayOfWeek = date
    .toLocaleString("en-US", { weekday: "short" })
    .toUpperCase();
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();

  return (
    <DateBoxedItem
      selected={selected}
      disabled={disabled}
      onClick={!disabled ? () => onClick(date) : undefined}
      sx={{ padding: { xs: 1, md: 2 } }}
    >
      <Typography variant="body1" fontSize={{ xs: 10, md: 14 }}>
        {dayOfWeek}
      </Typography>
      <Typography
        variant="h4"
        fontSize={{ xs: 14, md: 20 }}
        my={{ xs: 1, md: 2 }}
      >
        {day}
      </Typography>
      <Typography variant="body1" fontSize={{ xs: 10, md: 14 }}>
        {month}
      </Typography>
    </DateBoxedItem>
  );
};

export default DateBoxed;
