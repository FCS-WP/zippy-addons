import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Box, Button, Input } from "@mui/material";
import { format } from "date-fns";
import { webApi } from "../../api";

const CustomShippingTime = () => {
  let today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);

  if (minDate.getDay() === 0) {
    minDate.setDate(minDate.getDate() + 1);
  }

  const [selectedDate, setSelectedDate] = useState(minDate);
  const [selectedBtn, setSelectedBtn] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [closedDates, setClosedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

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
    if (date.getDay() === 0) {
      return true;
    }
    if (!closedDates || closedDates.length === 0) {
      return false;
    }
    const check = closedDates.find((item) =>
      isInRangeDate(date, item.value)
    );
    return !!check;
  };

  const isDateClosed = (date, closedDates) => {
    if (!closedDates || closedDates.length === 0) return false;
    return closedDates.some(item => isInRangeDate(date, item.value));
  };

  useEffect(() => {
    const fetchClosedDates = async () => {
      setLoadingDates(true);
      try {
        const { data: response } = await webApi.getStores();

        if (response?.data?.length > 0) {
          const firstStore = response.data[0];
          const cds = firstStore.closed_dates || [];
          setClosedDates(cds);

          let d = new Date(minDate);
          while (d.getDay() === 0 || isDateClosed(d, cds)) {
            d.setDate(d.getDate() + 1);
          }
          setSelectedDate(d);
        }
      } catch (err) {
        console.log("Missing outlets");
      }
      setLoadingDates(false);
    };

    fetchClosedDates();
  },[]);

  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDay();
      if (day >= 1 && day <= 5 && selectedBtn === 3) {
        setSelectedBtn("");
        setDeliveryTime("");
      } else if (day === 6 && selectedBtn === 2) {
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
          <div style={{ position: "relative" }}>
            {loadingDates && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                  fontSize: "14px"
                }}
              >
                Loading…
              </div>
            )}
          <DatePicker
            minDate={minDate}
            selected={selectedDate}
            onChange={handleSelectDate}
            filterDate={(date) => !isClosedDate(date)}
            inline
          />
          </div>
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

        {selectedDate &&
          selectedDate.getDay() >= 1 &&
          selectedDate.getDay() <= 5 && (
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

      <p style={{ color: "red", marginBottom: "10px" }}>
        Our store will be closed on <b>25 December</b>. All orders placed or
        deliveries scheduled on this date will be processed the next working day.
      </p>

      <p>
        <i>
          *On the eve of and on PH, deliveries will be scheduled between{" "}
          <b>1PM – 8PM</b>.
          <br />*For specific delivery timing requests, contact us directly.
        </i>
      </p>
    </div>
  );
};

export default CustomShippingTime;
