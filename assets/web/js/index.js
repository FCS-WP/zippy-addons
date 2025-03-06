import React from "react";
import ReactDOM from "react-dom/client";
import BookingForm from "./BookingForm";
import BookingHistory from "./components/BookingHistory";
import BookingPopUp from "./BookingPopUpForm";

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-booking-root");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(<BookingForm />);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-booking-history");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(<BookingHistory />);
  }
});

//Booking Pop Up Form
document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("btn_booking");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(
      <BookingPopUp/>
    );
  }
});