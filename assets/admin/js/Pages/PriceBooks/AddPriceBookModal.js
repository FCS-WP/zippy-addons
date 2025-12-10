// AddPriceBookModal.jsx

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
} from "@mui/material";
import DatePicker from "react-datepicker";

import { MOCK_ROLES } from "./data";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AddPriceBookModal = ({ open, handleClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    startDate: null,
    endDate: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, name) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.endDate ? formData.endDate.toISOString() : null,
    };

    onSave(dataToSave);
    setFormData({ name: "", role: "", startDate: null, endDate: null });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-price-book-title"
    >
      <Paper sx={modalStyle}>
        <Typography
          id="add-price-book-title"
          variant="h6"
          component="h2"
          sx={{ mb: 2 }}
        >
          Add New Price Book
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Price Book Name */}
            <TextField
              fullWidth
              label="Price Book Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* Target User Role */}
            <FormControl fullWidth required>
              <InputLabel id="role-select-label">Target User Role</InputLabel>
              <Select
                labelId="role-select-label"
                label="Target User Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                {MOCK_ROLES.map((role) => (
                  <MenuItem key={role.slug} value={role.slug}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Start Date */}
            <FormControl fullWidth>
              <InputLabel shrink>Start Date</InputLabel>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                customInput={<TextField fullWidth />} // Use MUI TextField as custom input
                dateFormat="MM/dd/yyyy"
                placeholderText="Select start date"
                isClearable
              />
            </FormControl>

            {/* End Date */}
            <FormControl fullWidth>
              <InputLabel shrink>End Date</InputLabel>
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                customInput={<TextField fullWidth />} // Use MUI TextField as custom input
                dateFormat="MM/dd/yyyy"
                placeholderText="Select end date"
                isClearable
                minDate={formData.startDate}
              />
            </FormControl>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 3 }}
          >
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formData.name || !formData.role}
            >
              Save & Define Products
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Modal>
  );
};

export default AddPriceBookModal;
