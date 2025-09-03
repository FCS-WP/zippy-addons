import React from "react";
import OrderProvider from "../../providers/OrderProvider";
import NewShippingDetail from "../../Components/order/NewShippingDetail";
import HiddenData from "../../Components/order/HiddenData";

const NewOrder = () => {
  return (
    <OrderProvider>
      <NewShippingDetail />
      <HiddenData />
    </OrderProvider>
  );
};

export default NewOrder;
