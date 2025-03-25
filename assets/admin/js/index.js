import React from "react";
import ReactDOM from "react-dom/client";
import Index from "./Pages/Bookings";
import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
// import ProductsBooking from "./Pages/ProductsBooking";
// import Calendar from "./Pages/Calendar";
import Store from "./Pages/Store";
import Shipping from "./Pages/Shipping";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";

function initializeApp() {
  const zippyBookings = document.getElementById("root_app");
  const zippyDashboard = document.getElementById("zippy_dashboard");
  const zippySettings = document.getElementById("zippy_settings");
  const zippyStore = document.getElementById("zippy_store_booking");
  const zippyShipping = document.getElementById("zippy_shipping");

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
  if (zippyStore) {
    const root = ReactDOM.createRoot(zippyStore);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Store />
      </ThemeProvider>
    );
  }
  if (zippyShipping) {
    const root = ReactDOM.createRoot(zippyShipping);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Shipping />
      </ThemeProvider>
    );
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
