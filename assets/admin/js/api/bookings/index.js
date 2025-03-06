import { format } from "date-fns";
import { makeRequest } from "../axios";

export const Bookings = {
  async getBookings(params) {
    return await makeRequest("/bookings", params, "GET");
  },
  async updateBooking(params) {
    return await makeRequest("/update-booking", params, "PUT");
  },
  async bookingReport(params) {
    return await makeRequest("/booking-report", params, "GET");
  },
  async createBooking (params) {
    return await makeRequest("/booking", params, 'POST');
  },

};

export const getBookingsByDate = async (booking_id, date, status = []) => {
  const queryParams = {
    product_id: booking_id,
    booking_start_date: format(date, "yyyy-MM-dd"),
    booking_end_date: format(date, "yyyy-MM-dd"),
  };
  if (status.length != 0) {
    queryParams.booking_status = status;
  }
  const res = await Bookings.getBookings(queryParams);
  if (res.data.data.length == 0) {
    return [];
  }
  return res.data.data.bookings;
};

