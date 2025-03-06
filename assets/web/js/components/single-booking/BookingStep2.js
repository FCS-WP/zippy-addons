import React, { useEffect, useState } from "react";
import { webApi } from "../../api";
import { format } from "date-fns";
import { getBookingsByDate } from "../../helper/booking";
import { toast } from "react-toastify";
import { alertInputEmail } from "../../helper/showAlert";
import CustomLoader from "../CustomLoader";
import Message from "./Message";
import BookingDatePicker from "../BookingDatePicker";
import BookingTimeSlot from "../BookingTimeSlot";

const BookingStep2 = ({
  handleNextStep,
  handlePreviousStep,
  selectedProduct,
  configs,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimes, setSelectedTime] = useState();
  const [createdBookings, setCreatedBookings] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const adminData = window.admin_data ? window.admin_data : null;

  const getBookings = async (date = new Date()) => {
    const bookings = await getBookingsByDate(selectedProduct.items_id, date, ['pending', 'approved']);
    setCreatedBookings(bookings);
  };

  useEffect(() => {
    getBookings();
  }, []);

  const handleSubmitStep2 = async () => {
    let userEmail = "";
    if (!selectedTimes) {
      toast.warn("Please select a time slot to proceed.");
      return;
    }
    setIsSubmitLoading(true);
    if (!adminData.user_email) {
      const inputEmail = await alertInputEmail();
      if (!inputEmail) {
        setIsSubmitLoading(false);
        return;
      }
      userEmail = inputEmail;
    }

    let bookingStartDateString =
      format(selectedDate, "yyyy-MM-dd") + "T" + selectedTimes.start;
    let bookingEndDateString =
      format(selectedDate, "yyyy-MM-dd") + "T" + selectedTimes.end;
    const bookingStartDate = new Date(bookingStartDateString);
    const bookingEndDate = new Date(bookingEndDateString);
    const data = {
      product_id: selectedProduct.items_id,
      email: adminData.user_email ?? userEmail,
      booking_start_date: format(bookingStartDate, "yyyy-MM-dd"),
      booking_end_date: format(bookingEndDate, "yyyy-MM-dd"),
      booking_start_time: format(bookingStartDate, "HH:mm"),
      booking_end_time: format(bookingEndDate, "HH:mm"),
    };
    const createBooking = await webApi.createBooking(data);
    if (!createBooking || createBooking.data?.status != "success") {
      toast.error("Booking Failed!");
      setIsSubmitLoading(false);
      return false;
    }
    toast.success("Booking has been created");
    const bookingData = createBooking.data.data;
    bookingData.price_type = selectedTimes.isExtra ? "extra" : "regular";
    handleNextStep(2, bookingData);
    setIsSubmitLoading(false);
    return true;
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    getBookings(date);
  };

  const handleTimeSelected = (time) => {
    setSelectedTime(time);
  };

  return (
    <>
      {selectedProduct && (
        <div className="booking-step-2">
          <div className="booking-content"></div>
          <div className="product-info">
            <div>
              <h4>Field</h4>
              <span> {selectedProduct.item_name}</span>
            </div>
          </div>
          <div className="booking-section">
            <div className="booking-calendar">
              <div className="date-box">
                <BookingDatePicker
                  config={configs}
                  handleSelectDate={(date) => handleSelectDate(date)}
                />
              </div>
            </div>
            {/* Time Slots */}
            {configs ? (
              <div className="time-slots">
                {isloading ? (
                  <CustomLoader />
                ) : (
                  <BookingTimeSlot
                    selectedProduct={selectedProduct}
                    config={configs}
                    bookingInfo={createdBookings}
                    selectedDate={selectedDate}
                    handleTimeSelected={handleTimeSelected}
                  />
                )}
              </div>
            ) : (
              <div className="time-slots">
                <Message message={"Booking configs not found!"} />
              </div>
            )}
          </div>
          <div className="booking-footer">
            <div className="btn-container">
              <span
                role="button"
                onClick={() => handlePreviousStep()}
                className="prev-step-btn"
              >
                Cancel
              </span>
              {isSubmitLoading ? (
                <CustomLoader />
              ) : (
                <span
                  role="button"
                  onClick={() => handleSubmitStep2()}
                  className="next-step-btn"
                  id="next-step-btn"
                >
                  Continue
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingStep2;
