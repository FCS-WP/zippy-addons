import React, { useCallback, useEffect, useState } from "react";
import { Box, InputAdornment, List, ListItemButton, ListItemText, styled, TextField } from "@mui/material";
import { BsSearch } from "react-icons/bs";
import { Api } from "../../api";
import { toast } from "react-toastify";
import { debounce } from "../../utils/searchHelper";

const ProductSearch = ({ onSelectProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const SearchContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    position: "relative",
  }));

  const SuggestionsContainer = styled(Box)(({ theme }) => ({
    position: "relative",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#fff",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: 'all 0.5s linear',
    marginTop: theme.spacing(1),
  }));

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    setSearchQuery('');
  }

  const handleSearchMappingProduct = async (keyword) => {
    try {
      const params = { 
        query: keyword
      };
      const { data } = await Api.searchMappingProducts(params);
      return data.data;
    } catch (error) {
      toast.error("Error when search");
    }
  }

  const debounceSearchProducts = useCallback(
    debounce(async (keyword) => {
      if (keyword.trim()) {
        const dataProducts = await handleSearchMappingProduct(keyword);
        if (dataProducts) {
          setFilteredProducts(dataProducts.products);
        } else {
          toast.error("Search error");
          setFilteredProducts([]);
        }
      } else {
        setFilteredProducts([]);
      }
  }, 500), []);

  useEffect(() => {
    debounceSearchProducts(searchQuery);
  }, [searchQuery]);

  return (
    <>  
      <Box sx={{ minWidth: {
        xs: '100%',
        md: '400px'
      } }} position={'relative'}>
        <TextField
          fullWidth
          label="Search Your Product"
          variant="outlined"
          placeholder="Type to search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
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
        {searchQuery && (
          <SuggestionsContainer>
            <List>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <ListItemButton
                    key={index}
                    divider={index !== filteredProducts.length - 1}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <ListItemText primary={product.item_name} />
                  </ListItemButton>
                ))
              ) : (
                <ListItemButton>
                  <ListItemText
                    primary="Product not found  "
                    sx={{ color: "text.secondary" }}
                  />
                </ListItemButton>
              )}
            </List>
          </SuggestionsContainer>
        )}
      </Box>
    </>
  );
};

export default ProductSearch;
