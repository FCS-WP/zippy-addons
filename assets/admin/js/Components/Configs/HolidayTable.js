import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CustomeDatePicker from "../DatePicker/CustomeDatePicker";

const HolidayTable = ({
  holidays,
  handleHolidayChange,
  handleRemoveHoliday,
  handleAddHoliday,
}) => {
  return (
    <TableContainer
      component={Paper}
      style={{ marginTop: "20px" }}
      className="holiday-table"
    >
      <Typography
        variant="h6"
        gutterBottom
        style={{
          padding: "16px",
          backgroundColor: "#f9f9f9",
          marginBottom: "0px",
        }}
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
          {holidays && holidays.length > 0 ? (
            holidays.map((holiday, index) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography>No holidays added</Typography>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={3} align="center">
              <IconButton color="success" onClick={() => handleAddHoliday()}>
                <AddCircleOutlineIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HolidayTable;
