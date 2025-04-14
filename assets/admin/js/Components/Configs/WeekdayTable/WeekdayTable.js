import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import theme from "../../../../theme/theme";
import TimeSlotRow from "./TimeSlotRow";
import EmptyTimeRow from "./EmptyTimeRow";

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
  handleAddDeliveryTimeSlot,
  duration,
  disabled = false,
}) => {
  const [tempDeliveryText, setTempDeliveryText] = useState({});

  const tableHeadCellStyle = {
    fontWeight: 600,
    color: theme.palette.text.primary,
    width: "20%",
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
          transition: "opacity 0.3s ease",
        }}
      >
        <TableContainer
          component={Paper}
          className="weekday-table"
          sx={{
            border: "1px solid",
            borderBottom: "none",
            borderColor: theme.palette.info.main,
            boxSizing: "border-box",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.info.main }}>
              <TableRow sx={{ borderColor: theme.palette.primary.main }}>
                <TableCell sx={{ ...tableHeadCellStyle, width: "20%" }}>
                  Day
                </TableCell>
                <TableCell
                  sx={{ ...tableHeadCellStyle, width: "40%" }}
                  colSpan={2}
                >
                  Time
                </TableCell>
                <TableCell sx={{ ...tableHeadCellStyle, width: "30%" }}>
                  Delivery
                </TableCell>
                <TableCell
                  sx={{ ...tableHeadCellStyle, width: "10%" }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedule.map((item, dayIndex) => (
                <React.Fragment key={dayIndex}>
                  {item.slots.length === 0 ? (
                    <EmptyTimeRow
                      day={item.day}
                      handleAddTimeSlot={handleAddTimeSlot}
                      disabled={disabled}
                    />
                  ) : (
                    item.slots.map((slot, slotIndex) => (
                      <TimeSlotRow
                        key={slotIndex}
                        item={item}
                        slot={slot}
                        slotIndex={slotIndex}
                        duration={duration}
                        handleTimeChange={handleTimeChange}
                        handleRemoveTimeSlot={handleRemoveTimeSlot}
                        deliveryTimeEnabled={deliveryTimeEnabled}
                        handleDeliveryToggle={handleDeliveryToggle}
                        deliverySlots={
                          deliveryTimeSlots.find((d) => d.day === item.day)
                            ?.slots || []
                        }
                        handleDeliveryTimeChange={handleDeliveryTimeChange}
                        handleRemoveDeliveryTimeSlot={
                          handleRemoveDeliveryTimeSlot
                        }
                        tempDeliveryText={tempDeliveryText}
                        setTempDeliveryText={setTempDeliveryText}
                        handleAddDeliveryTimeSlot={handleAddDeliveryTimeSlot}
                        disabled={disabled}
                      />
                    ))
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Overlay to show visually that it's disabled */}
      {disabled && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255, 255, 255, 0.5)",
            zIndex: 2,
            borderRadius: 1,
          }}
        />
      )}
    </Box>
  );
};

export default WeekdayTable;
