import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import theme from "../../../../theme/theme";
import TimeSlotRow from "./TimeSlotRow";
import EmptyTimeRow from "./EmptyTimeRow";
import DeliverySlotRow from "./DeliverySlotRow";

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
}) => {
  const [tempDeliveryText, setTempDeliveryText] = useState({});
  const tableHeadCellStyle = {
    fontWeight: 600,
    color: theme.palette.text.primary,
    width: "20%",
  };
  return (
    <TableContainer component={Paper} className="weekday-table">
      <Table>
        <TableHead sx={{ backgroundColor: theme.palette.info.main }}>
          <TableRow sx={{ borderColor: theme.palette.primary.main }}>
            <TableCell sx={{ ...tableHeadCellStyle }}>Day</TableCell>
            <TableCell sx={{ ...tableHeadCellStyle, width: "60%" }} colSpan={2}>
              Time
            </TableCell>
            <TableCell sx={{ ...tableHeadCellStyle }}>Delivery</TableCell>
            <TableCell sx={{ ...tableHeadCellStyle }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((item, dayIndex) => (
            <React.Fragment key={dayIndex}>
              {item.slots.length === 0 ? (
                <EmptyTimeRow
                  day={item.day}
                  handleAddTimeSlot={handleAddTimeSlot}
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
                    deliverySlots={deliveryTimeSlots.find((d) => d.day === item.day)?.slots || []}
                    handleDeliveryTimeChange={handleDeliveryTimeChange}
                    handleRemoveDeliveryTimeSlot={handleRemoveDeliveryTimeSlot}
                    tempDeliveryText={tempDeliveryText}
                    setTempDeliveryText={setTempDeliveryText}
                    handleAddDeliveryTimeSlot={handleAddDeliveryTimeSlot}
                  />
                ))
                
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WeekdayTable;
