// AddProductRuleModal.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Stack,
  Box,
  Modal,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress, // Import for loading state
  Alert, // Import for displaying errors
} from "@mui/material";

// Assuming this component correctly handles filtering and provides callbacks
import ProductFilterbyCategories from "../../../Components/Products/ProductFilterByCategories";

import { generalAPI } from "../../../api/general";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 650 }, // Added responsiveness
  maxHeight: "90vh", // Added max height
  overflowY: "auto", // Added scroll
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AddProductRuleModal = ({ open, handleClose, onSave }) => {
  // Use null/empty string for initial state, reflecting lack of selection
  const [formData, setFormData] = useState({
    productId: "",
    priceType: "fixed",
    priceValue: "",
    visibility: "show",
  });

  // State for products fetched from the API
  const [products, setProducts] = useState([]);

  // State for API call loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for product search/pagination parameters
  const [params, setParams] = useState({
    page: 1,
    items: 10, // Increased items per page for better UX
    category: "",
    userID: userSettings.uid,
    search: "",
  });

  const handleFilter = useCallback((filter) => {
    setParams((prev) => ({
      ...prev,
      ...filter,
      page: 1, // Reset to page 1 on filter change
    }));
  }, []);

  /**
   * Fetch products with API call
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    if (!open) return;

    try {
      const { data } = await generalAPI.products(params);

      if (data?.status === "success" && Array.isArray(data.data?.data)) {
        setProducts(data.data.data);
      } else {
        setProducts([]);
        setError(
          "Could not fetch products. API returned an unsuccessful status."
        );
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setError("Failed to connect to the product API.");
    } finally {
      setLoading(false);
    }
  }, [params, open]);

  const handleChange = (e) => {
    console.log(e);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationError = "";

    if (!formData.productId) {
      validationError = "Please select a product.";
    } else if (!formData.priceValue || isNaN(parseFloat(formData.priceValue))) {
      validationError = "Please enter a valid price value.";
    } else if (
      formData.priceType === "percent_off" &&
      (parseFloat(formData.priceValue) < 0 ||
        parseFloat(formData.priceValue) > 100)
    ) {
      validationError = "Percentage discount must be between 0 and 100.";
    }

    if (validationError) {
      alert(validationError);
      return;
    }

    const product = products.find((p) => p.id === formData.productId);

    // Fallback to the product ID string if name is unavailable
    const productName = product
      ? product.name
      : `Product ID: ${formData.productId}`;

    const dataToSave = {
      ...formData,
      product_name: productName,
      priceValue: parseFloat(formData.priceValue), // Ensure value is a number
    };

    onSave(dataToSave);

    // Reset form data after submission
    setFormData({
      productId: 0,
      priceType: "fixed",
      priceValue: "",
      visibility: "show",
    });
    handleClose(); // Close modal on successful save
  };

  const isPercentage = formData.priceType === "percent_off";

  useEffect(() => {
    if (open) {
      // Only fetch when the modal is opened
      fetchProducts();
    }
  }, [fetchProducts, open]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-product-rule-title"
    >
      <Paper sx={modalStyle}>
        <Typography
          id="add-product-rule-title"
          variant="h6"
          component="h2"
          sx={{ mb: 3 }}
        >
          Add Product Rule to Price Book
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography
              variant="subtitle1"
              tup
              sx={{ mt: 3, mb: -1 }}
              fontWeight="bold"
            >
              Search Products
            </Typography>
            {/* 1. Product Filtering Component */}
            <ProductFilterbyCategories
              onFilter={handleFilter}
              className="price-book-search-product"
            />

            {/* Display error or loading state */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* 2. Product Selection */}
            <FormControl fullWidth required disabled={loading}>
              <InputLabel id="product-select-label">
                {loading ? "Loading Products..." : "Select Product"}
              </InputLabel>
              <Select
                labelId="product-select-label"
                label={loading ? "Loading Products..." : "Select Product"}
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                // Display loading spinner directly in the select if data is being fetched
                endAdornment={loading && <CircularProgress size={20} />}
              >
                {/* Fallback for empty results */}
                {products.length === 0 && !loading ? (
                  <MenuItem disabled>
                    No products found with current filters.
                  </MenuItem>
                ) : (
                  products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      <Stack direction="column">
                        <Typography variant="body2" fontWeight="bold">
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {product.id}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Select the WooCommerce product to add to this Price Book.
              </Typography>
            </FormControl>

            {/* 3. Pricing Method and Value */}
            <Typography
              variant="subtitle1"
              tup
              sx={{ mt: 3, mb: -1 }}
              fontWeight="bold"
            >
              Pricing Rule
            </Typography>
            <Grid container spacing={2}>
              {/* Pricing Method */}
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel id="price-type-label">Pricing Method</InputLabel>
                  <Select
                    labelId="price-type-label"
                    label="Pricing Method"
                    name="priceType"
                    value={formData.priceType}
                    onChange={handleChange}
                  >
                    <MenuItem value="fixed">Fixed Price (Override)</MenuItem>
                    <MenuItem value="percent_off">
                      Percentage Discount (%)
                    </MenuItem>
                    <MenuItem value="fixed_off">
                      Fixed Amount Discount ($)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Value */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={
                    isPercentage
                      ? "Discount Percentage (0-100)"
                      : "Custom Price or Discount Amount"
                  }
                  name="priceValue"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  value={formData.priceValue}
                  onChange={handleChange}
                  required
                  helperText={
                    isPercentage
                      ? "Value must be between 0 and 100"
                      : "Enter a price or discount amount"
                  }
                />
              </Grid>
            </Grid>

            {/* 4. Visibility Rule */}
            <Typography
              variant="subtitle1"
              sx={{ mt: 3, mb: -1 }}
              fontWeight="bold"
            >
              Visibility Rule
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="show"
                  control={<Radio />}
                  label="Show (Product is visible)"
                />
                <FormControlLabel
                  value="hide"
                  control={<Radio />}
                  label="Hide (Product is invisible, only for this role)"
                />
              </RadioGroup>
              <Typography variant="caption" color="text.secondary">
                If hidden, the product will only be visible to users assigned to
                the Price Book role associated with this rule.
              </Typography>
            </FormControl>

            {/* Action Buttons */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 3 }}
            >
              <Button onClick={handleClose} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Rule
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Modal>
  );
};

export default AddProductRuleModal;
