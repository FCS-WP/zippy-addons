import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getActiveMenuByDate, isDisabledDate } from "../../helper/datetime";
import { format } from "date-fns";
import DateBoxed from "./dates/DateBoxed";
import DateCalendar from "./dates/DateCalendar";
import { useOutletProvider } from "../../providers/OutletProvider";

const OutletDate = ({ onChangeDate, type }) => {
  /**
   * Mode: boxed - calendar
   */
  const [mode, setMode] = useState("boxed");
  const [selectedDate, setSelectedDate] = useState(null);
  const {
    selectedOutlet,
    menusConfig,
    orderModeData,
    holidayConfig,
    periodWindow,
  } = useOutletProvider();

  const currentMenu = getActiveMenuByDate(new Date(), menusConfig);
  const [boxDates, setBoxDates] = useState([]);
  const [periodGapDays, setPeriodGapDays] = useState(0);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    onChangeDate(date);
  };

  const changeDateMode = () => {
    const newMode = mode === "boxed" ? "calendar" : "boxed";
    setMode(newMode);
  };

  const handleGetBoxDates = (gapDate) => {
    const checkDates = Array.from({ length: gapDate }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date;
    });

    const newGapDate = handlePeriodDate(gapDate, checkDates);

    const dates = Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + (newGapDate + i));
      return date;
    });

    setBoxDates(dates);
  };

  const handlePeriodDate = (gapDate, dates) => {
    let holidays = [];
    let disabledWeekDays = [];
    let periodCounter = 0;

    orderModeData?.time.map((timeItem) => {
      if (timeItem.is_active !== "T" || timeItem.time_slot.length < 1) {
        disabledWeekDays.push(parseInt(timeItem.week_day));
      }
    });

    holidayConfig.map((holiday) => {
      const date = new Date(holiday.date);
      let holidayCondition1 =
        type == "takeaway" && holiday.is_active_take_away == "F";
      let holidayCondition2 =
        type == "delivery" && holiday.is_active_delivery == "F";

      if (holidayCondition1 || holidayCondition2) {
        holidays.push(format(date, "yyyy-MM-dd"));
      }
    });

    let startDate = new Date();
    let loopIndex = 0;

    while (periodCounter < gapDate) {
      if (
        !holidays.includes(format(startDate, "yyyy-MM-dd")) &&
        !disabledWeekDays.includes(startDate.getDay())
      ) {
        periodCounter++;
      } 

      startDate.setDate(startDate.getDate() + 1);
      loopIndex++;
    }
    
    setPeriodGapDays(loopIndex);
    return loopIndex;
  };

  useEffect(() => {
    handleGetBoxDates(periodWindow);
  }, [periodWindow]);

  useEffect(() => {
    handleSelectDate(null);
  }, [selectedOutlet]);

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
          {boxDates.length > 0 &&
            boxDates.map((date, index) => (
              <Grid key={index} size={2.4}>
                <DateBoxed
                  date={date}
                  selected={
                    selectedDate?.toDateString() === date.toDateString()
                  }
                  onClick={handleSelectDate}
                  disabled={isDisabledDate(
                    date,
                    orderModeData,
                    currentMenu,
                    type,
                    holidayConfig,
                    menusConfig
                  )}
                />
              </Grid>
            ))}
        </Grid>
      ) : (
        <div>
          <DateCalendar
            defaultDate={selectedDate}
            onSelectDate={handleSelectDate}
            selectedOutlet={selectedOutlet}
            currentMenu={currentMenu}
            periodGapDays={periodGapDays}
            type={type}
          />
        </div>
      )}
    </Box>
  );
};

export default OutletDate;
