import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
const BookingDatePicker = ({ handleSelectDate , config }) => {

  const [selectedDate, setSelectedDate] = useState();
  
  // Parse working time configuration
  const workingTime = config.store_working_time;

  // Get valid days of the week
  const allowedDays = workingTime
    .filter((day) => day.is_open == 'T')
    .map((day) => parseInt(day.weekday));
    
  const isDayDisabled = (date) => {
    const dayOfWeek = date.getDay();
    return !allowedDays.includes(dayOfWeek);
  };

  const dateOnchange = (date) => {
    setSelectedDate(date);
    handleSelectDate(date);
  };

  return (
    <div>
      <h4>Choose Booking Date and Time</h4>
      <DatePicker
        minDate={new Date()}
        selected={selectedDate}
        onChange={(date) => dateOnchange(date)}
        filterDate={(date) => !isDayDisabled(date)}
        inline
      />
    </div>
  );
};

export default BookingDatePicker;
