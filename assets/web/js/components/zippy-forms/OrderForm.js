import { Box, Button, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import SelectMethod from "./SelectMethod";
import DeliveryForm from "./delivery/DeliveryForm";
import TakeAwayForm from "./takeaway/TakeAwayForm";
import OutletProvider from "../../providers/OutletProvider";

const OrderForm = ({ productId, quantity }) => {
  /**
   * Display mode:
   * 1. 'select-method'
   * 2. 'delivery'
   * 3. 'takeaway'
   */
  const [mode, setMode] = useState("select-method");
  const [isLoading, setIsLoading] = useState(true);

  const redirectDeliveryUrl =
    "https://www.ushop.market/shop/dona-manis-cake-shop/";

  const handleChangeMethod = (method) => {
    setMode(method);
  };

  useEffect(()=>{
    setTimeout(()=>{
      setIsLoading(false);
    }, 1000);
  }, [])

  useEffect(() => {
    if (mode === "delivery") {
      document
        .querySelector("a.dialog-close-button.dialog-lightbox-close-button")
        ?.click();
      setMode("select-method");
      window.open(redirectDeliveryUrl, "_blank");
    }
  }, [mode]);

  useEffect(() => {
    setMode("select-method");
  }, [productId]);

  return (
    <OutletProvider>
      <>
        {isLoading ? (
          <Box py={5} display={'flex'} justifyContent={'center'}>
            <CircularProgress color="secondary" size={40} />
          </Box>
        ) : (
          <>
            {mode === "select-method" && (
              <Box>
                <SelectMethod
                  onChangeMode={handleChangeMethod}
                />
              </Box>
            )}

            {/* {mode === "delivery" && (
          <Box id="zippy-delivery-form">
            <DeliveryForm onChangeMode={handleChangeMethod}/>
          </Box>
        )} */}

            {mode === "takeaway" && (
              <Box id="zippy-takeaway-form">
                <TakeAwayForm
                  onChangeMode={handleChangeMethod}
                />
              </Box>
            )}
          </>
        )}
      </>
    </OutletProvider>
  );
};

export default OrderForm;
