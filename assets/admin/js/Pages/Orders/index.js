import React, { useState, useEffect } from "react";
import CustomeDatePicker from "../../Components/DatePicker/CustomeDatePicker";

const FilterOrder = ({ filterValue, filterName }) => {
  const [date, setDate] = useState(null);

  useEffect(() => {
    if (filterValue) {
      const parsedDate = new Date(`${filterValue}T00:00:00`);
      if (!isNaN(parsedDate)) {
        setDate(parsedDate);
      }
    } else {
      setDate(null);
    }
  }, [filterValue]);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    console.log("Selected Date:", selectedDate);
  };

  return (
    <CustomeDatePicker
      startDate={date}
      placeholderText="Fulfilment Date"
      selectsRange={false}
      handleDateChange={handleDateChange}
      name={filterName}
    />
  );
};

export default FilterOrder;
