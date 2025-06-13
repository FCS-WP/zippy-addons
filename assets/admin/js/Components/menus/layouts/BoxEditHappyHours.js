import React from "react";
import { Box, Button, Grid2, IconButton, Typography } from "@mui/material";
import TimeInput from "../inputs/TimeInput";
import DeleteIcon from "@mui/icons-material/Delete";
import { format, parse, isValid as isDateValid } from "date-fns";

const BoxEditHappyHours = ({ happyHours, setHappyHours, minDate, maxDate }) => {
  const validateTimeRange = (start, end) => {
    if (!start || !end) return false;
    try {
      const startDate = parse(start, "yyyy-MM-dd HH:mm", new Date());
      const endDate = parse(end, "yyyy-MM-dd HH:mm", new Date());
      return (
        isDateValid(startDate) && isDateValid(endDate) && endDate > startDate
      );
    } catch {
      return false;
    }
  };

  const handleChangeTime = (value, type, index) => {
    setHappyHours((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [type === "start" ? "start_time" : "end_time"]: value
          ? format(value, "yyyy-MM-dd HH:mm")
          : "",
      };
      return updated;
    });
  };

  const handleAddHappyHour = () => {
    setHappyHours((prev) => [...prev, { start_time: "", end_time: "" }]);
  };

  const handleDeleteHappyHour = (index) => {
    if (window.confirm("Are you sure you want to remove this time slot?")) {
      setHappyHours((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        Happy Hours
      </Typography>

      {happyHours.map((hh, index) => (
        <Grid2 container spacing={2} key={index} mt={1} align="center">
          <Grid2>
            <TimeInput
              label="Start Time"
              value={hh.start_time}
              onChange={(val) => handleChangeTime(val, "start", index)}
              error={!hh.start_time}
              minDate={minDate}
              maxDate={maxDate}
            />
          </Grid2>
          <Grid2>
            <TimeInput
              label="End Time"
              value={hh.end_time}
              onChange={(val) => handleChangeTime(val, "end", index)}
              error={!validateTimeRange(hh.start_time, hh.end_time)}
              minDate={minDate}
              maxDate={maxDate}
            />
          </Grid2>
          <Grid2>
            <IconButton onClick={() => handleDeleteHappyHour(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid2>
        </Grid2>
      ))}

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={handleAddHappyHour}>
          Add Time Slot
        </Button>
      </Box>
    </Box>
  );
};

export default BoxEditHappyHours;
