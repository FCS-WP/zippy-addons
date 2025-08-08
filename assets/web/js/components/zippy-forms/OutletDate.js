import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import {
  getDisabledDays,
  isCloseDate,
  isDisabledDate,
} from "../../helper/datetime";
import { format, setDate } from "date-fns";
import DateBoxed from "./dates/DateBoxed";
import DateCalendar from "./dates/DateCalendar";
import OutletContext from "../../contexts/OutletContext";

const dates = Array.from({ length: 5 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + (1 + i));
  return date;
});
const OutletDate = ({ onChangeDate, type }) => {
  /**
   * Mode: boxed - calendar
   */
  const [mode, setMode] = useState("boxed");
  const [selectedDate, setSelectedDate] = useState(null);
  const { customOutletSelected, menusConfig } = useContext(OutletContext);
  const [dateRange, setDateRange] = useState(dates);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    onChangeDate(date);
  };

  const changeDateMode = () => {
    const newMode = mode === "boxed" ? "calendar" : "boxed";
    setMode(newMode);
  };

  useEffect(() => {
    handleSelectDate(null);
    if (customOutletSelected.end_date && customOutletSelected.start_date) {
      const now = new Date();
      const nowformattedDate = now.toISOString().slice(0, 10);
      const startDate = new Date(customOutletSelected.start_date);

      if (customOutletSelected.start_date < nowformattedDate) {
        const startDateNew = new Date();
        const startDateformattedDate = now.toISOString().slice(0, 10);
        const newDateRange = Array.from({ length: 5 }, (_, i) => {
          const date = new Date(startDateformattedDate);
          date.setDate(date.getDate() + i);
          return date;
        });
        setDateRange(newDateRange);
      } else {
        const newDateRange = Array.from({ length: 5 }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          return date;
        });
        setDateRange(newDateRange);
      }
    }

  }, [customOutletSelected]);

  return (
    <Box>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
      >
        <Box>
          <h5>
            Select date: <span style={{ color: "red" }}>(*)</span>{" "}
            {selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
          </h5>
        </Box>
        <Button
          sx={{
            textWrap: "nowrap",
            textTransform: "capitalize",
            display: { xs: "none", md: "block" },
          }}
          onClick={changeDateMode}
        >
          {mode === "boxed" ? "More Date" : "Less date"}
        </Button>
      </Box>
      <Box textAlign={"end"} mb={1}>
        <Typography
          fontSize={12}
          color="#525252"
          sx={{
            textWrap: "nowrap",
            textTransform: "capitalize",
            display: { xs: "block", md: "none" },
            textDecoration: "underline",
          }}
          onClick={changeDateMode}
        >
          {mode === "boxed" ? "More Date" : "Less date"}
        </Typography>
      </Box>
      {mode == "boxed" ? (
        <Grid
          container
          justifyContent={"space-between"}
          spacing={{ xs: 1, sm: 2 }}
        >
          {dateRange?.map((date, index) => (
            <Grid key={index} size={2.4}>
              <DateBoxed
                date={date}
                selected={selectedDate?.toDateString() === date.toDateString()}
                onClick={handleSelectDate}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <div>
          <DateCalendar
            defaultDate={selectedDate}
            onSelectDate={handleSelectDate}
            customOutletSelected={customOutletSelected}
            // menusConfig={menusConfig}
            type={type}
          />
        </div>
      )}
    </Box>
  );
};

export default OutletDate;
