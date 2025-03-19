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
  handleAddTimeSlot,
  handleTimeChange,
  handleRemoveTimeSlot,
  handleDeliveryToggle,
  deliveryTimeEnabled,
  deliveryTimeSlots,
  handleRemoveDeliveryTimeSlot,
  handleDeliveryTimeChange,
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
            <TableCell>Delivery</TableCell>
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
                  <TableCell></TableCell>
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

                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={deliveryTimeEnabled}
                            onChange={handleDeliveryToggle}
                          />
                        }
                      />
                    </TableCell>

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
              {/* Render delivery time slots if enabled */}
              {deliveryTimeEnabled &&
                deliveryTimeSlots
                  .find((delivery) => delivery.day === item.day)
                  ?.slots.map(
                    (slot, slotIndex) => (
                      (
                        <TableRow
                          key={`delivery-${dayIndex}-${slotIndex}`}
                          style={{ backgroundColor: "#f9f9f9" }}
                        >
                          <TableCell></TableCell>

                          {/* Delivery From Time Picker */}
                          <TableCell width={"30%"}>
                            <Box
                              sx={{
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                              }}
                            >
                              <TimePicker
                               selectedTime={parseTime(slot.from)}
                               onChange={(time) =>
                                 handleDeliveryTimeChange(item.day, slotIndex, "from", time)
                               }
                              />
                            </Box>
                          </TableCell>

                          {/* Delivery To Time Picker */}

                          <TableCell width={"30%"}>
                            <Box
                              sx={{
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                              }}
                            >
                              <TimePicker
                                selectedTime={parseTime(slot.to)}
                                onChange={(time) =>
                                  handleDeliveryTimeChange(item.day, slotIndex, "to", time)
                                }
                              />
                            </Box>
                          </TableCell>

                          <TableCell></TableCell>

                          {/* Remove Slot Button */}
                          <TableCell>
                            <IconButton
                              onClick={() =>
                                handleRemoveDeliveryTimeSlot(
                                  item.day,
                                  slotIndex
                                )
                              }
                            >
                              <RemoveCircleOutlineIcon color="error" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WeekdayTable;
