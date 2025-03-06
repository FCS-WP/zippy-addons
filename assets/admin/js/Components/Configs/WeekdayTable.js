// WeekdayTable.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControlLabel,
  Switch,
  Box,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TimePicker from "../DatePicker/TimePicker";
import { parseTime } from "../../utils/dateHelper";

const WeekdayTable = ({
  schedule,
  bookingType,
  handleAddTimeSlot,
  handleTimeChange,
  handleRemoveTimeSlot,
  handleExtraTimeToggle,
  extraTimeEnabled,
  extraTimeSlots,
  handleAddExtraTimeSlot,
  handleRemoveExtraTimeSlot,
  handleExtraTimeChange,
  duration,
}) => {
  return (
    <TableContainer component={Paper} className="weekday-table">
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
            <TableCell>Day</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            {bookingType === "single" && <TableCell>Extra Time</TableCell>}
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((item, dayIndex) => (
            <React.Fragment key={dayIndex}>
              {item.slots.length === 0 ? (
                <TableRow>
                  <TableCell>{item.day}</TableCell>
                  <TableCell width={"30%"}></TableCell>
                  <TableCell width={"30%"}></TableCell>
                  {bookingType === "single" && <TableCell></TableCell>}
                  <TableCell>
                    <IconButton onClick={() => handleAddTimeSlot(item.day)}>
                      <AddCircleOutlineIcon color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ) : (
                item.slots.map((slot, slotIndex) => (
                  <TableRow key={slotIndex}>
                    <TableCell>{item.day}</TableCell>
                    <TableCell width={"30%"}>
                      <Box
                        sx={{ border: "1px solid #ccc", borderRadius: "5px" }}
                      >
                        <TimePicker
                          width={"100%"}
                          selectedTime={parseTime(slot.from)}
                          onChange={(time) =>
                            handleTimeChange(item.day, slotIndex, "from", time)
                          }
                          duration={duration}
                        />
                      </Box>
                    </TableCell>
                    <TableCell width={"30%"}>
                      <Box
                        sx={{
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                        }}
                      >
                        <TimePicker
                        width={"100%"}
                          selectedTime={parseTime(slot.to)}
                          onChange={(time) =>
                            handleTimeChange(item.day, slotIndex, "to", time)
                          }
                          duration={duration}
                        />
                      </Box>
                    </TableCell>
                    {bookingType === "single" && (
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={extraTimeEnabled[item.day] || false}
                              onChange={(e) =>
                                handleExtraTimeToggle(
                                  item.day,
                                  e.target.checked
                                )
                              }
                              disabled={bookingType === "multiple"}
                            />
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <IconButton
                        onClick={() =>
                          handleRemoveTimeSlot(item.day, slotIndex)
                        }
                      >
                        <RemoveCircleOutlineIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {/* Render extra time slots if enabled */}
              {extraTimeEnabled[item.day] &&
                extraTimeSlots
                  .find((extra) => extra.day === item.day)
                  ?.slots.map((slot, slotIndex) => (
                    <TableRow
                      key={`extra-${dayIndex}-${slotIndex}`}
                      style={{ backgroundColor: "#f9f9f9" }}
                    >
                      <TableCell></TableCell>
                      <TableCell width={"30%"}>
                        <Box
                          sx={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                          }}
                        >
                          <TimePicker
                          width={"100%"}
                            selectedTime={parseTime(slot.from)}
                            onChange={(time) =>
                              handleExtraTimeChange(
                                item.day,
                                slotIndex,
                                "from",
                                time
                              )
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell width={"30%"}>
                        <Box
                          sx={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                          }}
                        >
                          <TimePicker
                          width={"100%"}
                            selectedTime={parseTime(slot.to)}
                            onChange={(time) =>
                              handleExtraTimeChange(
                                item.day,
                                slotIndex,
                                "to",
                                time
                              )
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleAddExtraTimeSlot(item.day)}
                        >
                          <AddCircleOutlineIcon color="primary" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            handleRemoveExtraTimeSlot(item.day, slotIndex)
                          }
                        >
                          <RemoveCircleOutlineIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WeekdayTable;
