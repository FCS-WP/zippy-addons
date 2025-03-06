import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CustomeDatePicker from "../DatePicker/CustomeDatePicker";
import { toast } from "react-toastify";
import { Api } from "../../api";

const HolidayTable = ({
  holidays,
  handleHolidayChange,
  handleRemoveHoliday,
  handleAddHoliday,
}) => {
  const handleSaveHolidays = async () => {
    try {
      const data = holidays.map((holiday) => ({
        label: holiday.label,
        date: format(new Date(holiday.date), 'yyyy-MM-dd'),
      }));

      const response = await Api.createOptions({

        option_name: ["zippy_booking_holiday_config"],
        option_data: [data]
      });

      if (response.data.status === "success") {
        toast.success(response.data.message || "Holidays saved successfully!");
      } else {
        toast.error(response.data.message || "Error saving holidays.");
      }
    } catch (error) {
      console.error("Error saving holidays:", error);
      toast.error("Error saving holidays");
    }
  };

  return (
    <TableContainer
      component={Paper}
      style={{ marginTop: "20px" }}
      className="holiday-table"
    >
      <Typography
        variant="h6"
        gutterBottom
        style={{ padding: "16px", backgroundColor: "#f9f9f9",marginBottom:"0px" }}
      >
        Holiday Settings
      </Typography>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
            <TableCell>Label</TableCell>
            <TableCell>Date</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holidays.map((holiday, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  value={holiday.label}
                  onChange={(e) =>
                    handleHolidayChange(index, "label", e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </TableCell>
              <TableCell className="holiday-date">
                <CustomeDatePicker
                  startDate={holiday?.date ?? new Date()}
                  handleDateChange={(date) => 
                    handleHolidayChange(index, "date", date)
                  }
                  placeholderText="Select a date"
                  isClearable={true}
                  selectsRange={false}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveHoliday(index)}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} align="center">
              <IconButton color="success" onClick={() => handleAddHoliday()}>
                <AddCircleOutlineIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Box m={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveHolidays}
          style={{
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          Save Holidays
        </Button>
      </Box>
    </TableContainer>
  );
};

export default HolidayTable;
