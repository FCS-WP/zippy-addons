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

export const getSelectProductId = () => {
  const zippyForm = document.getElementById("zippy-form");
  const productId = zippyForm.getAttribute("data-product_id");
  const quantity = zippyForm.getAttribute("quantity") ?? 1;
  const productType = zippyForm.getAttribute("data-product-type") ?? null;
  return [productId, quantity, productType];
};

export const triggerCloseLightbox = () => {
  document.querySelector(".mfp-close").click();
};

export const dataRetailStore = [
  {
    outlet_name: "Katong Shopping Centre",
    start_date: "2025-07-23",
    end_date: "2070-08-23",
    disable_start: "2025-08-09",
    disable_end: "2025-09-23",
  },
];

export const dataPopupReservation = [
  {
    name: "White Sands(8-14 Sep)",
    start_date: "2025-09-08",
    end_date: "2025-09-14",
  },
];
