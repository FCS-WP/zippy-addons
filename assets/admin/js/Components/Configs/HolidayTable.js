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
  Switch,
  Box,
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
  handleDeliveryToggle,
  handleTakeawayToggle,
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
            <TableCell width="30%">
              <Typography>Label</Typography>
            </TableCell>
            <TableCell width="40%">
              <Typography>Date</Typography>
            </TableCell>
            <TableCell width="10%">
              <Typography>Delivery</Typography>
            </TableCell>
            <TableCell width="10%">
              <Typography>Takeaway</Typography>
            </TableCell>
            <TableCell width="10%"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holidays && holidays.length > 0 ? (
            holidays.map(
              (holiday, index) => (
                console.log(holiday),
                (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        value={holiday.label}
                        onChange={(e) =>
                          handleHolidayChange(index, "label", e.target.value)
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
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
                      <Switch
                        className="custom-switch"
                        checked={holiday.delivery}
                        onChange={(e) => {
                          handleDeliveryToggle(index, e.target.checked);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        className="custom-switch"
                        checked={holiday.takeaway}
                        onChange={(e) =>
                          handleTakeawayToggle(index, e.target.checked)
                        }
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
                )
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography>No holidays added</Typography>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={5} align="center">
              <IconButton color="primary" onClick={handleAddHoliday}>
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
