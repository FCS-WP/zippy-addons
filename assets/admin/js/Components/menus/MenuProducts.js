import React, { useEffect, useState } from "react";
import { Box, Divider } from "@mui/material";
import ProductList from "./ProductList";
import { Api } from "../../api";
import { toast } from "react-toastify";

const MenuProducts = ({ menu }) => {
  const [products, setProducts] = useState([]);

  const fetchMenuProducts = async () => {
    try {
      const { data: response } = await Api.getMenuProducts({
        menu_id: menu.id,
      });

      if (response?.error) {
        throw new Error(response.error.message || "Get Products failed");
      }
      if (!response || response.status !== "success") {
        toast.error("Empty products in this Menu");

        setProducts([]);
        return;
      }
      setProducts(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchMenuProducts();
    return () => {};
  }, []);

  return (
    <Box>
      {menu && (
        <>
          <Divider sx={{ my: 3 }} />
          <ProductList
            refetchProducts={fetchMenuProducts}
            products={products}
            menuId={menu.id}
          />
        </>
      )}
    </Box>
  );
};

export default MenuProducts;
