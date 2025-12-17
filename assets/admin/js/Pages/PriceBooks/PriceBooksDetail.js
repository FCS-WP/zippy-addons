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

const formatDateForAPI = (date) => {
  return date ? format(date, "yyyy-MM-dd") : null;
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
      return rulesData.map((rule) => ({
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
        start_date: formatDateForAPI(info.start_date),
        end_date: formatDateForAPI(info.end_date),
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

  return (
    <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
      <ToastContainer position="top-center" autoClose={3000} />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Box display="flex" alignItems="center" mb={2}>
            <KeyboardBackspaceIcon sx={{ mr: 1 }} />
            <NavLink to={"/wp-admin/admin.php?page=price_books"}>
              <Typography variant="body1" color="text.primary">
                Back to Price Books
              </Typography>
            </NavLink>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {isEditMode
                ? `Editing Price Book: ${info.name}`
                : "Create New Price Book"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode
                ? `ID: ${priceBookId}`
                : "Enter the core information for your new Price Book."}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveInfo}
            disabled={isSaving || !isReadyToSave || !isEditInfo}
          >
            {isSaving
              ? "Saving..."
              : isEditMode
              ? "Save Changes"
              : "Create Price Book"}
          </Button>
        </Box>
      </Stack>

      {/* Price Book's Info Form */}
      <Paper elevation={1} sx={{ p: 4, mb: 5 }}>
        <Typography variant="h6" gutterBottom>
          Price Book's Info
        </Typography>
        <Grid container spacing={3}>
          {/* ... (Form fields: Name, Role, Dates) ... */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Price Book Name"
              name="name"
              value={info.name}
              onChange={handleInfoChange}
            />
          </Grid>
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
                {role.map((role) => (
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
                selected={info.start_date}
                onChange={(date) => handleDateChange(date, "start_date")}
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
                selected={info.end_date}
                onChange={(date) => handleDateChange(date, "end_date")}
                customInput={
                  <TextField
                    fullWidth
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                  />
                }
                dateFormat="dd/MM/yyyy"
                isClearable
                minDate={info.start_date}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Product Pricing Rules Section (Only visible in Edit Mode) */}
      {isEditMode && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Product Pricing Rules
          </Typography>
          <Divider sx={{ mb: 3 }} />

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
              // Use the consolidated handler for opening the modal
              onClick={handleOpenAddModal}
            >
              Add Product Rule
            </Button>
          </Stack>

          <Box sx={{ mt: 3 }}>
            {loadingRules ? (
              <Typography>Loading rules...</Typography>
            ) : (
              <TableView
                className="price-book-details"
                hideCheckbox={true}
                cols={rulesColumns}
                rows={mapRulesToTable(rules)}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Product Rule Form Modal (Used for both Add and Edit) */}
      <ProductRuleFormModal
        open={isModalOpen} // Consolidated state
        handleClose={handleCloseModal} // Consolidated handler
        initialRuleData={ruleToEdit}
        onSave={handleSaveRule}
      />
    </Container>
  );
};

export default PriceBookDetails;
