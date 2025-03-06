import React from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DatePicker from "react-datepicker";

const CustomeDatePicker = ({
  isClearable = true,
  startDate,
  handleDateChange,
  endDate,
  selectsRange = true,
  placeholderText = "Select date",
}) => {
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
      />
    </div>
  );
};

export default CustomeDatePicker;
