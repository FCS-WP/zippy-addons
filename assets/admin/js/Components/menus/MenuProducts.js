import React, { useContext, useEffect, useState } from "react";
import { Box, Divider, Grid, Grid2, Typography } from "@mui/material";
import MenuContext from "../../contexts/MenuContext";
import theme from "../../../theme/theme";
import ProductList from "./ProductList";
import BoxAddProducts from "./layouts/BoxAddProducts";
import { Api } from "../../api";
import { toast } from "react-toastify";

const MenuProducts = ({ menu }) => {
  const [products, setProducts] = useState([]);

  const fetchMenuProducts = async () => {
    // Handle fetch products in menu here;
    const { data : response } = await Api.getMenuProducts({ menu_id: menu.id });
    if (!response || response.status !== "success") {
      console.warn("Products not found!");
      setProducts([]);
      return;
    }
    setProducts(response.data);
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
          <ProductList refetchProducts={fetchMenuProducts} products={products}  menuId={menu.id} />
        </>
      )}
    </Box>
  );
};

export default MenuProducts;
