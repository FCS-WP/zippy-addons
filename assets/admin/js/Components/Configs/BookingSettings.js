import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import theme from "../../../theme/theme";

const BookingSettings = ({
  duration,
  setDuration,
  holidayEnabled,
  setHolidayEnabled,
  setHolidays,
  loading,
  handleSaveChanges,
  stores,
  selectedStore,
  setSelectedStore,
  disabled,
  dayLimited,
  onChangeDayLimited
}) => {

  return (
    <Box component={Paper}>
      <Box mb={2}>
        <Typography variant="body1">Select Store</Typography>
        <Select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          fullWidth
          size="small"
          displayEmpty
          sx={{
            border: `1px solid ${theme.palette.info.main}`,
            borderRadius: 1,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
            },
          }}
          disabled={disabled}
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
          sx={{
            border: `1px solid ${theme.palette.info.main}`,
            borderRadius: 1,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
            },
          }}
          disabled={disabled}
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

      {/* Config time revert */}

      <Box mb={2}>
           <Typography variant="body1">Sales Window Period</Typography>
          <TextField 
            value={dayLimited}
            type="number"
            fullWidth
            onChange={(e)=>onChangeDayLimited(e.target.value)}
          />
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
              disabled={disabled}
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
          disabled={loading || disabled}
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
