import React, { useContext, useState } from "react";
import { StyledPaper } from "../mui-custom-styles";
import { Box, Divider, Typography } from "@mui/material";
import MenuContext from "../../contexts/MenuContext";
import theme from "../../../theme/theme";
import BoxAddProducts from "./BoxAddProducts";
import ProductList from "./ProductList";

const MenuProducts = () => {
  const { selectedMenu } = useContext(MenuContext);

  const Heading = () => {
    return (
      <Box>
        <Typography
            fontWeight={600}
            variant="h5"
            textAlign="center"
            color={theme.palette.primary.main}
          >
            Menu Details
          </Typography>
          <Box my={3}>
            <Typography fontWeight={600}>Menu: {selectedMenu?.name}</Typography>
          </Box>
          <BoxAddProducts selectedMenu={selectedMenu} />
      </Box>
    )
  }

  return (
    <StyledPaper>
      {selectedMenu && (
        <>
          <Heading />
          <Divider sx={{ my: 3 }}/>
          <ProductList />
        </>
      )}
      {!selectedMenu && <Typography>Please select an menu.</Typography>}
    </StyledPaper>
  );
};

export default MenuProducts;
