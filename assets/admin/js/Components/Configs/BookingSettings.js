import React from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Paper,
  Button,
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
