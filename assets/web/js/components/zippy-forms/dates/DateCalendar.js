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
  const [disableDates, setDisableDates] = useState([]);
  const [disabledWeekdays, setDisabledWeekdays] = useState([]);

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

    // Disable day off
    setDisableDates(
      customOutletSelected?.closed_dates?.map((d) => new Date(d.value)) || []
    );

    // Disable weekdays based on operating_hours that does not support delivery time
    if (customOutletSelected?.operating_hours?.length > 0) {
      const deliveryDays = customOutletSelected.operating_hours
        .filter((oh) => oh.delivery?.enabled === "T")
        .map((oh) => parseInt(oh.week_day, 10));

      const allWeekdays = [0, 1, 2, 3, 4, 5, 6];
      const disabled = allWeekdays.filter((d) => !deliveryDays.includes(d));

      setDisabledWeekdays(disabled);
    } else {
      setDisabledWeekdays([0, 1, 2, 3, 4, 5, 6]);
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
        excludeDates={disableDates}
        filterDate={(date) => {
          const day = date.getDay();
          return !disabledWeekdays.includes(day);
        }}
      />
    </Box>
  );
};

export default DateCalendar;
