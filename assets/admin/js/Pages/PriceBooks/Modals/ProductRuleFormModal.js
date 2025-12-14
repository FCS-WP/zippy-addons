// ProductRuleFormModal.jsx (Corrected Version)

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
  CircularProgress,
  Alert,
} from "@mui/material";

import ProductFilterbyCategories from "../../../Components/Products/ProductFilterByCategories";
import { generalAPI } from "../../../api/general";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 650 },
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const initializeFormData = (initialData) => {
  return {
    productId: initialData?.productId || 0,
    priceValue: initialData?.priceValue?.toString() || "",
    priceType: initialData?.priceType || "fixed",
    visibility: initialData?.visibility || "show",
  };
};

const ProductRuleFormModal = ({
  open,
  handleClose,
  onSave,
  initialRuleData,
}) => {
  const isEditing = !!initialRuleData?.id;

  // FIX 1A: Use the functional updater form for state initialization
  const [formData, setFormData] = useState(() =>
    initializeFormData(initialRuleData)
  );

  // ... (products, loading, error states remain the same)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [params, setParams] = useState({
    page: 1,
    items: 10,
    category: "",
    userID: userSettings.uid,
    search: "",
    include_id: undefined, // Explicitly handle the new ID param
  });

  const handleFilter = useCallback((filter) => {
    setParams((prev) => ({
      ...prev,
      ...filter,
      page: 1,
    }));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!open) return;

    try {
      console.log(params);
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
  }, [params, open]); // Dependencies are correct here

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "productId" && value !== 0 && value !== "") {
      newValue = parseInt(value, 10);
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationError = "";
    const priceValueNumber = parseFloat(formData.priceValue);

    if (formData.productId === 0) {
      // Check against 0 for the default numeric value
      validationError = "Please select a product.";
    } else if (!formData.priceValue || isNaN(priceValueNumber)) {
      validationError = "Please enter a valid price value.";
    } else if (
      formData.priceType === "percent_off" &&
      (priceValueNumber < 0 || priceValueNumber > 100)
    ) {
      validationError = "Percentage discount must be between 0 and 100.";
    }

    if (validationError) {
      alert(validationError);
      return;
    }

    const product = products.find((p) => p.id === formData.productId);
    const productName = product
      ? product.name
      : `Product ID: ${formData.productId}`;

    const dataToSave = {
      ruleId: initialRuleData?.id || null,
      ...formData,
      product_name: productName,
      priceValue: priceValueNumber, // Use the parsed number
    };

    if (isEditing) {
      onSave(initialRuleData.id, dataToSave);
    } else {
      onSave(dataToSave);
    }

    handleClose();
  };

  useEffect(() => {
    if (open) {
      console.log(initialRuleData);
      setFormData(initializeFormData(initialRuleData));

      if (isEditing && initialRuleData.product_id) {
        setParams((prev) => ({
          ...prev,
          page: 1,
          category: "",
          search: "",
          include_id: initialRuleData.product_id, // Include the current product ID
        }));
      } else {
        // Add Mode:
        setParams((prev) => ({
          ...prev,
          page: 1,
          category: "",
          search: "",
          include_id: undefined,
        }));
      }
    }
  }, [initialRuleData, open, isEditing]);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, params, fetchProducts]);

  const isPercentage = formData.priceType === "percent_off";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="product-rule-title"
    >
      <Paper sx={modalStyle}>
        <Typography
          id="product-rule-title"
          variant="h6"
          component="h2"
          sx={{ mb: 3 }}
        >
          {isEditing ? "Edit Product Rule" : "Add Product Rule to Price Book"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography
              variant="subtitle1"
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
                endAdornment={loading && <CircularProgress size={20} />}
              >
                {/* Default/Placeholder Item */}
                <MenuItem value={0} disabled>
                  Select a Product
                </MenuItem>

                {/* Render fetched products */}
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
                {isEditing &&
                  formData.productId !== 0 &&
                  !products.find((p) => p.id === formData.productId) && (
                    <MenuItem value={formData.productId} disabled>
                      Selected ID: {formData.productId} (External)
                    </MenuItem>
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
              sx={{ mt: 3, mb: -1 }}
              fontWeight="bold"
            >
              Pricing Rule
            </Typography>
            <Grid container display="flex" gap={2} wrap="nowrap">
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
                {isEditing ? "Update Rule" : "Save Rule"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Modal>
  );
};

export default ProductRuleFormModal;
