import React, { useContext, useEffect, useState } from "react";
import { StyledPaper } from "../mui-custom-styles";
import { Box, Divider, Grid, Grid2, Typography } from "@mui/material";
import MenuContext from "../../contexts/MenuContext";
import theme from "../../../theme/theme";
import BoxAddProducts from "./BoxAddProducts";
import ProductList from "./ProductList";
import { NavLink, useLocation } from "react-router";
import { linkMenuAdmin } from "../../utils/bookingHelper";

const MenuProducts = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const menuId = searchParams.get("id");

  const { menus } = useContext(MenuContext);
 
  const menu = menus.find((item) => item.id == menuId);
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

    return () => { 

    };
  }, [])

  const Heading = () => {
    return (
      <Grid2 container spacing={3}>
        <Grid2 size={4}>
          <NavLink to={linkMenuAdmin}>Back to menus</NavLink>
        </Grid2>
        <Grid2 size={4}>
          <Typography
            fontWeight={600}
            variant="h5"
            mb={3}
            textAlign="center"
            color={theme.palette.primary.main}
          >
            {menu.name}
          </Typography>
        </Grid2>
        <Grid2 size={4}>
          <BoxAddProducts selectedMenu={menu} />
        </Grid2>
      </Grid2>
    );
  };

  return (
    <Box>
      {menu && (
        <>
          <Heading />
          <Divider sx={{ my: 3 }} />
          <ProductList products={products} />
        </>
      )}
    </Box>
  );
};

export default MenuProducts;
