import React from "react";
import ReactDOM from "react-dom/client";
import Index from "./Pages/Bookings";
import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import PriceBooks from "./Pages/PriceBooks";
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
import NewOrder from "./Pages/Orders/NewOrder";
import ButtonAddProducts from "./Pages/Orders/AddProducts/ButtonAddProducts";
import TableOrder from "./Components/order/order-info/TableOrder";
import BulkAction from "./Pages/Orders/BulkAction";
import CustomerSelect from "./Pages/Orders/CustomerSelect";
import InputAdminCreatedOrder from "./Pages/Orders/InputAdminCreatedOrder";

function initializeApp() {
  const zippyBookings = document.getElementById("root_app");
  const zippyDashboard = document.getElementById("zippy_dashboard");
  const zippySettings = document.getElementById("zippy_settings");
  const zippyStore = document.getElementById("zippy_store_booking");
  const zippyShipping = document.getElementById("zippy_shipping");
  const zippyMenus = document.getElementById("zippy_menus");
  const zippyPriceBooks = document.getElementById("zippy_price_books");
  const zippyOrderFilter = document.getElementById("zippy_order_filter");
  const zippyCreateOrder = document.getElementById("admin_create_order");
  const zippyOrderTable = document.getElementById("admin-table-order");
  const bulkActionWrapper = document.querySelector(
    "body.woocommerce_page_wc-orders .bulkactions"
  );
  const customerWrapper = document.querySelector("p.wc-customer-user");
  const zippyInputAdminCreatedOrder = document.getElementById(
    "input-admin-created-order"
  );

  if (zippyCreateOrder) {
    const root = ReactDOM.createRoot(zippyCreateOrder);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NewOrder />
      </ThemeProvider>
    );
  }

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
  if (zippyPriceBooks) {
    const root = ReactDOM.createRoot(zippyPriceBooks);
    root.render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <PriceBooks />
        </BrowserRouter>
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

  if (zippyOrderTable) {
    const root = ReactDOM.createRoot(zippyOrderTable);
    const orderId = zippyOrderTable.getAttribute("data-order-id");
    const enableEdit = zippyOrderTable.getAttribute("data-enable-edit");

    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TableOrder orderId={orderId} enableEdit={enableEdit} />
      </ThemeProvider>
    );
  }

  if (bulkActionWrapper) {
    bulkActionWrapper
      .querySelectorAll("select, input[type='submit'], label")
      .forEach((el) => {
        el.style.display = "none";
      });

    let customBulkDiv = document.getElementById("zippy-bulk-action");
    if (!customBulkDiv) {
      customBulkDiv = document.createElement("div");
      customBulkDiv.id = "zippy-bulk-action";
      bulkActionWrapper.appendChild(customBulkDiv);
    }

    const root = ReactDOM.createRoot(customBulkDiv);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BulkAction />
      </ThemeProvider>
    );
  }

  if (customerWrapper) {
    customerWrapper.style.display = "none";

    let customDiv = document.getElementById("custom-customer-select");
    if (!customDiv) {
      customDiv = document.createElement("div");
      customDiv.id = "custom-customer-select";

      customerWrapper.parentNode.appendChild(customDiv);
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");

    const root = ReactDOM.createRoot(customDiv);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CustomerSelect orderId={orderId} />
      </ThemeProvider>
    );
  }

  if (zippyInputAdminCreatedOrder) {
    const root = ReactDOM.createRoot(zippyInputAdminCreatedOrder);
    const orderId = zippyOrderTable.getAttribute("data-order-id");
    const isManualOrder = zippyInputAdminCreatedOrder.getAttribute(
      "data-is-manual-order"
    );

    if (!isManualOrder) {
      return;
    }

    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <InputAdminCreatedOrder orderId={orderId} />
      </ThemeProvider>
    );
  }

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
}

const buttonAddProducts = document.getElementsByClassName("add-order-item");

if (buttonAddProducts.length > 0) {
  const AddProducts = document.createElement("div");
  AddProducts.id = "button_add_products";
  AddProducts.type = "button";
  AddProducts.textContent = "button_add_products";
  const orderID = document.getElementById("post_ID").value;

  const root = ReactDOM.createRoot(AddProducts);
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ButtonAddProducts orderID={orderID} />
    </ThemeProvider>
  );

  buttonAddProducts[0].parentNode.insertBefore(
    AddProducts,
    buttonAddProducts[0]
  );
  buttonAddProducts[0].remove();
}

document.addEventListener("DOMContentLoaded", initializeApp);
