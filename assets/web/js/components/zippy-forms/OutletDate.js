import {
  Box,
  Button,
  Grid2 as Grid,
  Paper,
  styled,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { isWeekend } from "../../helper/datetime";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

const Item = styled(Paper)(({ theme, selected, disabled }) => ({
  backgroundColor: disabled
    ? "#E0E0E0"
    : selected
    ? theme.palette.primary.main
    : theme.palette.white.main,
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: selected ? theme.palette.white.main : theme.palette.text.secondary,
  transition: "background-color 0.3s ease",
  cursor: disabled ? "not-allowed" : "pointer",
  "&:hover": {
    backgroundColor: disabled
      ? "#E0E0E0"
      : selected
      ? theme.palette.primary.main
      : theme.palette.mode === "dark"
      ? "#2C3740"
      : "#f0f0f0",
  },
}));

const DateBoxed = ({ date, selected, onClick, disabled }) => {
  const dayOfWeek = date
    .toLocaleString("en-US", { weekday: "short" })
    .toUpperCase();
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();

  return (
    <Item
      selected={selected}
      disabled={disabled}
      onClick={!disabled ? () => onClick(date) : undefined}
    >
      <Typography variant="body1" fontSize={14}>
        {dayOfWeek}
      </Typography>
      <Typography variant="h4" fontSize={20} my={2}>
        {day}
      </Typography>
      <Typography variant="body1" fontSize={14}>
        {month}
      </Typography>
    </Item>
  );
};

const dates = Array.from({ length: 5 }, (_, i) => {
  const date = new Date("2025/03/20");
  date.setDate(date.getDate() + i);
  return date;
});

const DateCalendar = ({ onSelectDate, defaultDate }) => {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const handleClick = (date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  return (
    <Box className="date-box">
      <DatePicker
        minDate={new Date()}
        selected={selectedDate}
        onChange={(date) => handleClick(date)}
        filterDate={(date) => !isWeekend(date)}
        inline
      />
    </Box>
  );
};

const OutletDate = ({ onChangeDate }) => {
  /**
   * Mode: boxed - calendar
   */
  const [mode, setMode] = useState("boxed");
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    onChangeDate(date);
  };

  const changeDateMode = () => {
    const newMode = mode === "boxed" ? "calendar" : "boxed";
    setMode(newMode);
  };

  return (
    <Box>
      <Box display={"flex"} justifyContent={"space-between"} mb={1}>
        <h5>
          Select date: {selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
        </h5>
        <Button
          sx={{ textWrap: "nowrap", textTransform: "capitalize" }}
          onClick={changeDateMode}
        >
          {mode === "boxed" ? "More Date" : "Less date"}
        </Button>
      </Box>
      {mode == "boxed" ? (
        <Grid container justifyContent={"space-between"}>
          {dates.map((date, index) => (
            <Grid key={index} width="18%">
              <DateBoxed
                date={date}
                selected={selectedDate?.toDateString() === date.toDateString()}
                onClick={handleSelectDate}
                disabled={isWeekend(date)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <div>
          <DateCalendar
            defaultDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>
      )}
    </Box>
  );
};

export default OutletDate;
