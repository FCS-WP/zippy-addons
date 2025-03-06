import {
  Box,
  Container,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";

const FilterContainer = ({ handleFilterDate, handleFilterStatus }) => {
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "approved", label: "Approved" },
  ];

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setStatus(value);
    handleFilterStatus(value);
  };

  const onChangeDates = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    handleFilterDate(dates);
  };

  return (
    <Box>
      <Stack
        className="filter-container"
        direction={{ xs: "column", sm: "row" }}
        justifyContent={"space-between"}
        flexWrap={"wrap"}
        gap={2}
      >
        <Box className="status-filter" sx={{ minWidth: 330, width: { xs: "100%", sm: "48%" } }}>
          <Select
            color="success"
            value={status}
            onChange={handleStatusChange}
            displayEmpty
            fullWidth
            sx={{ height: "40px" }}
            aria-label="Status filter"
          >
            <MenuItem value="">
              <em>Select Status</em>
            </MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box className="date-filter" sx={{ minWidth: 330, width: { xs: "100%", sm: "48%" } }}>
          <DatePicker
            width={"100%"}
            selected={startDate}
            onChange={onChangeDates}
            startDate={startDate}
            endDate={endDate}
            customInput={
              <TextField
                size="small"
                label="Select Date"
                fullWidth
                sx={{ width: "100%" }}
                color="success"
              />
            }
            dateFormat="MMMM d, yyyy"
            selectsRange
            isClearable
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default FilterContainer;
