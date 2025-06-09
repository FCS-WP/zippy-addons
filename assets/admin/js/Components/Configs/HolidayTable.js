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
import theme from "../../../theme/theme";

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
          backgroundColor: theme.palette.info.main,
          marginBottom: "0px",
        }}
        fontWeight={600}
      >
        Holiday Settings
      </Typography>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.info.main }}>
            <TableCell width="45%"><Typography>Label</Typography></TableCell>
            <TableCell width="45%"><Typography>Date</Typography></TableCell>
            <TableCell width="10%"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holidays && holidays.length > 0 ? (
            holidays.map((holiday, index) => (
              <TableRow key={index}>
                <TableCell className="holiday-label" width="45%">
                  <TextField
                    value={holiday.label}
                    onChange={(e) =>
                      handleHolidayChange(index, "label", e.target.value)
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell className="holiday-date" width="45%">
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
                <TableCell width="10%">
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
              <IconButton color="primary" onClick={() => handleAddHoliday()}>
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
