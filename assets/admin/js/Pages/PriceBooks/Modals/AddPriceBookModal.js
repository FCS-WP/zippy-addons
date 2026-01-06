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
  Switch,
  Grid,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import { dateToSGT } from "../../../utils/dateHelper";
import { format } from "date-fns";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800, // Slightly wider for better grid spacing
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AddPriceBookModal = ({ open, handleClose, onSave, ruleData }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    start_date: null,
    end_date: null,
    is_exclusive: false,
    status: true, // Default to Active
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      status: formData.status ? "active" : "inactive",
      is_exclusive: formData.is_exclusive ? 1 : 0,
      start_date: dateToSGT(formData.start_date, "yyyy-MM-dd") || null,
      end_date: dateToSGT(formData.end_date, "yyyy-MM-dd") || null,
    };

    onSave(dataToSave);
    setFormData({
      name: "",
      role: "",
      start_date: null,
      end_date: null,
      is_exclusive: false,
      status: true,
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper sx={modalStyle}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Header with Status Badge */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="600">
              Create New Price Book
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Chip
                label={formData.status ? "ACTIVE" : "INACTIVE"}
                color={formData.status ? "success" : "default"}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
              <Switch
                name="status"
                checked={formData.status}
                onChange={handleToggleChange}
                color="success"
              />
            </Stack>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            {/* Section 1: General Info */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3} sx={{ paddingRight: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SettingsIcon color="action" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    General Settings
                  </Typography>
                </Stack>

                <TextField
                  fullWidth
                  label="Price Book Name"
                  name="name"
                  placeholder="e.g. VIP Summer Sale 2025"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Start Date</InputLabel>
                    <DatePicker
                      selected={formData.start_date}
                      onChange={(date) =>
                        setFormData({ ...formData, start_date: date })
                      }
                      customInput={<TextField fullWidth size="small" />}
                      dateFormat="dd/MM/yyyy"
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel shrink>End Date</InputLabel>
                    <DatePicker
                      selected={formData.end_date}
                      onChange={(date) =>
                        setFormData({ ...formData, end_date: date })
                      }
                      customInput={<TextField fullWidth size="small" />}
                      dateFormat="dd/MM/yyyy"
                      minDate={formData.start_date}
                    />
                  </FormControl>
                </Stack>
              </Stack>
            </Grid>

            {/* Section 2: Audience & Behavior */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{ borderLeft: { md: "1px solid #eee" } }}
            >
              <Stack spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PeopleIcon color="action" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Visibility & Audience
                  </Typography>
                </Stack>

                <FormControl fullWidth required size="small">
                  <InputLabel>Target User Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Target User Role"
                  >
                    <MenuItem value="all">
                      <em>All Users</em>
                    </MenuItem>
                    {ruleData.map((role) => (
                      <MenuItem key={role.slug} value={role.slug}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" direction="column">
                      <Typography variant="body2" fontWeight="bold">
                        Exclusive Catalog
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hide all other products
                      </Typography>
                    </Box>
                    <Switch
                      name="is_exclusive"
                      checked={formData.is_exclusive}
                      onChange={handleToggleChange}
                      color="secondary"
                    />
                  </Stack>
                  {formData.is_exclusive && (
                    <Alert
                      severity="warning"
                      icon={false}
                      sx={{ mt: 1, fontSize: "0.75rem" }}
                    >
                      Users will <b>only</b> see products assigned to this book.
                    </Alert>
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Box
            sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button onClick={handleClose} variant="text" color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!formData.name || !formData.role}
              sx={{ px: 4, borderRadius: 2 }}
            >
              Save & Define Products
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default AddPriceBookModal;
