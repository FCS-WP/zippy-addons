import { format } from "date-fns";
import { webApi } from "../api";

export const getBookingsByDate = async (booking_id, date, status = []) => {
  const queryParams = {
    product_id: booking_id,
    booking_start_date: format(date, "yyyy-MM-dd"),
    booking_end_date: format(date, "yyyy-MM-dd"),
  };
  if (status.length != 0) {
    queryParams.booking_status = status;
  }
  const res = await webApi.getBookings(queryParams);
  if (res.data.data.length == 0) {
    return [];
  }
  return res.data.data.bookings;
};
