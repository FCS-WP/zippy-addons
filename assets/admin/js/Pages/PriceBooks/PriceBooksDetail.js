import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Stack,
  Box,
  TextField,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import TableView from "../../Components/TableView";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DatePicker from "react-datepicker";
import AddProductRuleModal from "./Modals/AddProductRuleModal";
import { format } from "date-fns";

import { MOCK_ROLES, columnWidths } from "./data";

const MOCK_DETAIL_DATA = {
  id: 1,
  name: "Wholesale Q4 2025",
  role: "wholesale_customer",
  startDate: new Date("2025-10-01T00:00:00Z"), // Dates as JS objects for DatePicker
  endDate: new Date("2025-12-31T23:59:59Z"),
  status: "active",
  rules: [
    {
      product_id: 54,
      product_name: "Product A - Large Widget",
      price_type: "fixed",
      price_value: 75.0,
      visibility: "show",
    },
    {
      product_id: 68,
      product_name: "Product B - Small Gizmo",
      price_type: "percent_off",
      price_value: 15.0,
      visibility: "show",
    },
    {
      product_id: 101,
      product_name: "Product C - Restricted Item",
      price_type: "fixed",
      price_value: 12.99,
      visibility: "hide",
    },
  ],
};

// --- Product Rules Table Columns ---
const rulesColumns = [
  "PRODUCT NAME",
  "PRICING METHOD",
  "PRICE/VALUE",
  "VISIBILITY",
  "",
];

const PriceBookDetails = (priceBooksId) => {
  // State for the Price Book container information
  const [info, setInfo] = useState(MOCK_DETAIL_DATA);
  // State for the list of product rules
  const [rules, setRules] = useState(MOCK_DETAIL_DATA.rules);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const [openRuleModal, setOpenRuleModal] = useState(false);

  const handleOpenRuleModal = () => setOpenRuleModal(true);
  const handleCloseRuleModal = () => setOpenRuleModal(false);

  // In a real app, useEffect fetches MOCK_DETAIL_DATA based on URL ID
  useEffect(() => {
    // 1. Get ID from URL query string (e.g., window.location.search)
    // 2. Fetch data from /wp-json/your-plugin/v1/pricebooks/1
    console.log(`Fetching details for Price Book ID: ${info.id}`);
  }, [info.id]);

  const handleSaveProductRule = (newRuleData) => {
    console.log("New Rule Data received, ready to save to API:", newRuleData);

    // 1. TODO: API call to POST data to the wp_pricebook_product_relations table

    // 2. Mock: Add new rule to state immediately for visual feedback
    const newRule = {
      product_id: newRuleData.productId,
      product_name: newRuleData.product_name,
      price_type: newRuleData.priceType,
      price_value: newRuleData.priceValue,
      visibility: newRuleData.visibility,
    };
    setRules([...rules, newRule]);

    handleCloseRuleModal();
  };
  // Handle changes to the main Price Book info (Name, Role, Dates)
  const handleInfoChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, name) => {
    setInfo({ ...info, [name]: date });
  };

  const mapRulesToTable = (rulesData) => {
    return rulesData.map((rule) => ({
      ID: rule.product_id,
      "PRODUCT NAME": rule.product_name,
      "PRICING METHOD":
        rule.price_type === "fixed"
          ? "Fixed Price"
          : rule.price_type === "percent_off"
          ? "Percent Off"
          : rule.price_type,
      "PRICE/VALUE":
        rule.price_type === "percent_off"
          ? `${rule.price_value}%`
          : `$${rule.price_value.toFixed(2)}`,
      VISIBILITY: (
        <span
          style={{
            color: rule.visibility === "hide" ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {rule.visibility.toUpperCase()}
        </span>
      ),
      "": (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => console.log("Edit Rule:", rule.product_id)}
          >
            <ModeEditOutlineIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => console.log("Delete Rule:", rule.product_id)}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      ),
    }));
  };

  const handleSaveInfo = () => {
    setIsSavingInfo(true);
    // TODO: API call to update wp_pricebook_containers
    console.log("Saving container info:", info);
    setTimeout(() => setIsSavingInfo(false), 1000);
  };

  // Placeholder for product rule table widths
  const rulesColumnWidths = {
    "PRODUCT NAME": "auto",
    "PRICING METHOD": "15%",
    "PRICE/VALUE": "15%",
    VISIBILITY: "10%",
    "": "10%",
  };

  return (
    <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
      {/* --- SECTION 1: HEADER & CONTAINER INFO --- */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {`Editing Price Book: ${info.name}`}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage core details and the list of included product rules.
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveInfo}
            disabled={isSavingInfo}
          >
            {isSavingInfo ? "Saving..." : "Save Price Book Info"}
          </Button>
        </Box>
      </Stack>

      <Paper elevation={1} sx={{ p: 4, mb: 5 }}>
        <Typography variant="h6" gutterBottom>
          Price Book's Info
        </Typography>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Price Book Name"
              name="name"
              value={info.name}
              onChange={handleInfoChange}
            />
          </Grid>

          {/* Role */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Target User Role</InputLabel>
              <Select
                labelId="role-select-label"
                label="Target User Role"
                name="role"
                value={info.role}
                onChange={handleInfoChange}
              >
                {MOCK_ROLES.map((role) => (
                  <MenuItem key={role.slug} value={role.slug}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="start-date-picker">
                Start Date
              </InputLabel>
              <DatePicker
                id="start-date-picker"
                selected={info.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                customInput={
                  <TextField
                    fullWidth
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                  />
                }
                dateFormat="dd/MM/yyyy"
                isClearable
              />
            </FormControl>
          </Grid>

          {/* End Date */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="end-date-picker">
                End Date
              </InputLabel>
              <DatePicker
                id="end-date-picker"
                selected={info.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                customInput={
                  <TextField
                    fullWidth
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                  />
                }
                dateFormat="dd/MM/yyyy"
                isClearable
                minDate={info.startDate}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* --- SECTION 2: PRODUCT RULES MANAGEMENT --- */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Product Pricing Rules
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Product Rules Header/Add Button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Total Products in this Price Book: {rules.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenRuleModal}
        >
          Add Product Rule
        </Button>
      </Stack>

      {/* Product Rules Table */}
      <Box sx={{ mt: 3 }}>
        <TableView
          hideCheckbox={true}
          cols={rulesColumns}
          columnWidths={rulesColumnWidths}
          rows={mapRulesToTable(rules)}
          className="table-pricebook-rules"
        />
      </Box>
      <AddProductRuleModal
        open={openRuleModal}
        handleClose={handleCloseRuleModal}
        onSave={handleSaveProductRule}
      />
    </Container>
  );
};

export default PriceBookDetails;
