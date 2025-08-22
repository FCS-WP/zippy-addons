import React from "react";
import ReactDOM from "react-dom/client";
import CustomShippingTime from "./components/shipping/CustomShippingTime";

document.addEventListener("DOMContentLoaded", function () {
  const custom_shipping_time = document.getElementById("custom_shipping_time");

  if (typeof custom_shipping_time != "undefined" && custom_shipping_time != null) {
    const root = ReactDOM.createRoot(custom_shipping_time);
    root.render(
      <>
        <CustomShippingTime />
      </>
    );
  }
});