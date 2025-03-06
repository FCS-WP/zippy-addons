import React, { useState } from "react";
import { Box, Button, Divider, Grid2, Typography } from "@mui/material";
import StatusSelect from "../StatusSelect";
import { Bookings } from "../../api/bookings";
import { toast } from "react-toastify";

const EventView = ({ event, close, updateEvents }) => {
  const booking = event?.booking_data;
  const [bookingStatus, setBookingStatus] = useState(booking.booking_status);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const handleStatusChange = (bookingID, newStatus) => {
    updateBookingStatus(bookingID, newStatus);
  };

  const updateBookingStatus = async (bookingID, newStatus) => {
    setIsStatusLoading(true);
    try {
      const params = { booking_id: bookingID, booking_status: newStatus };
      const {data: response} = await Bookings.updateBooking(params);
      if (response.status == "success") {
        booking.booking_status = newStatus;
        event.booking_data = booking;
        setBookingStatus(newStatus);
        toast.success(`Booking has been updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error("This booking cannot be updated");
    } finally {
      setIsStatusLoading(false);
      updateEvents();
    }
  };

  return (
    <Box p={3} className="booking-informations">
      <Grid2 container spacing={2}>
        <Grid2>
          <Typography variant="h2">Booking ID: {booking.ID ?? booking?.booking_id}</Typography>
          <Typography variant="span" fontSize={13}>
            Created at: {booking?.created_at ?? ""}
          </Typography>
        </Grid2>
      </Grid2>
      <Grid2 container my={3} spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Typography fontWeight={600}>Product:</Typography>
          <Typography variant="h6" fontSize={16}>
             {booking?.product.name}
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Typography fontWeight={600}>Price:</Typography>
          <Typography variant="h6" fontSize={16}>
            $ {booking?.order?.order_total ?? ""}
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Typography fontWeight={600}>Booking Email:</Typography>
          <Typography variant="h6" fontSize={16}>
            {booking?.email ?? ""}
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Typography fontWeight={600}>Status:</Typography>
          <StatusSelect
            currentStatus={bookingStatus}
            isLoading={isStatusLoading}
            onStatusChange={(newStatus) => {
              handleStatusChange(booking.ID, newStatus);
            }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Typography fontWeight={600}>Booking Start Date:</Typography>
          <Typography variant="h6" fontSize={16}>
            {`${booking.booking_start_date} ${booking.booking_start_time}`}
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Typography fontWeight={600}>Booking End Date:</Typography>
          <Typography variant="h6" fontSize={16}>
            {`${booking.booking_end_date} ${booking.booking_end_time}`}
          </Typography>
        </Grid2>
       
      </Grid2>

      <Divider />
      {/* Action box */}
      <Box mt={3} display={"flex"} justifyContent={"end"}>
        <Button
          onClick={close}
          variant="outlined"
          color="success"
          disabled={isStatusLoading}
          sx={{
            px: 3,
            color: "#4A8875",
            borderColor: "#4A8875",
            ":hover": { background: "#4A8875", color: "#FFF" },
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default EventView;
