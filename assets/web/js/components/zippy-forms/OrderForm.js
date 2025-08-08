import { Box, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import SelectMethod from "./SelectMethod";
import DeliveryForm from "./delivery/DeliveryForm";
import TakeAwayForm from "./takeaway/TakeAwayForm";
import OutletProvider from "../../providers/OutletProvider";

const OrderForm = ({productId}) => {
  /**
   * Display mode:
   * 1. 'select-method'
   * 2. 'delivery'
   * 3. 'takeaway'
   */
  const [mode, setMode] = useState("select-method");

  const handleChangeMethod = (method) => {
    setMode(method);
  }

  useEffect(()=>{
    setMode('select-method');
  }, [productId])

  return (
    <OutletProvider>
      {mode === "select-method" && (
        <Box>
          <SelectMethod onChangeMode={handleChangeMethod} />
        </Box>
      )}

      {mode === "delivery" && (
        <Box id="zippy-delivery-form">
          <DeliveryForm onChangeMode={handleChangeMethod}/>
        </Box>
      )}

      {mode === "takeaway" && (
        <Box id="zippy-takeaway-form">
          <TakeAwayForm onChangeMode={handleChangeMethod}/>
        </Box>
      )}
    </OutletProvider>
  );
};

export default OrderForm;
