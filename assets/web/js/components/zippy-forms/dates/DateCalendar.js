import { Box } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import OutletContext from "../../../contexts/OutletContext";

const DateCalendar = ({ onSelectDate, defaultDate }) => {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const { customOutletSelected } = useContext(OutletContext);
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(null);

  const handleClick = (date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  useEffect(() => {
    if (customOutletSelected) {
      const now = new Date();
      const nowformattedDate = now.toISOString().slice(0, 10);
      const startDate = new Date(customOutletSelected.start_date);
      if (customOutletSelected.start_date < nowformattedDate) {
        setMinDate(nowformattedDate);
      } else {
        setMinDate(
          customOutletSelected.start_date
            ? new Date(customOutletSelected.start_date)
            : null
        );
      }

      setMaxDate(
        customOutletSelected.start_date
          ? new Date(customOutletSelected.end_date)
          : null
      );
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
      />
    </Box>
  );
};

export default DateCalendar;
