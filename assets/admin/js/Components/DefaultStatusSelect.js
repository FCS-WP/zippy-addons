import React from "react";
import { Box, Select, MenuItem, Typography } from "@mui/material";

const DefaultStatusSelect = ({ status, onChange }) => {
  return (
    <Box mb={1}>
      <Select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        size="small"
      >
        <MenuItem key="pending" value="pending">
          Pending
        </MenuItem>
        <MenuItem key="approved" value="approved">
          Approved
        </MenuItem>
      </Select>
    </Box>
  );
};

export default DefaultStatusSelect;
