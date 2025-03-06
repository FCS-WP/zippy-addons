import React, { useMemo, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Stack, Box, Card, Typography } from "@mui/material";

Chart.register(...registerables);

const BookingMainChart = ({ data }) => {
  const chartRef = useRef(null);
  const labels = data?.labels;
  const totalBookingsArray = data?.dataset?.map((item) =>
    parseInt(item.total_bookings, 10)
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 16 / 9,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total Bookings",
          },
        },
        x: {
          title: {
            display: true,
            text: "Booking Start Date",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `Total Bookings: ${tooltipItem.raw}`,
          },
        },
      },
    }),
    []
  );

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Total Bookings",
          data: totalBookingsArray,
          backgroundColor: "rgba(34, 113, 177, 0.8)",
          borderColor: "rgba(34, 113, 177, 1)",
          borderWidth: 1,
        },
      ],
    }),
    [labels, totalBookingsArray]
  );

  return (
    <Stack my={4}>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          Technical Analysis
        </Typography>
      </Box>
      <Card>
        <Typography variant="h6" component="h2" mb={4} textAlign="center">
          Appointments Overview
        </Typography>
        <Box height={430}>
          <Bar ref={chartRef} data={chartData} options={options} />
        </Box>
      </Card>
    </Stack>
  );
};

export default BookingMainChart;
