import React, { useState, useEffect } from "react";
import { getCustomDayOfWeek, getAvailableTimeSlots } from "../helper/datetime";
import Message from "./single-booking/Message";
import { duration, Tooltip, tooltipClasses } from "@mui/material";
import { CustomToolTip } from "../custom-mui/CustomMui";

const BookingTimeSlot = (props) => {
  const {
    config,
    bookingInfo,
    selectedDate,
    handleTimeSelected,
    selectedProduct,
  } = props;

  const workingTimeByWeekday = config.store_working_time.reduce((acc, time) => {
    acc[time.weekday] = time;
    return acc;
  }, {});
  const [timeActive, setTimeActive] = useState(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (selectedDate && bookingInfo) {
      const date = getCustomDayOfWeek(selectedDate);
      const configTime = workingTimeByWeekday[date];
      const duration = config.duration;
      const holidays = config.holiday;
      const timeSlots = getAvailableTimeSlots(
        configTime,
        bookingInfo,
        selectedDate,
        duration,
        holidays
      );
      setSlots(timeSlots);
    }
  }, [selectedDate, bookingInfo]);

  const handleTimeSelect = (slot, index) => {
    if (slot.isDisabled) return; // Prevent selecting disabled slots
    setTimeActive(index);
    handleTimeSelected(slot);
  };

  const SlotItem = ({ data, index, timeActive, product }) => {
    const disabledSlotText = `This time slot is not available.`;
    const appliedExtraPrice = `The surcharge has been applied.`;

    return (
      <>
        <CustomToolTip
          title={
            data.isDisabled
              ? disabledSlotText
              : data.isExtra
              ? appliedExtraPrice
              : ""
          }
          type={data.isDisabled
            ? 'error'
            : data.isExtra
            ? 'primary'
            : ""}
          arrow
        >
          <div
            role="button"
            aria-disabled={data.isDisabled}
            onClick={() => handleTimeSelect(data, index)}
            className={`
                slot-item
                ${timeActive === index ? "active" : ""} 
                ${data.isDisabled ? "disabled" : ""} 
                ${data.isExtra ? "extra-slot" : ""}
              `}
          >
            <p className="slot-title">
              {data.start} - {data.end}
            </p>
            <span className="slot-price">
              ${" "}
              {data.isExtra
                ? product.item_extra_price
                  ? product.item_extra_price
                  : product.item_price
                : product.item_price}
            </span>
          </div>
        </CustomToolTip>
      </>
    );
  };

  return (
    <div>
      <h4>Time Slots</h4>
      <div className="slots-container">
        {slots?.length > 0 ? (
          slots.map((slot, index) => (
            <SlotItem
              data={slot}
              index={index}
              key={index}
              timeActive={timeActive}
              product={selectedProduct}
            />
          ))
        ) : (
          <Message
            message={
              " The date you selected is fully booked. Please choose another date."
            }
            className="no-slots-message"
          />
        )}
      </div>
    </div>
  );
};

export default BookingTimeSlot;
