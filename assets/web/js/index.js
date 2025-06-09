import React from "react";
import ReactDOM from "react-dom/client";import "./calendar/old_calendar";
import theme from "../theme/customTheme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import OrderForm from "./components/zippy-forms/OrderForm";
import LoginForm from "./pages/LoginForm";

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-form");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(      
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <OrderForm />
      <ToastContainer />
    </ThemeProvider>);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const zippyLoginForm = document.getElementById("custom-login-form");

  if (typeof zippyLoginForm != "undefined" && zippyLoginForm != null) {
    const root = ReactDOM.createRoot(zippyLoginForm);
    root.render(      
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <LoginForm />
      <ToastContainer />
    </ThemeProvider>);
  }
});