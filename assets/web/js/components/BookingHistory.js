import React from "react";

import ListBooking from "./history/ListBooking";
import LoginMessage from "./history/LoginMessage";
import { ToastContainer } from "react-toastify";

const BookingHistory = () => {
  const adminData = window.admin_data ? window.admin_data : null;
  
  return (
    <div>
      {adminData.user_email ? <ListBooking /> : <LoginMessage />}
      <ToastContainer />
    </div>
  );
};

export default BookingHistory;
