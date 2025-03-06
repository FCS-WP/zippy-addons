import React from "react";
import { Select, MenuItem, CircularProgress } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import { blue, orange, green, red } from "@mui/material/colors";

const StatusSelect = ({ currentStatus, onStatusChange, isLoading }) => {
  const handleChange = (event) => {
    const newStatus = event.target.value;
    onStatusChange(newStatus);
  };

  const getStatusStyles = (status) => {
    const colors = {
      pending: {
        background: orange[200],
        text: orange[800],
        border: orange[200],
      },
      completed: {
        background: green[200],
        text: green[800],
        border: green[200],
      },
      approved: {
        background: blue[200],
      text: blue[800],
      border: blue[200],
    },
    cancelled: {
        background: red[200],
        text: red[800],
        border: red[200],
      },
    };

    return (
      colors[status] || {
        background: "inherit",
        text: "inherit",
        border: "inherit",
      }
    );
  };

  const { background, text, border } = getStatusStyles(currentStatus);

  return (
    <FormControl sx={{ width: "100%", position: "relative" }}>
      <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
        <Select
          value={currentStatus}
          onChange={handleChange}
          size="small"
          disabled={isLoading}
          sx={{
            flexGrow: 1,
            backgroundColor: isLoading
              ? "rgba(255, 255, 255, 0.7)"
              : background,
            color: isLoading ? "rgba(0, 0, 0, 0.38)" : text,
            borderColor: border,
            borderWidth: 1,
            borderStyle: "solid",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: border,
            },
            "&.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.38)",
              borderColor: "rgba(0, 0, 0, 0.12)",
            },
          }}
          variant="outlined"
        >
          <MenuItem key={"pending"} value={"pending"}>
            Pending
          </MenuItem>
          <MenuItem key={"completed"} value={"completed"}>
            Completed
          </MenuItem>
          <MenuItem key={"approved"} value={"approved"}>
            Approved
          </MenuItem>
          <MenuItem key={"cancelled"} value={"cancelled"}>
            Cancelled
          </MenuItem>
        </Select>
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <CircularProgress size={16} />
          </Box>
        )}
      </Box>
    </FormControl>
  );
};

export default StatusSelect;
