// ProductRuleFormModal.jsx (Corrected Version)

import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { priceBooksAPI } from "../../../api/priceBooks";

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
    product_id: initialData?.product_id || 0,
    price_value: initialData?.price_value?.toString() || "",
    price_type: initialData?.price_type || "fixed",
    visibility: initialData?.visibility || "show",
  };
};

const ProductRuleFormModal = ({
  open,
  handleClose,
  onSave,
  initialRuleData,
}) => {
  const paramsSyncedRef = useRef(false);

  const isEditing = !!initialRuleData?.rule_id;

  const [formData, setFormData] = useState(() =>
    initializeFormData(initialRuleData)
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [params, setParams] = useState({
    category: "",
    search: "",
  });

  const handleFilter = useCallback((filter) => {
    setParams((prev) => ({
      ...prev,
      ...filter,
    }));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!open) return;
    try {
      const { data } = await priceBooksAPI.getAllProducts(params);
      if (data?.status === "success" && Array.isArray(data?.data)) {
        setProducts(data.data);
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
    const { name, value } = e.target;
    let newValue = value;

    if (name === "product_id" && value !== 0 && value !== "") {
      newValue = parseInt(value, 10);
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationError = "";
    const priceValueNumber = parseFloat(formData.price_value);

    if (formData.product_id === 0) {
      // Check against 0 for the default numeric value
      validationError = "Please select a product.";
    } else if (!formData.price_value || isNaN(priceValueNumber)) {
      validationError = "Please enter a valid price value.";
    } else if (
      formData.price_type === "percent_off" &&
      (priceValueNumber < 0 || priceValueNumber > 100)
    ) {
      validationError = "Percentage discount must be between 0 and 100.";
    }

    if (validationError) {
      alert(validationError);
      return;
    }

    const product = products.find((p) => p.id == formData.product_id);
    const productName = product
      ? product.name
      : `Product ID: ${formData.product_id}`;

    const dataToSave = {
      rule_id: initialRuleData?.rule_id || null,
      ...formData,
      product_name: productName,
      price_value: priceValueNumber, // Use the parsed number
    };

    onSave(dataToSave);

    handleClose();
  };

  useEffect(() => {
    if (open) {
      setFormData(initializeFormData(initialRuleData));
      paramsSyncedRef.current = true;

      let newParams = {
        category: "",
        search: "",
      };

      if (isEditing && initialRuleData.product_id) {
        newParams.include_id = initialRuleData.product_id;
      } else {
        newParams.include_id = undefined;
      }

      setParams((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(newParams)) {
          paramsSyncedRef.current = false;
          return prev;
        }
        return newParams;
      });
    }
  }, [initialRuleData, open, isEditing]);

  useEffect(() => {
    if (open) {
      if (paramsSyncedRef.current) {
        paramsSyncedRef.current = false;
        fetchProducts();
      } else if (
        paramsSyncedRef.current === false &&
        !isEditing &&
        initialRuleData?.id === undefined
      ) {
        fetchProducts();
      }
    }
  }, [open, params, fetchProducts, isEditing, initialRuleData]);

  const isPercentage = formData.price_type === "percent_off";

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
          fontWeight="bold"
          sx={{ mb: 3 }}
        >
          {isEditing ? "Edit Product Rule" : "Add Product Rule to Price Book"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography
              variant="subtitle1"
              sx={{ mt: 1, mb: -2 }}
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
                name="product_id"
                value={formData.product_id}
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
                          SKU: {product.sku}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))
                )}
                {isEditing &&
                  formData.product_id !== 0 &&
                  !products.find((p) => p.id == formData.product_id) && (
                    <MenuItem value={formData.product_id} disabled>
                      Selected ID: {formData.product_id} (External)
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
                    name="price_type"
                    value={formData.price_type}
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
                  name="price_value"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  value={formData.price_value}
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
