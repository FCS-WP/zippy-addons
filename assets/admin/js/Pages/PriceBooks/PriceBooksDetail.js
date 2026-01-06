import React, { useState, useEffect, useCallback } from "react";
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
  Switch,
  Chip,
  Alert,
  Tooltip,
} from "@mui/material";
import TableView from "../../Components/TableView";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
// Assuming these are available
import { priceBooksAPI } from "../../api/priceBooks";
import ProductRuleFormModal from "./Modals/ProductRuleFormModal";
import { rulesColumns } from "./data";
import Loading from "../../Components/Loading";
import { NavLink } from "react-router";
import { generalAPI } from "../../api/general";
import BulkImportModal from "./Modals/BulkImportModal";
import { dateToSGT } from "../../utils/dateHelper";

const getPriceBookIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  return id === "new" ? "new" : id && !isNaN(Number(id)) ? Number(id) : null;
};

const INITIAL_INFO = {
  name: "New Price Book",
  role: "customer",
  start_date: new Date(),
  end_date: null,
  status: "active",
};


const PriceBookDetails = () => {
  const priceBookId = getPriceBookIdFromUrl();
  const isEditMode = priceBookId !== "new";

  const [info, setInfo] = useState(INITIAL_INFO);
  const [isEditInfo, setEditInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null); // Data for editing
  const [loadingRules, setLoadingRules] = useState(isEditMode); // Loading rules initially

  const [role, setRole] = useState([]);

  const fetchRules = useCallback(async (id) => {
    if (!id || id === "new") {
      setLoadingRules(false);
      return;
    }
    setLoadingRules(true);
    try {
      const response = await priceBooksAPI.getProductRules(id);
      setRules(response.data?.data || []);
    } catch (error) {
      toast.error("Failed to load product rules.");
      console.error("Fetch Rules Error:", error);
      setRules([]);
    } finally {
      setLoadingRules(false);
    }
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const response = await priceBooksAPI.getPriceBook(priceBookId);
        const fetchedData = response.data?.data;

        if (fetchedData) {
          setInfo({
            ...fetchedData,
            start_date: fetchedData.start_date
              ? new Date(fetchedData.start_date)
              : null,
            end_date: fetchedData.end_date
              ? new Date(fetchedData.end_date)
              : null,
            role: fetchedData.role_id,
          });
          // Fetch rules immediately after details load
          await fetchRules(priceBookId);
          await fetchUserRole();
        } else {
          toast.error("Price Book not found.");
        }
      } catch (error) {
        toast.error("Failed to load Price Book details.");
        console.error("Fetch Details Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isEditMode, priceBookId, fetchRules, fetchUserRole]);

  const fetchUserRole = useCallback(async () => {
    try {
      const { data } = await generalAPI.getAvailableRoles();
      if (data?.status === "success" && Array.isArray(data?.data)) {
        setRole(data.data);
      } else {
        setRole([]);
        setError(
          "Could not fetch user role. API returned an unsuccessful status."
        );
      }
    } catch (error) {}
  });

  const handleInfoChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
    setEditInfo(true);
  };

  const handleDateChange = (date, name) => {
    setInfo({ ...info, [name]: date });
    setEditInfo(true);
  };

  const handleOpenAddModal = () => {
    setRuleToEdit(null); // Ensure Add mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ruleData) => {
    setRuleToEdit(ruleData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRuleToEdit(null);
  };

  const handleBulkImportCloseModal = () => {
    setIsBulkModalOpen(false);
  };

  const handleOpenBulkImportModal = () => {
    setIsBulkModalOpen(true);
  };

  const handleToggleChange = (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
          ? 1
          : 0
        : e.target.value;
    const name = e.target.name;

    if (name === "status") {
      setInfo({ ...info, status: e.target.checked ? "active" : "inactive" });
    } else {
      setInfo({ ...info, [name]: value });
    }
    setEditInfo(true);
  };

  const handleSaveRule = async (dataPayload) => {
    setLoadingRules(true);
    const { rule_id, ...dataToSend } = dataPayload;

    try {
      let response;
      if (rule_id) {
        response = await priceBooksAPI.updateProductRule(
          priceBookId,
          rule_id,
          dataToSend
        );
        toast.success(
          response?.data.message || `Rule ID ${rule_id} updated successfully!`
        );
      } else {
        response = await priceBooksAPI.createProductRule(
          priceBookId,
          dataToSend
        );
        toast.success("Product Rule added successfully!");
      }

      // After successful save, refresh the rule list and close
      await fetchRules(priceBookId);
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save product rule.");
      console.error("Save Rule Error:", error);
    } finally {
      setLoadingRules(false);
    }
  };

  // Handler to delete a product rule
  const handleDeleteRule = useCallback(
    async (ruleId) => {
      if (
        !window.confirm("Are you sure you want to delete this product rule?")
      ) {
        return;
      }
      try {
        await priceBooksAPI.deleteProductRule(priceBookId, ruleId);
        toast.success("Rule deleted successfully.");
        await fetchRules(priceBookId); // Refresh the rules table
      } catch (error) {
        toast.error("Failed to delete product rule.");
        console.error("Delete Rule Error:", error);
      }
    },
    [priceBookId, fetchRules]
  );

  // --- TABLE MAPPING LOGIC ---
  const mapRulesToTable = useCallback(
    (rulesData) => {
      return rulesData.map((rule, index) => ({
        NO: index + 1,
        ID: rule.rule_id, // Use rule_id from the backend response
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
            : `$${rule.price_value}`,
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
            <Button
              startIcon={<ModeEditOutlineIcon />}
              size="small"
              onClick={() => handleOpenEditModal(rule)}
            ></Button>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteRule(rule.rule_id)}
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        ),
      }));
    },
    [handleDeleteRule]
  );

  if (isLoading) {
    return (
      <Container sx={{ mt: 5 }}>
        <Loading message={"Loading Price Book details..."} />;
      </Container>
    );
  }

  const isReadyToSave = info.name && info.role && info.start_date;

  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      const dataToSubmit = {
        ...info,
        start_date: dateToSGT(info.start_date, "yyyy-MM-dd"),
        end_date: dateToSGT(info.end_date, "yyyy-MM-dd"),
        role: info.role,
      };

      let response;
      if (isEditMode) {
        response = await priceBooksAPI.updatePriceBook(
          priceBookId,
          dataToSubmit
        );
      } else {
        response = await priceBooksAPI.createPriceBook(dataToSubmit);

        if (response.data?.data?.id) {
          toast.success(
            response.data.data.message || "Price Book created successfully!"
          );
          window.location.href = `/wp-admin/admin.php?page=price_books&id=${response.data.data.id}`;
          return;
        }
      }

      toast.success(
        response.data?.data?.message || "Price Book saved successfully!"
      );
      setInfo({ ...info, name: dataToSubmit.name });
    } catch (error) {
      const errorMessage = "Failed to save Price Book.";
      toast.error(errorMessage);
      console.error("Save Info Error:", error);
    } finally {
      setIsSaving(false);
      setEditInfo(false);
    }
  };

  const handleBulkImport = async () => {
    await fetchRules(priceBookId);
  };

  return (
    <Container maxWidth={false} sx={{ mt: 3, mb: 5 }}>
      <ToastContainer position="top-center" autoClose={2000} />

      {/* HEADER SECTION */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa", borderRadius: 2 }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Button
              startIcon={<KeyboardBackspaceIcon />}
              component={NavLink}
              to="/wp-admin/admin.php?page=price_books"
              sx={{ mb: 1, p: 0 }}
            >
              Back to List
            </Button>
            <Typography variant="h4" fontWeight="700">
              {isEditMode ? info.name : "New Price Book"}
            </Typography>
            <Stack direction="row" spacing={1} mt={1} alignItems="center">
              <Chip
                label={info.status.toUpperCase()}
                color={info.status === "active" ? "success" : "default"}
                size="small"
              />
              {info.is_exclusive === 1 && (
                <Chip
                  label="EXCLUSIVE CATALOG"
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
              )}
              {isEditMode && (
                <Typography variant="caption">ID: #{priceBookId}</Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSaveInfo}
              disabled={isSaving || !isReadyToSave || !isEditInfo}
              sx={{ px: 4, borderRadius: 2 }}
            >
              {isSaving
                ? "Saving..."
                : isEditMode
                ? "Update Details"
                : "Create Price Book"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* SETTINGS GRID */}
      <Grid container spacing={3}>
        {/* Left: General Info Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              1. Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="name"
                  value={info.name}
                  onChange={handleInfoChange}
                  placeholder="Example: Wholesale Winter Sale"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Applied User Role</InputLabel>
                  <Select
                    name="role"
                    value={info.role}
                    onChange={handleInfoChange}
                    label="Applied User Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    {role.map((r) => (
                      <MenuItem key={r.slug} value={r.slug}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  selected={info.start_date}
                  onChange={(date) => handleDateChange(date, "start_date")}
                  customInput={
                    <TextField
                      fullWidth
                      label="Starts"
                      InputLabelProps={{ shrink: true }}
                    />
                  }
                  dateFormat="dd/MM/yyyy"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  selected={info.end_date}
                  onChange={(date) => handleDateChange(date, "end_date")}
                  customInput={
                    <TextField
                      fullWidth
                      label="Ends"
                      InputLabelProps={{ shrink: true }}
                    />
                  }
                  dateFormat="dd/MM/yyyy"
                  minDate={info.start_date}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right: Behavior Switches */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              bgcolor: info.is_exclusive ? "#fff5f8" : "#fff",
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              2. Behavior
            </Typography>

            <Stack spacing={3}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle2">Active Status</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toggle price book availability
                  </Typography>
                </Box>
                <Switch
                  name="status"
                  checked={info.status === "active"}
                  onChange={handleToggleChange}
                  color="success"
                />
              </Box>

              <Divider />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle2">Exclusive Mode</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Restrict catalog to these rules
                  </Typography>
                </Box>
                <Switch
                  name="is_exclusive"
                  checked={info.is_exclusive == 1}
                  onChange={handleToggleChange}
                  color="secondary"
                />
              </Box>

              {info.is_exclusive === 1 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Target users will ONLY see products listed in the table below.
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* PRODUCT RULES SECTION */}
      {isEditMode && (
        <Box sx={{ mt: 6 }}>
          <Paper sx={{ p: 0, overflow: "hidden" }}>
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "#fcfcfc",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Product Rules
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage individual product prices and visibility
                </Typography>
              </Box>
              <Box display={"flex"} gap={1}>
                {/* Import */}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpenBulkImportModal}
                  size="large"
                >
                  Bulk Import
                </Button>
                {/* Add */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddModal}
                  size="large"
                >
                  Add Product
                </Button>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ p: 2 }}>
              {loadingRules ? (
                <Loading message="Fetching rules..." />
              ) : rules.length === 0 ? (
                <Box textAlign="center" py={5}>
                  <Typography variant="h6" color="text.disabled">
                    No Product Rules Defined
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Start adding products to this price book to see them listed
                    here.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddModal}
                  >
                    Add Your First Product
                  </Button>
                </Box>
              ) : (
                <TableView
                  className="price-book-details-table"
                  hideCheckbox={true}
                  cols={rulesColumns}
                  rows={mapRulesToTable(rules)}
                />
              )}
            </Box>
          </Paper>
        </Box>
      )}

      <ProductRuleFormModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        initialRuleData={ruleToEdit}
        onSave={handleSaveRule}
      />
      <BulkImportModal
        open={isBulkModalOpen}
        handleClose={handleBulkImportCloseModal}
        priceBookId={priceBookId}
        onComplete={handleBulkImport}
      />
    </Container>
  );
};

export default PriceBookDetails;
