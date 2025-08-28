import React, { useRef } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DatePicker from "react-datepicker";

const CustomeDatePicker = ({
  isClearable = true,
  startDate,
  handleDateChange,
  name = "",
  endDate,
  selectsRange = true,
  placeholderText = "Select date",
}) => {
  const ref = useRef();
  return (
    <div className={`zippy-date-picker ${selectsRange ? "range-picker" : ""}`}>
      <CalendarMonthIcon color="secondary" />
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange={selectsRange}
        inline={false}
        className="form-control"
        dateFormat="MMMM d, yyyy"
        isClearable={isClearable}
        placeholderText={placeholderText}
        name={name}
        ref={ref}
      />
    </div>
  );
};

export default CustomeDatePicker;
