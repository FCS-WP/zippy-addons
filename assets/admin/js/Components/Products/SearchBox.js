import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  TextField,
  Grid2 as Grid,
  InputAdornment,
  Paper,
  List,
  ListItemText,
  Chip,
  ListItemButton,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { BsSearch, BsFillQuestionCircleFill } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { Api } from "../../api";
import { toast } from "react-toastify";
import { debounce } from "../../utils/searchHelper";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: "relative",
}));

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 1000,
  backgroundColor: "#fff",
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  marginTop: theme.spacing(1),
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

const SearchBox = ({ updateListMapping }) => {
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (keyword, type) => {
    try {
      const params = {
        keyword,
        type,
      };
      const { data } = await Api.searchByKeyword(params);
      return data.data;
    } catch (error) {
      toast.error("Error when search");
    }
  };

  const debounceFetchProducts = useCallback(
    debounce(async (keyword , type) => {
      switch (type) {
        case 'product':
          if (keyword.trim()) {
            const dataProducts = await handleSearch(keyword, "product");
            if (dataProducts) {
              setFilteredProducts(dataProducts);
            } else {
              toast.error("Search error");
              setFilteredProducts([]);
            }
          } else {
            setFilteredProducts([]);
          }
          break;
        case 'category': 
          if (keyword.trim()) {
            const dataCategories = await handleSearch(keyword, "category");
            if (dataCategories) {
              setFilteredCategories(dataCategories);
            } else {
              toast.error("Search error");
              setFilteredCategories([]);
            }
          } else {
            setFilteredCategories([]);
          }
          break;
        default:
          break;
      }
    }, 500),
    []
  );

  useEffect(() => {
    debounceFetchProducts(productSearch, "product");
  }, [productSearch]);

  useEffect(() => {
    debounceFetchProducts(categorySearch, "category");
  }, [categorySearch]);

  const handleCategoryClick = (category) => {
    const isInSelectedArr = selectedCategories.find(
      (item) => item.id === category.id
    );
    if (!isInSelectedArr) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setCategorySearch("");
  };

  const handleProductClick = (product) => {
    const isInSelectedArr = selectedProducts.find(
      (item) => item.id === product.id
    );
    if (!isInSelectedArr) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch("");
  };

  const handleDeleteCategory = (categoryToDelete) => {
    setSelectedCategories(
      selectedCategories.filter((category) => category !== categoryToDelete)
    );
  };

  const handleDeleteProduct = (productToDelete) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product !== productToDelete)
    );
  };

  const handleCategoryKeyDown = (event) => {
    if (event.key === "Enter" && filteredCategories.length > 0) {
      handleCategoryClick(filteredCategories[0]);
      event.preventDefault();
    }
  };

  const handleProductKeyDown = (event) => {
    if (event.key === "Enter" && filteredProducts.length > 0) {
      handleProductClick(filteredProducts[0]);
      event.preventDefault();
    }
  };

  const handleAddCategories = async () => {
    setIsLoading(true);
    if (selectedCategories.length <= 0) {
      toast.error("Select category first!");
      setIsLoading(false);
      return false;
    }

    try {
      const addedIds = [];
      const prepareRequestData = selectedCategories.map((item) => {
        const categoryInfo = {
          items_id: item.id,
          mapping_type: "category",
        };
        addedIds.push(categoryInfo);
      });
      const params = {
        categories: addedIds,
      };
      const { data } = await Api.addSupportCategories(params);
      if (!data) {
        toast.error("Can not add categories!");
        setIsLoading(false);
        return false;
      }
      if (data.status != "success") {
        toast.error(data.message);
        setIsLoading(false);
        return false;
      }
      toast.success("Add categories successfully!");
      setSelectedCategories([]);
      updateListMapping();
    } catch (error) {
      toast.error("Can not add categories!");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleAddProducts = async () => {
    setIsLoading(true);

    if (selectedProducts.length <= 0) {
      toast.error("Select product first!");
      setIsLoading(false);
      return false;
    }

    try {
      const addedIds = [];
      const prepareRequestData = selectedProducts.map((item) => {
        const productInfo = {
          items_id: item.id,
          mapping_type: "product",
        };
        addedIds.push(productInfo);
      });
      const params = {
        products: addedIds,
      };
      const { data } = await Api.addSupportProducts(params);

      if (!data) {
        setIsLoading(false);
        toast.error("Can not add categories!");
        return false;
      }

      if (data.status != "success") {
        setIsLoading(false);
        toast.error(data.message);
        return false;
      }

      toast.success("Add products successfully!");
      setSelectedProducts([]);
      updateListMapping();
    } catch (error) {
      toast.error("Can not add products!");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const tooltipAddProducts = `The products you add will be supported for booking.`;
  const tooltipAddCategories = `When you add categories, all products within that category will also be supported for booking.`;

  return (
    <Container disableGutters maxWidth={"xxxl"} className="custom-mui">
      <Box py={4}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <StyledPaper>
              <SearchContainer>
                <TextField
                  fullWidth
                  onKeyDown={handleCategoryKeyDown}
                  label="Search Categories"
                  variant="outlined"
                  placeholder="Type to search..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
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
                {categorySearch && (
                  <SuggestionsContainer>
                    <List>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                          <ListItemButton
                            key={index}
                            divider={index !== filteredCategories.length - 1}
                            onClick={() => handleCategoryClick(category)}
                          >
                            <ListItemText primary={category.name} />
                          </ListItemButton>
                        ))
                      ) : (
                        <ListItemButton>
                          <ListItemText
                            primary="No categories found"
                            sx={{ color: "text.secondary" }}
                          />
                        </ListItemButton>
                      )}
                    </List>
                  </SuggestionsContainer>
                )}
              </SearchContainer>
              <Grid container spacing={3} alignItems={"end"}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <ChipContainer>
                    {selectedCategories.map((category, index) => (
                      <Chip
                        key={index}
                        label={category.name}
                        onDelete={() => handleDeleteCategory(category)}
                      />
                    ))}
                  </ChipContainer>
                </Grid>
                <Grid
                  display={"flex"}
                  justifyContent={"end"}
                  size={{ xs: 12, lg: 4 }}
                  textAlign={"end"}
                  alignItems={"center"}
                  gap={1}
                >
                  <Button
                    className="btn-hover-float"
                    sx={{ fontSize: "12px" }}
                    onClick={handleAddCategories}
                    variant="contained"
                    disabled={isLoading}
                    startIcon={<FiPlus />}
                  >
                    Add Categories
                  </Button>
                  <Tooltip title={tooltipAddCategories}>
                    <IconButton size="small" sx={{ p: 0, mb: 0.5 }}>
                      <BsFillQuestionCircleFill role="button" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <StyledPaper>
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
              <Grid container spacing={3} alignItems={"end"}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <ChipContainer>
                    {selectedProducts.map((product, index) => (
                      <Chip
                        key={index}
                        label={product.name}
                        onDelete={() => handleDeleteProduct(product)}
                      />
                    ))}
                  </ChipContainer>
                </Grid>
                <Grid
                  display={"flex"}
                  justifyContent={"end"}
                  size={{ xs: 12, lg: 4 }}
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
                  <Tooltip title={tooltipAddProducts}>
                    <IconButton size="small" sx={{ p: 0, mb: 0.5 }}>
                      <BsFillQuestionCircleFill role="button" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SearchBox;
