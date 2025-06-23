import React from "react";
import ReactDOM from "react-dom/client";
// import "./calendar/old_calendar";
import theme from "../theme/customTheme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import OrderForm from "./components/zippy-forms/OrderForm";
import LoginForm from "./pages/LoginForm";

$(function () {
  const target = document.getElementById("lightbox-zippy-form");
  const zippyMain = document.getElementById("zippy-form");
  let root = null;

  // Function to render React component
  function renderReactApp(productId) {
    if (zippyMain) {
      if (!root) {
        root = ReactDOM.createRoot(zippyMain); // Only create root once
      }
      root.render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <OrderForm productId={productId} />
          <ToastContainer />
        </ThemeProvider>
      );
    }
  }

  // Observe changes to attributes on the target element
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-product_id"
      ) {
        const newProductId = target.getAttribute("data-product_id");
        renderReactApp(newProductId);
      }
    }
  });

  observer.observe(target, { attributes: true });

  // Optional: Initial render if needed
  const initialProductId = target.getAttribute("data-product_id");
  renderReactApp(initialProductId);

  document.addEventListener("DOMContentLoaded", function () {
    const zippyLoginForm = document.getElementById("custom-login-form");

    if (typeof zippyLoginForm != "undefined" && zippyLoginForm != null) {
      const root = ReactDOM.createRoot(zippyLoginForm);
      root.render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LoginForm />
          <ToastContainer />
        </ThemeProvider>
      );
    }
  });
});
