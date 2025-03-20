import { Box, Button } from "@mui/material";
import React, { useState } from "react";
import SelectMethod from "./SelectMethod";
import DeliveryForm from "./delivery/DeliveryForm";
import TakeAwayForm from "./takeaway/TakeAwayForm";

const OrderForm = () => {
  /**
   * Display mode:
   * 1. 'select-method'
   * 2. 'delivery'
   * 3. 'takeaway'
   */
  const [mode, setMode] = useState("select-method");
  
  const handleChangeMethod = (method) => {
    setMode(method)
  }

  return (
    <Box>
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
    </Box>
  );
};

export default OrderForm;
