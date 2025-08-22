import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Box, Button, Input } from "@mui/material";
import { format } from "date-fns";

const CustomShippingTime = () => {
  let today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);


  // if minDate = Sunday => +1 to be Monday
  if (minDate.getDay() === 0) {
    minDate.setDate(minDate.getDate() + 1);
  }

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
        setDeliveryTime("01-05");
        break;
      case 2:
        setDeliveryTime("12-06");
        break;
      case 3:
        setDeliveryTime("12-04");
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
    if (date.getDay() === 0) { // Disable Sundays
      return true;
    }
    if (!closedDates || closedDates.length === 0) {
      return false;
    }
    const check = closedDates.find((item) => isInRangeDate(date, item.value));
    return !!check;
  };

  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDay();
      // If weekday (Mon-Fri) and "12PM - 4PM" is selected, reset
      if (day >= 1 && day <= 5 && selectedBtn === 3) {
        setSelectedBtn("");
        setDeliveryTime("");
      }
      // If Saturday and "12PM - 6PM" is selected, reset
      else if (day === 6 && selectedBtn === 2) {
        setSelectedBtn("");
        setDeliveryTime("");
      }
    }
  }, [selectedDate, selectedBtn]);

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
            selected={selectedDate}
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
            variant={selectedBtn === 1 ? "contained" : "outlined"}
            className={selectedBtn === 1 ? "btn-time active" : "btn-time"}
          >
            1PM - 5PM
          </Button>
        </Box>
      </Box>
      <Box my={3} className="preferred-pickup-time">
        <h4>Preferred Pickup Time</h4>
        {selectedDate && selectedDate.getDay() >= 1 && selectedDate.getDay() <= 5 && (
          <Box display={"flex"} flexWrap={"wrap"} gap={3}>
            <Button
              onClick={() => handleChangeSelectedBtn(2)}
              variant={selectedBtn === 2 ? "contained" : "outlined"}
              className={selectedBtn === 2 ? "btn-time active" : "btn-time"}
            >
              12PM - 6PM
            </Button>
          </Box>
        )}
        {selectedDate && selectedDate.getDay() === 6 && (
          <Box display={"flex"} flexWrap={"wrap"} gap={3}>
            <Button
              onClick={() => handleChangeSelectedBtn(3)}
              variant={selectedBtn === 3 ? "contained" : "outlined"}
              className={selectedBtn === 3 ? "btn-time active" : "btn-time"}
            >
              12PM - 4PM
            </Button>
          </Box>
        )}
      </Box>
      <p>
        <i>
          *On the eve of and on PH, deliveries will be scheduled between{" "}
          <b>1PM – 8PM</b> due to expected traffic conditions.
          <br />
          *For specific delivery timing requests, please contact us directly via
          WhatsApp or phone to make arrangements.
        </i>
      </p>
    </div>
  );
};

export default CustomShippingTime;