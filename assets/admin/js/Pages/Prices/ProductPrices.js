import { Box } from "@mui/material";
import React from "react";
import { ToastContainer } from "react-toastify";
import Header from "../../Components/Layouts/Header";
import PriceConfig from "../../Components/Prices/PriceConfig";

const ProductPrices = () => {
  return (
    <Box>
      <Header title="Product Prices" />
      <PriceConfig />
      <ToastContainer />
    </Box>
  );
};

export default ProductPrices;
