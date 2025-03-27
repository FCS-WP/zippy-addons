import React, { useState } from "react";
import { ChipContainer, SearchContainer, SuggestionsContainer } from "../mui-custom-styles";
import {
  Box,
  Button,
  Chip,
  Grid2,
  IconButton,
  InputAdornment,
  List,
  TextField,
  Tooltip,
} from "@mui/material";
import { BsFillQuestionCircleFill, BsSearch } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";

const BoxAddProducts = ({ selectedMenu }) => {
  const [productSearch, setProductSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleProductClick = (product) => {
    const isInSelectedArr = selectedProducts.find(
      (item) => item.id === product.id
    );
    if (!isInSelectedArr) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch("");
  };

  const handleProductKeyDown = (event) => {
    if (event.key === "Enter" && filteredProducts.length > 0) {
      handleProductClick(filteredProducts[0]);
      event.preventDefault();
    }
  };

  const handleAddProducts = async () => {
    console.log("Handle Add product");
  };

  return (
    <Box>
      <SearchContainer>
        <TextField
          fullWidth
          label="Search Products"
          variant="outlined"
          placeholder="Type to search..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          onKeyDown={handleProductKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BsSearch />
                </InputAdornment>
              ),
            },
          }}
        />
        {productSearch && (
          <SuggestionsContainer>
            <List>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <ListItemButton
                    key={index}
                    divider={index !== filteredProducts.length - 1}
                    onClick={() => handleProductClick(product)}
                  >
                    <ListItemText primary={product.name} />
                  </ListItemButton>
                ))
              ) : (
                <ListItemButton>
                  <ListItemText
                    primary="No products found"
                    sx={{ color: "text.secondary" }}
                  />
                </ListItemButton>
              )}
            </List>
          </SuggestionsContainer>
        )}
      </SearchContainer>
      <Grid2 container mt={2} spacing={3} alignItems={"end"}>
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <ChipContainer>
            {selectedProducts.map((product, index) => (
              <Chip
                key={index}
                label={product.name}
                onDelete={() => handleDeleteProduct(product)}
              />
            ))}
          </ChipContainer>
        </Grid2>
        <Grid2
          display={"flex"}
          justifyContent={"end"}
          size={{ xs: 12, lg: 5 }}
          textAlign={"end"}
          alignItems={"center"}
          gap={1}
        >
          <Button
            className="btn-hover-float"
            disabled={isLoading}
            sx={{ fontSize: "12px" }}
            onClick={handleAddProducts}
            variant="contained"
            startIcon={<FiPlus />}
          >
            Add Products
          </Button>
          <Tooltip title="Add product to menu">
            <IconButton size="small" sx={{ p: 0, mb: 0.5 }}>
              <BsFillQuestionCircleFill role="button" />
            </IconButton>
          </Tooltip>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default BoxAddProducts;
