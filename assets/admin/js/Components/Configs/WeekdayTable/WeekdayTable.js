import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import theme from "../../../../theme/theme";
import TimeSlotRow from "./TimeSlotRow";
import EmptyTimeRow from "./EmptyTimeRow";

const WeekdayTable = ({
  schedule,
  handleAddTimeSlot,
  handleTimeChange,
  handleRemoveTimeSlot,
  duration,
  disabled = false,
}) => {
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
              <TableRow>
                <TableCell sx={tableHeadCellStyle}>Day</TableCell>
                <TableCell sx={{ ...tableHeadCellStyle }} colSpan={2}>
                  Time
                </TableCell>
                <TableCell sx={tableHeadCellStyle}>Slot</TableCell>
                <TableCell sx={tableHeadCellStyle}></TableCell>
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
                    item.slots.map((slot, slotIndex) => {
                      const isFirst = slotIndex === 0;
                      const isLast = slotIndex === item.slots.length - 1;
                      const hasSubrows = item.slots.length > 1;

                      const rowClass = isFirst
                        ? hasSubrows
                          ? "has-subrow"
                          : ""
                        : `sub-row ${isLast ? "sub-row--last" : ""}`;

                      return (
                        <TimeSlotRow
                          key={slotIndex}
                          item={item}
                          slot={slot}
                          className={rowClass}
                          slotIndex={slotIndex}
                          handleAddTimeSlot={handleAddTimeSlot}
                          duration={duration}
                          handleTimeChange={handleTimeChange}
                          handleRemoveTimeSlot={handleRemoveTimeSlot}
                          disabled={disabled}
                        />
                      );
                    })
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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
