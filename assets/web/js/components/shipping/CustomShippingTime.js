import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Box, Button, Input } from "@mui/material";
import { format } from "date-fns";

const CustomShippingTime = () => {
  let today = new Date();
  const minDate = today.setDate(today.getDate() + 2);

  const [selectedDate, setSelectedDate] = useState(minDate);
  const [selectedBtn, setSelectedBtn] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [closedDates, setClosedDates] = useState([]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const handleChangeSelectedBtn = (value) => {
    setSelectedBtn(value);
    switch (value) {
      case 1:
        setDeliveryTime("10-17");
        break;
      case 2:
        setDeliveryTime("14-19");
        break;
      case 3:
        setDeliveryTime("18-21");
        break;
      default:
        break;
    }
  };

  const isInRangeDate = (item, dates) => {
    let startDate = new Date(dates[0]);
    let endDate = new Date(dates[1]);
    let checkDate = new Date(item);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate >= startDate && checkDate <= endDate) {
      return true;
    }
  };

  const isClosedDate = (date) => {
    if (!closedDates || closedDates.length == 0) {
      return false;
    }
    const check = closedDates.find((item) => isInRangeDate(date, item.value));
    if (check) {
      return true;
    }
    return false;
  };

  return (
    <div>
      <Box className="preferred-delivery-date">
        <h4>Preferred Delivery Date</h4>
        <div className="date-box custom-shipping-date">
          <Input
            type="hidden"
            name="delivery_date"
            id="custom_delivery_date"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
          />
          <Input
            type="hidden"
            name="delivery_time"
            id="custom_delivery_time"
            value={deliveryTime}
          />
          <DatePicker
            minDate={minDate}
            date={selectedDate ?? ""}
            onChange={handleSelectDate}
            filterDate={(date) => !isClosedDate(date)}
            inline
          />
        </div>
      </Box>
      <Box my={3} className="preferred-delivery-time">
        <h4>Preferred Delivery Time</h4>
        <Box display={"flex"} flexWrap={"wrap"} gap={3}>
          <Button
            onClick={() => handleChangeSelectedBtn(1)}
            variant={selectedBtn == 1 ? "contained" : "outlined"}
            className={selectedBtn == 1 ? "btn-time active" : "btn-time"}
          >
            1PM - 5PM
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default CustomShippingTime;
