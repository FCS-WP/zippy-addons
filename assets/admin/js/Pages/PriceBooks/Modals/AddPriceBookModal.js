// AddPriceBookModal.jsx - Final Corrected UI

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
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { MOCK_ROLES } from "../data";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 750, // Optimal width for the two-column grid
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
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pricebook's Info
          </Typography>

          <Grid container spacing={3} mb={4}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name: Pricebook's name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {/* Placeholder for description */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                A short, descriptive name for this Price Book.
              </Typography>
            </Grid>

            {/* Start Date */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel shrink htmlFor="start-date-picker">
                  Start Date
                </InputLabel>
                <DatePicker
                  id="start-date-picker"
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, "startDate")}
                  customInput={<TextField fullWidth />}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  isClearable
                />
              </FormControl>
            </Grid>

            {/* End Date */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel shrink htmlFor="end-date-picker">
                  End Date
                </InputLabel>
                <DatePicker
                  id="end-date-picker"
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange(date, "endDate")}
                  customInput={<TextField fullWidth />}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  isClearable
                  minDate={formData.startDate}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Target Audience
          </Typography>
          <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Select the user role that this pricing and visibility will apply to.
          </Typography>

          <Grid container spacing={3}>
            {/* Target User Role */}
            <Grid item xs={6}>
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
            </Grid>
            {/* Empty spacer */}
            <Grid item xs={6}></Grid>
          </Grid>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mt: 5 }}
          >
            <Button
              onClick={handleClose}
              variant="text"
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Cancel
            </Button>

            {/* Save & Define Products Button (Primary Action) */}
            <Button
              type="submit"
              variant="contained"
              disabled={!formData.name || !formData.role}
              color="primary"
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
