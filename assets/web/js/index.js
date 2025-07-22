import React from "react";
import ReactDOM from "react-dom/client";
import "./calendar/old_calendar";
import theme from "../theme/customTheme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import OrderForm from "./components/zippy-forms/OrderForm";
import LoginForm from "./pages/LoginForm";

$(function () {
  const target = document.getElementById("lightbox-zippy-form");
  let root = null;

  // Function to render React component
  function renderReactApp(productId, quantity = 1) {
    const zippyMain = document.getElementById("zippy-form");
    const root = ReactDOM.createRoot(zippyMain);

    if (zippyMain) {
      // if (!root) {
      //   root = ReactDOM.createRoot(zippyMain); // Only create root once
      // }
      root.render(
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <OrderForm productId={productId} quantity={quantity} />
          <ToastContainer />
        </ThemeProvider>
      );
    }
  }

  const body = document.body;

  // Create a MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check if new nodes were added
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is an Elementor popup modal
          if (
            node.classList &&
            node.classList.contains("elementor-popup-modal")
          ) {
            console.log("Elementor popup detected:", node);
            let form = document.getElementById("zippy-form");
            let productId = form.getAttribute("data-product_id");
            let quantity = form.getAttribute("quantity");
            renderReactApp(productId, quantity);
          }
        });
      }
    });
  });

  // Configure the observer to monitor the <body>
  observer.observe(body, { childList: true });

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
