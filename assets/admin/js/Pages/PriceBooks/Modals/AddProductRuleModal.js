// AddProductRuleModal.jsx

import React, { useState } from "react";
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
} from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 650,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const MOCK_PRODUCTS = [
  { id: 1, name: "Product A - Large Widget" },
  { id: 2, name: "Product B - Small Gizmo" },
  { id: 3, name: "Product C - Restricted Item" },
  { id: 4, name: "Product D - New Accessory" },
];

const AddProductRuleModal = ({ open, handleClose, onSave }) => {
  const [formData, setFormData] = useState({
    productId: "",
    priceType: "fixed", // Default to fixed price
    priceValue: "",
    visibility: "show", // Default to visible
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation check
    if (!formData.productId || !formData.priceValue) {
      alert("Please select a product and enter a price value.");
      return;
    }

    const product = MOCK_PRODUCTS.find((p) => p.id === formData.productId);
    const dataToSave = {
      ...formData,
      product_name: product ? product.name : "Unknown Product", // Add name for display confirmation
      priceValue: parseFloat(formData.priceValue), // Ensure value is a number
    };

    onSave(dataToSave);
    // Reset form data after submission
    setFormData({
      productId: "",
      priceType: "fixed",
      priceValue: "",
      visibility: "show",
    });
  };

  const isPercentage = formData.priceType === "percent_off";

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
            {/* 1. Product Selection */}
            <FormControl fullWidth required>
              <InputLabel id="product-select-label">Select Product</InputLabel>
              <Select
                labelId="product-select-label"
                label="Select Product"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
              >
                {MOCK_PRODUCTS.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Select the WooCommerce product to add to this Price Book.
              </Typography>
            </FormControl>

            {/* 2. Pricing Method and Value */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: -1 }}>
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
                    <MenuItem value="fixed">Fixed Price</MenuItem>
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
                />
              </Grid>
            </Grid>

            {/* 3. Visibility Rule */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: -1 }}>
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
                  label="Show (Product is visible to this role)"
                />
                <FormControlLabel
                  value="hide"
                  control={<Radio />}
                  label="Hide (Product is invisible to this role)"
                />
              </RadioGroup>
              <Typography variant="caption" color="text.secondary">
                If hidden, only users with this Price Book role can access this
                product.
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
