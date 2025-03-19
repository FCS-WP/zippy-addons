import React from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";

const BookingSettings = ({
  duration,
  setDuration,
  storeEmail,
  setStoreEmail,
  holidayEnabled,
  setHolidayEnabled,
  setHolidays,
  loading,
  handleSaveChanges,
  stores,
  selectedStore,
  setSelectedStore,
}) => {
  return (
    <Box>
      {/* Select Store */}
      <Box mb={2}>
        <Typography variant="body1">Select Store</Typography>
        <Select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          fullWidth
          size="small"
          displayEmpty
        >
          <MenuItem value="" disabled>
            Please select a store
          </MenuItem>
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.outlet_name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Duration Selection */}
      <Box mb={1}>
        <Typography variant="body1">Duration</Typography>
        <Select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          fullWidth
          size="small"
        >
          {Array.from({ length: 4 }, (_, i) => (i + 1) * 15).map((option) => (
            <MenuItem key={option} value={option}>
              {option} minutes
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Set the duration of each booking session.
        </Typography>
      </Box>

      {/* Holiday Toggle */}
      <Box mt={2} mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={holidayEnabled}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setHolidayEnabled(isChecked);
                if (!isChecked) {
                  setHolidays([]);
                }
              }}
            />
          }
          label="Enable Holidays"
        />
        <Typography variant="body2" color="textSecondary">
          Toggle to enable or disable holiday settings.
        </Typography>
      </Box>

      {/* Save Button */}
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          disabled={loading}
          style={{
            borderRadius: "8px",
            padding: "13px 20px",
            textTransform: "none",
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
};

export default BookingSettings;
