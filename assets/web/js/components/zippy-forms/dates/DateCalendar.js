import { Box } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import OutletContext from "../../../contexts/OutletContext";

const DateCalendar = ({ onSelectDate, defaultDate }) => {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const { customOutletSelected } = useContext(OutletContext);
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(null);
  const [disabledRanges, setDisabledRanges] = useState([]);

  const handleClick = (date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  useEffect(() => {
    if (customOutletSelected) {
      const now = new Date();
      const nowFormatted = now.toISOString().slice(0, 10);

      // Setup minDate
      if (customOutletSelected.start_date < nowFormatted) {
        setMinDate(now);
      } else {
        setMinDate(
          customOutletSelected.start_date
            ? new Date(customOutletSelected.start_date)
            : null
        );
      }

      // Setup maxDate
      setMaxDate(
        customOutletSelected.end_date
          ? new Date(customOutletSelected.end_date)
          : null
      );

      if (
        customOutletSelected.disable_start &&
        customOutletSelected.disable_end
      ) {
        setDisabledRanges([
          {
            start: new Date(customOutletSelected.disable_start),
            end: new Date(customOutletSelected.disable_end),
          },
        ]);
      }
    }
  }, [customOutletSelected]);

  return (
    <Box className="date-box">
      <DatePicker
        minDate={minDate}
        maxDate={maxDate}
        selected={selectedDate}
        onChange={handleClick}
        inline
        excludeDateIntervals={disabledRanges}
      />
    </Box>
  );
};

export default DateCalendar;
