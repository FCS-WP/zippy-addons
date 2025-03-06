import React from "react";
import ReactDOM from "react-dom/client";
import Index from "./Pages/Bookings";
import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import ProductsBooking from "./Pages/ProductsBooking";
import Calendar from "./Pages/Calendar";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";

function initializeApp() {
  const zippyBookings = document.getElementById("root_app");
  const zippyDashboard = document.getElementById("zippy_dashboard");
  const zippySettings = document.getElementById("zippy_settings");
  const zippyProductsBooking = document.getElementById(
    "zippy_products_booking"
  );
  const zippyBookingScheduler = document.getElementById(
    "zippy_booking_scheduler"
  );

  if (zippyBookings) {
    const root = ReactDOM.createRoot(zippyBookings);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Index />
      </ThemeProvider>
    );
  }
  if (zippyDashboard) {
    const root = ReactDOM.createRoot(zippyDashboard);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dashboard />
      </ThemeProvider>
    );
  }
  if (zippySettings) {
    const root = ReactDOM.createRoot(zippySettings);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Settings />
      </ThemeProvider>
    );
  }
  if (zippyProductsBooking) {
    const root = ReactDOM.createRoot(zippyProductsBooking);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProductsBooking />
      </ThemeProvider>
    );
  }
  if (zippyBookingScheduler) {
    const root = ReactDOM.createRoot(zippyBookingScheduler);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Calendar />
      </ThemeProvider>
    );
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
