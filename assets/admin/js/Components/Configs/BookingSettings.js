import React from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import DefaultStatusSelect from "../../Components/DefaultStatusSelect";

const BookingSettings = ({
  bookingType,
  handleBookingTypeChange,
  allowOverlap,
  setAllowOverlap,
  defaultStatus,
  handleDefaultStatusChange,
  duration,
  setDuration,
  storeEmail,
  setStoreEmail,
  holidayEnabled,
  setHolidayEnabled,
  setHolidays,
  loading,
  handleSaveChanges,
}) => {
  return (
    <Box>
      <Box>
        <Typography variant="body1">Booking Type</Typography>
        <RadioGroup
          row
          value={bookingType}
          onChange={(e) => handleBookingTypeChange(e.target.value)}
        >
          <FormControlLabel
            value="single"
            control={<Radio />}
            label="Single"
          />
          <FormControlLabel
            value="multiple"
            control={<Radio />}
            label="Multiple"
          />
        </RadioGroup>
      </Box>

      <Box mb={1}>
        <FormControlLabel
          control={
            <Switch
              checked={allowOverlap}
              onChange={(e) => setAllowOverlap(e.target.checked)}
            />
          }
          label="Allow Overlap"
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Enable this if you want multiple bookings to overlap.
        </Typography>
      </Box>

      <Box mb={1}>
        <DefaultStatusSelect
          status={defaultStatus}
          onChange={handleDefaultStatusChange}
        />
      </Box>

      <Box mb={1}>
        <Typography variant="body1">Duration</Typography>
        <Select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          fullWidth
          size="small"
        >
          {Array.from({ length: 36 }, (_, i) => (i + 1) * 5).map((option) => (
            <MenuItem key={option} value={option}>
              {option} minutes
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Set the duration of each booking session.
        </Typography>
      </Box>

      <Box mb={1}>
        <Typography variant="body1">Store Email</Typography>
        <TextField
          type="email"
          value={storeEmail}
          onChange={(e) => setStoreEmail(e.target.value)}
          size="small"
          fullWidth
        />
      </Box>

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
