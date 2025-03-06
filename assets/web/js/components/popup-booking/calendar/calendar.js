import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

function Calendar({ onDateSelect , configs}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateSelect(date); 
  };

  const closedDays = configs.store_working_time.filter(day => day.is_open === 0).map(day => day.weekday);

  const isCloseWeekday = (date) => {
    const day = date.getDay();
    
    return !closedDays.includes(day);
  };

  return (
    <>
      <h6>Select date</h6>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange} 
        dateFormat="dd/MM/yyyy"
        inline
        filterDate={isCloseWeekday}
        minDate={new Date()}
      />
    </>
  );
}

export default Calendar;
