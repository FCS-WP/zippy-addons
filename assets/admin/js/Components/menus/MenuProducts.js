import React, { useContext, useEffect, useState } from "react";
import { Box, Divider, Grid, Grid2, Typography } from "@mui/material";
import MenuContext from "../../contexts/MenuContext";
import theme from "../../../theme/theme";
import ProductList from "./ProductList";
import BoxAddProducts from "./layouts/BoxAddProducts";

const MenuProducts = ({ menu }) => {
  const [products, setProducts] = useState([]);

  const fetchMenuProducts = () => {
    // Handle fetch products in menu here;
    const getProducts = [
      {
        id: 32,
        name: "Product 1",
      },
      {
        id: 33,
        name: "Product 2",
      },
      {
        id: 34,
        name: "Product 3",
      },
      {
        id: 36,
        name: "Product 4",
      },
    ];
    setProducts(getProducts);
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
          <ProductList products={products} menuId={menu.id} />
        </>
      )}
    </Box>
  );
};

export default MenuProducts;
