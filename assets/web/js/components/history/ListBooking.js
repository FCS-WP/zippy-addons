import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  IconButton,
  Container,
  Pagination,
  Stack,
  Grid2,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaEye, FaTimes } from "react-icons/fa";

import { toast } from "react-toastify";
import { webApi } from "../../api";
import CustomLoader from "../CustomLoader";
import {
  getBookingDate,
  getBookingTime,
  isInFilterDates,
} from "../../helper/datetime";
import FilterContainer from "./FilterContainer";

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;",
  },
}));

const ListBooking = () => {
  const adminData = window.admin_data ? window.admin_data : null;
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [totalPage, setTotalPage] = useState(1);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isShowPagination, setIsShowPagination] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterDates, setFilterDates] = useState(null);
  const [filterStatus, setFilterStatus] = useState(``);
  const BOOKINGS_PER_PAGE = 9;
  const pageFocusRef = useRef(null);

  const getBookingsData = async () => {
    if (!adminData.user_email) {
      setIsLoading(false);
      return false;
    }

    const dataBookings = await webApi.getBookings({
      email: adminData.user_email,
    });

    if (
      dataBookings.data.status != "success" ||
      dataBookings.data.data.length == 0
    ) {
      toast.error("No Data: Booking");
      setIsLoading(false);
      return false;
    }

    setBookings(dataBookings.data.data.bookings);

    handleFilterBooking(dataBookings.data.data.bookings);
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  const handlePayment = () => {
    if (selectedBooking.order.payment_link) {
      window.location.href = selectedBooking.order.payment_link;
      return true;
    }
    toast.error("Can not get payment link!");
    return false;
  };

  const handleFilterBooking = (data) => {
    const filtered = data.filter((booking) => {
      if (!filterDates?.start) {
        return booking.booking_status
          .toLowerCase()
          .includes(filterStatus.toLowerCase());
      }
      return (
        booking.booking_status
          .toLowerCase()
          .includes(filterStatus.toLowerCase()) &&
        isInFilterDates(
          booking.booking_start_date,
          filterDates?.start,
          filterDates?.end
        )
      );
    });

    setFilteredBookings(filtered);
    const getTotalPage = Math.ceil(filtered.length / BOOKINGS_PER_PAGE);
    setTotalPage(getTotalPage);
    setDefaultPagination(filtered);

    if (getTotalPage <= 1) {
      setIsShowPagination(false);
      return;
    }

    setTotalPage(getTotalPage);
    setIsShowPagination(true);
  };

  const handleFilterDate = (dates) => {
    const [start, end] = dates;
    setFilterDates({
      start,
      end,
    });
  };

  const handleFilterStatus = (status) => {
    setFilterStatus(status);
  };

  const setDefaultPagination = (data) => {
    page != 1 ? setPage(1) : null;
    const showBookings = data.slice(0, BOOKINGS_PER_PAGE);
    setCurrentBookings(showBookings);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    const startIndex = (value - 1) * BOOKINGS_PER_PAGE;
    const showBookings = filteredBookings.slice(
      startIndex,
      startIndex + BOOKINGS_PER_PAGE
    );
    setCurrentBookings(showBookings);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "approved":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  useEffect(() => {
    getBookingsData();
    // getProductsCat();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      handleFilterBooking(bookings);
    }
  }, [filterDates, filterStatus]);

  useEffect(() => {
    if (pageFocusRef.current) {
      pageFocusRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  return (
    <Container maxWidth="xxl" sx={{ padding: 0 }} ref={pageFocusRef}>
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ md: "row", sm: "column" }}
          justifyContent={"space-between"}
          alignContent={"center"}
        >
          <Typography variant="h4" gutterBottom>
            Booking Management
          </Typography>
          <FilterContainer
            handleFilterDate={handleFilterDate}
            handleFilterStatus={handleFilterStatus}
          />
        </Stack>
      </Box>
      {isLoading ? (
        <CustomLoader />
      ) : (
        <Grid container spacing={3}>
          {currentBookings.length != 0 ? (
            currentBookings.map((booking, index) => (
              <Grid item xs={12} sm={6} md={4} key={booking.ID}>
                <StyledCard onClick={() => handleBookingClick(booking)}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="h6">
                        {booking?.product?.name}
                      </Typography>
                      <Typography variant="h6">
                        $ {booking?.order?.order_total}
                      </Typography>
                    </Box>
                    <Typography color="textSecondary" gutterBottom>
                      Date: {getBookingDate(booking.booking_start_date)}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      From: {getBookingTime(booking.booking_start_time)} to:{" "}
                      {getBookingTime(booking.booking_end_time)}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1.5,
                      }}
                    >
                      <Chip
                        label={booking.booking_status}
                        color={getStatusColor(booking.booking_status)}
                        size="small"
                        sx={{ paddingX: 1.5 }}
                      />
                      <IconButton size="small" color="primary">
                        <FaEye />
                      </IconButton>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          ) : (
            <Container>
              <Typography color={"error"} variant="h6">
                No bookings found.
              </Typography>
            </Container>
          )}
          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            {selectedBooking && (
              <>
                <DialogTitle>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">Booking Details</Typography>
                    <IconButton onClick={handleClose} size="small">
                      <FaTimes />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent dividers>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box>
                      <Typography variant="h5">
                        {selectedBooking?.product?.name}
                      </Typography>
                      <Chip
                        label={selectedBooking.booking_status}
                        color={getStatusColor(selectedBooking.booking_status)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography>Price:</Typography>
                      <Typography variant="h6">
                        $ {selectedBooking?.order?.order_total}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>Booking Email:</Typography>
                      <Typography variant="h6">
                        {selectedBooking.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>Booking Date:</Typography>
                      <Typography variant="h6">
                        {getBookingDate(selectedBooking.booking_start_date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>Time:</Typography>
                      <Typography variant="h6">
                        From{" "}
                        {getBookingTime(selectedBooking.booking_start_time)} to{" "}
                        {getBookingTime(selectedBooking.booking_end_time)}
                      </Typography>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    color="success"
                    sx={{
                      m: 1.5,
                      px: 3,
                      color: "#4A8875",
                      borderColor: "#4A8875",
                      ":hover": { background: "#4A8875", color: "#FFF" },
                    }}
                  >
                    Close
                  </Button>
                  {selectedBooking.booking_status == "approved" && (
                    <Button
                      variant="text"
                      color="success"
                      sx={{
                        px: 3,
                        m: 1.5,
                        background: "#4A8875",
                        borderColor: "#4A8875",
                        color: "#FFF",
                        ":hover": { background: "#333", color: "#FFF" },
                      }}
                      onClick={handlePayment}
                    >
                      Payment
                    </Button>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>
        </Grid>
      )}
      {isShowPagination && (
        <Stack
          direction={"row"}
          sx={{ justifyContent: "center", alignItems: "center", py: 4 }}
        >
          <Pagination
            count={totalPage}
            page={page}
            onChange={handleChangePage}
            showFirstButton
            showLastButton
          />
        </Stack>
      )}
    </Container>
  );
};

export default ListBooking;
