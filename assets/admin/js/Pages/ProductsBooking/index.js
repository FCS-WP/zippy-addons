import React, { useEffect } from "react";
import SearchBox from "../../Components/Products/SearchBox";
import ListProductsBooking from "../../Components/Products/ListProductsBooking";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Api } from "../../api";
import CustomLoader from "../../../../web/js/components/CustomLoader";
import { Box, Container } from "@mui/material";
import Header from "../../Components/Layouts/Header";
const ProductsBooking = () => {
  const [mappingData, setMappingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateListMapping = async () => {
    setIsLoading(true);
    try {
      const { data } = await Api.getMappingData();
      if (!data) {
        toast.error("Get mapping data failed!");
        setIsLoading(false);
        return false;
      }
      setMappingData(data.data);
    } catch (error) {
      toast.error("Can not get data!");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    updateListMapping();
  }, []);
  const title = "Products Booking";
  return (
    <>
      <Header title={title} />
      <Box className="products-booking-page">
        <SearchBox updateListMapping={updateListMapping} />
        {isLoading ? (
          <Box sx={{ position: "relative", marginRight: "3rem" }}>
            <CustomLoader />
          </Box>
        ) : (
          <ListProductsBooking
            mappingData={mappingData}
            updateListMapping={updateListMapping}
          />
        )}
        <ToastContainer />
      </Box>
    </>
  );
};

export default ProductsBooking;
