import React from "react";
import ReactDOM from "react-dom/client";
import Index from "./Pages/Bookings";
import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
// import ProductsBooking from "./Pages/ProductsBooking";
// import Calendar from "./Pages/Calendar";
import Store from "./Pages/Store";
import Shipping from "./Pages/Shipping";
import FilterOrder from "./Pages/Orders";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import AdminMenus from "./Pages/Menus/AdminMenus";
import { BrowserRouter } from "react-router";

function initializeApp() {
  const zippyBookings = document.getElementById("root_app");
  const zippyDashboard = document.getElementById("zippy_dashboard");
  const zippySettings = document.getElementById("zippy_settings");
  const zippyStore = document.getElementById("zippy_store_booking");
  const zippyShipping = document.getElementById("zippy_shipping");
  const zippyMenus = document.getElementById("zippy_menus");
  const zippyOrderFilter = document.getElementById("zippy_order_filter");

  if (zippyMenus) {
    const root = ReactDOM.createRoot(zippyMenus);
    root.render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <AdminMenus />
        </BrowserRouter>
      </ThemeProvider>
    );
  }
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
  if (zippyOrderFilter) {
    const currentValue = zippyOrderFilter?.dataset?.value || "";
    const filtername = zippyOrderFilter?.dataset?.name || "";
    const root = ReactDOM.createRoot(zippyOrderFilter);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FilterOrder filterName={filtername} filterValue={currentValue} />
      </ThemeProvider>
    );
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
