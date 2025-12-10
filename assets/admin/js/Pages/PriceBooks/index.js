import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Stack, Box } from "@mui/material";
import TableView from "../../Components/TableView";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { format } from "date-fns";
import AddPriceBookModal from "./AddPriceBookModal";
import {
  MOCK_API_DATA,
  MOCK_ROLES,
  priceBooksColumns,
  columnWidths,
} from "./data";

const getRoleDisplayName = (slug) => {
  const role = MOCK_ROLES.find((r) => r.slug === slug);
  return role ? role.name : slug;
};

const handleConvertData = (rows) => {
  return rows.map((value) => ({
    ID: value.id,
    NAME: value.name,
    ROLE: getRoleDisplayName(value.role),
    "START DATE": value.start_date
      ? format(new Date(value.start_date), "MMM dd, yyyy")
      : "N/A",
    "END DATE": value.end_date
      ? format(new Date(value.end_date), "MMM dd, yyyy")
      : "N/A",
    STATUS: (
      <span style={{ color: value.status === "active" ? "green" : "red" }}>
        {value.status.toUpperCase()}
      </span>
    ),
    "": (
      <Button
        startIcon={<ModeEditOutlineIcon />}
        size="small"
        onClick={() => console.log(`Edit Price Book ID: ${value.id}`)}
      >
        Edit
      </Button>
    ),
  }));
};
const PriceBooks = () => {
  const [priceBooks, setPriceBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  // Handles the data submitted from the modal
  const handleSavePriceBook = (data) => {
    console.log("Received data from modal, ready to save to API:", data);
    // 1. CallAPI
    // 2. On success, refetch the priceBooks list
    handleClose();
  };

  // Data Fetching logic
  useEffect(() => {
    // Call api
    setTimeout(() => {
      const convertedData = handleConvertData(MOCK_API_DATA);
      setPriceBooks(convertedData);
      setIsLoading(false);
    }, 1000);
  }, []);

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
          <Button variant="contained" onClick={handleOpen}>
            Add Price Book
          </Button>
        </Box>
      </Stack>

      {/* Table Section */}
      <Box sx={{ mt: 5 }}>
        {isLoading ? (
          <Typography>Loading Price Books...</Typography>
        ) : (
          <TableView
            hideCheckbox={true}
            cols={priceBooksColumns}
            columnWidths={columnWidths}
            rows={priceBooks}
            className="table-priceBook"
          />
        )}
      </Box>

      {/* The Add Price Book Modal */}
      <AddPriceBookModal
        open={openModal}
        handleClose={handleClose}
        onSave={handleSavePriceBook}
      />
    </Container>
  );
};

export default PriceBooks;
