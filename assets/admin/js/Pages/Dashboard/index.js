import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  Stack,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Bookings } from "../../api/bookings";
import Loading from "../../Components/Loading";
import BookingMainChart from "../../Components/Charts/BookingMainChart";
import Header from "../../Components/Layouts/Header";
import CustomeDatePicker from "../../Components/DatePicker/CustomeDatePicker";
import { addDays, startOfDay, endOfDay, format } from "date-fns";

const Dashboard = () => {
  const [dateParams, setDateParams] = useState({
    startDate: startOfDay(addDays(new Date(), -7)),
    endDate: endOfDay(new Date()),
  });

  const [chartBookings, setChartBookings] = useState([]);
  const [overview, setOverview] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dateParams && dateParams.startDate && dateParams.endDate) {
      const params = {
        "start-date": format(dateParams?.startDate, "yyyy-MM-dd"),
        "end-date": format(dateParams?.endDate, "yyyy-MM-dd"),
      };
      fetchBookings(params);
    }
  }, [dateParams]);

  const fetchBookings = async (params) => {
    setLoading(true);

    try {
      const response = await Bookings.bookingReport(params);

      if (response?.data?.status === "success") {
        const bookings = response.data.data;
        setChartBookings({
          dataset: bookings.dataset,
          labels: bookings.labels,
        });
        setOverview(bookings.overview);
        setStatusBreakdown(bookings.status_breakdown);
      } else {
        console.error(
          "Error fetching bookings: ",
          response?.message || "Unknown error occurred."
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateParams({
      startDate: start,
      endDate: end,
    });
  };

  const title = "Booking Dashboad";

  return (
    <Stack>
      <Header title={title}></Header>
      <Stack>
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={4}>
            <CustomeDatePicker
              isClearable={false}
              startDate={dateParams.startDate}
              handleDateChange={handleDateChange}
              endDate={dateParams.endDate}
            />
          </Box>
          {loading ? (
            <Loading />
          ) : (
            <>
              <Grid2 container size={4} spacing={2}>
                <DashboardCard
                  title="Total Bookings"
                  value={overview?.total_bookings || 0}
                />
                <DashboardCard
                  title="Completed Bookings"
                  value={statusBreakdown?.completed?.booking_total || 0}
                  highlight="primary.complete"
                />
                <DashboardCard
                  title="Approved Bookings"
                  value={statusBreakdown?.pending?.booking_total || 0}
                  highlight="primary.approve"
                />
                <DashboardCard
                  title="Pending Bookings"
                  value={statusBreakdown?.onHold?.booking_total || 0}
                  highlight="primary.pending"
                />
              </Grid2>
            </>
          )}
        </Box>
        <Stack mt={2}>
          <Grid2 container>
            <Grid2 size={6}>
              <BookingMainChart data={chartBookings} />
            </Grid2>
          </Grid2>
        </Stack>
      </Stack>
    </Stack>
  );
};

const DashboardCard = ({ title, value, highlight }) => {
  return (
    <Grid2 xs={12} sm={6} md={4} lg={2}>
      <Card
        style={{
          minWidth: "215px",
        }}
        elevation={3}
      >
        <CardContent>
          <Typography
            variant="h3"
            color={highlight || "text.primary"}
            gutterBottom
          >
            {value}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grid2>
  );
};

export default Dashboard;
