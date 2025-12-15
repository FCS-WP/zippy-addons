import React, { useState, useEffect, useCallback } from "react";
import { Container, Typography, Button, Stack, Box, Chip } from "@mui/material";
import TableView from "../../Components/TableView";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { NavLink } from "react-router";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../../Components/Loading";

import AddPriceBookModal from "./Modals/AddPriceBookModal";
import { MOCK_ROLES, priceBooksColumns, columnWidths } from "./data";
import { priceBooksAPI } from "../../api/priceBooks";

const constructEditUrl = (id) => {
  const baseUrl = "?page=price_books";
  return baseUrl + "&id=" + id;
};

const getRoleDisplayName = (slug) => {
  const role = MOCK_ROLES.find((r) => r.slug === slug);
  return role ? role.name : slug;
};

const getStatusChipProps = (statusLabel) => {
  switch (statusLabel) {
    case "Upcoming":
      return { label: statusLabel, color: "warning", variant: "outlined" };
    case "Ongoing":
      return { label: statusLabel, color: "success", variant: "filled" };
    case "Expired":
      return { label: statusLabel, color: "error", variant: "outlined" };
    default:
      return { label: statusLabel, color: "default", variant: "filled" };
  }
};

const handleConvertData = (rows) => {
  return rows.map((value) => ({
    ID: value.id,
    NAME: value.name,
    ROLE: getRoleDisplayName(value.role_id),
    "START DATE": value.start_date
      ? format(new Date(value.start_date), "MMM dd, yyyy")
      : "N/A",
    "END DATE": value.end_date
      ? format(new Date(value.end_date), "MMM dd, yyyy")
      : "N/A",
    STATUS: <Chip size="small" {...getStatusChipProps(value.status_label)} />,
    "": (
      <NavLink to={constructEditUrl(value.id)}>
        <Button startIcon={<ModeEditOutlineIcon />} size="small">
          Edit
        </Button>
      </NavLink>
    ),
  }));
};

const PriceBooks = () => {
  const [priceBooks, setPriceBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  //fetch data
  const fetchPriceBooks = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await priceBooksAPI.getPriceBooks();
      const apiData = response.data?.data || [];

      if (apiData.length > 0) {
        const convertedData = handleConvertData(apiData);
        setPriceBooks(convertedData);
      } else {
        setPriceBooks([]);
      }
    } catch (error) {
      console.error("API Error: Cannot get Price Books:", error);
      toast.error("Failed to load Price Books data.");
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSavePriceBook = async (params) => {
    setIsCreating(true);
    try {
      const response = await priceBooksAPI.createPriceBook(params);
      const { id, message } = response.data?.data || {};

      if (id) {
        toast.success(message || "Price Book created successfully.");
        await fetchPriceBooks();
        handleClose();
      } else {
        toast.error(
          response.error?.message || "Creation successful, but missing Price Book ID."
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Cannot create Price Book due to a server error.";
      toast.error(errorMessage);
      console.error("Price Book Creation Failed:", error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchPriceBooks();
  }, [fetchPriceBooks]);

  const renderContent = () => {
    if (isLoading) {
      return <Loading message={"Loading Price Books..."} />;
    }
    if (hasError) {
      return (
        <Typography color="error">
          An error occurred while fetching data. Please check the console.
        </Typography>
      );
    }
    if (priceBooks.length === 0) {
      return (
        <Typography
          variant="subtitle1"
          sx={{ mt: 5, p: 3, border: "1px dashed #ccc" }}
        >
          No Price Books found. Click "Add Price Book" to create your first one.
        </Typography>
      );
    }

    return (
      <TableView
        hideCheckbox={true}
        cols={priceBooksColumns}
        columnWidths={columnWidths}
        rows={priceBooks}
        className="table-priceBook"
      />
    );
  };

  return (
    <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
      {/* Header and Add Button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Price Books Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Define role-specific pricing and product visibility rules.
          </Typography>
        </Box>
        <Box>
          <Button variant="contained" onClick={handleOpen} disabled={isLoading}>
            Add Price Book
          </Button>
        </Box>
      </Stack>

      {/* Table Section */}
      <Box sx={{ mt: 5 }}>{renderContent()}</Box>

      {/* The Add Price Book Modal */}
      <AddPriceBookModal
        open={openModal}
        handleClose={handleClose}
        onSave={handleSavePriceBook}
        isSaving={isCreating}
      />
      <ToastContainer />
    </Container>
  );
};

export default PriceBooks;
