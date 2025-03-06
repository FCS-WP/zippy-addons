import { format } from "date-fns";
import React, { useEffect, useRef } from "react";

const BookingStep3 = ({ selectedProduct, bookingData, handleNextStep }) => {
  const pageFocusRef = useRef(null);
  const backToHome = () => {
    window.location.href = window.location.origin;
  };

  const newAppointment = () => {
    handleNextStep(3, null);
  };

  const goPayment = () => {
    if (bookingData?.order_payment_url) {
      window.location.href = bookingData.order_payment_url;
    }
  };

  const showBookingTimes = (bookingData) => {
    if (bookingData) {
      const startDateString =
        bookingData.booking_start_date + "T" + bookingData.booking_start_time;
      const endDateString =
        bookingData.booking_end_date + "T" + bookingData.booking_end_time;
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);
      const result =
        "From " +
        format(startDate, "HH:mm") +
        " " +
        "to " +
        format(endDate, "HH:mm");
      return result;
    }
    return;
  };

  useEffect(() => {
    if (pageFocusRef.current) {
      pageFocusRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <div className="booking-step-3" ref={pageFocusRef}>
      {bookingData && selectedProduct && (
        <div>
          <h3>Booking Details</h3>
          <div className="summary-container">
            <ul>
              <li>
                <div className="summary-item">
                  <span>Booking Id:</span>
                  <h4>{bookingData.booking_id}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Booking Status:</span>
                  <h4>{bookingData.booking_status}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Email address:</span>
                  <h4>{bookingData.email}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Booking Date:</span>
                  <h4>{bookingData.booking_start_date}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Booking Time:</span>
                  <h4>{showBookingTimes(bookingData)}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Field:</span>
                  <h4>{selectedProduct.item_name}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Price:</span>
                  <h4>
                    ${" "}
                    {bookingData.price_type == "extra"
                      ? selectedProduct.item_extra_price
                      : selectedProduct.item_price}
                  </h4>
                </div>
              </li>
            </ul>
          </div>
          <div className="btn-container">
            <span
              role="button"
              onClick={() => backToHome()}
              className="prev-step-btn"
            >
              Back To Home
            </span>
            {bookingData?.order_payment_url ? (
              <span
                role="button"
                onClick={() => goPayment()}
                className="next-step-btn"
                id="next-step-btn"
              >
                Payment
              </span>
            ) : (
              <span
                role="button"
                onClick={() => newAppointment()}
                className="next-step-btn"
                id="next-step-btn"
              >
                Make New Appointment
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStep3;
