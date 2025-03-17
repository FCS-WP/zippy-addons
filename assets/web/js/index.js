import React from "react";
import ReactDOM from "react-dom/client";
import { DeliveryForm, TakeAwayForm } from "./components/zippy-forms";

import "./calendar/old_calendar";

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-delivery-form");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(<DeliveryForm />);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-takeaway-form");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(<TakeAwayForm />);
  }
});
