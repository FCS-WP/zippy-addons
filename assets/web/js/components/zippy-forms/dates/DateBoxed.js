import React, { useContext } from "react";
import { DateBoxedItem } from "../../../mui-styled";
import { Typography } from "@mui/material";
import OutletContext from "../../../contexts/OutletContext";

const DateBoxed = (props) => {
  const { date, selected, onClick, disabled: disabledProp } = props;
  const { customOutletSelected } = useContext(OutletContext);

  const disableDates =
    customOutletSelected?.closed_dates?.map((d) => d.value) || [];

  const dateItem = date.toISOString().slice(0, 10);
  const weekDay = date.getDay();

  const outletDayConfig = customOutletSelected?.operating_hours?.find(
    (o) => parseInt(o.week_day, 10) === weekDay
  );

  const disabled =
    disabledProp ||
    disableDates.includes(dateItem) ||
    !outletDayConfig ||
    outletDayConfig.delivery.enabled === "F" ||
    outletDayConfig.delivery.delivery_hours.length === 0;

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
