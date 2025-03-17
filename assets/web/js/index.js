import React from "react";
import ReactDOM from "react-dom/client";
import { DeliveryForm, TakeAwayForm } from "./components/zippy-forms";

import "./calendar/old_calendar";
import theme from "../theme/customTheme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-delivery-form");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Reset default styles */}
        <DeliveryForm />
        <ToastContainer />
      </ThemeProvider>
    );
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-takeaway-form");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(      
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <TakeAwayForm />
      <ToastContainer />
    </ThemeProvider>);
  }
});
