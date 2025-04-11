import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TimePicker from "../../DatePicker/TimePicker";
import { parseTime } from "../../../utils/dateHelper";
import DeliverySlotRow from "./DeliverySlotRow";

const TimeSlotRow = ({
  item,
  slot,
  slotIndex,
  duration,
  handleTimeChange,
  handleRemoveTimeSlot,
  deliveryTimeEnabled,
  handleDeliveryToggle,
  deliverySlots,
  handleDeliveryTimeChange,
  handleRemoveDeliveryTimeSlot,
  tempDeliveryText,
  setTempDeliveryText,
  handleAddDeliveryTimeSlot,
}) => {
  const hasSubrows = !!deliveryTimeEnabled[item.day];

  return (
    <>
      {/* Main Time Slot Row - with conditional class if subrows exist */}
      <TableRow
        className={hasSubrows ? "has-subrow" : ""}
        sx={{ borderRadius: "8px" }}
      >
        <TableCell sx={{ width: "20%" }}>{item.day}</TableCell>

        <TableCell colSpan={2} sx={{ width: "30%" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            <Box sx={{ border: "1px solid #ccc", borderRadius: "5px" }}>
              <TimePicker
                selectedTime={parseTime(slot.from)}
                onChange={(time) =>
                  handleTimeChange(item.day, slotIndex, "from", time)
                }
                duration={duration}
              />
            </Box>
            <Typography variant="body2" mx={1}>
              to
            </Typography>
            <Box sx={{ border: "1px solid #ccc", borderRadius: "5px" }}>
              <TimePicker
                selectedTime={parseTime(slot.to)}
                onChange={(time) =>
                  handleTimeChange(item.day, slotIndex, "to", time)
                }
                duration={duration}
              />
            </Box>
          </Box>
        </TableCell>

        <TableCell sx={{ width: "20%" }}>
          <FormControlLabel
            control={
              <Switch
                checked={hasSubrows}
                onChange={() => handleDeliveryToggle(item.day)}
              />
            }
          />
        </TableCell>

        <TableCell sx={{ width: "20%" }}>
          <IconButton onClick={() => handleRemoveTimeSlot(item.day, slotIndex)}>
            <RemoveCircleOutlineIcon color="error" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Sub-rows: delivery time slots */}
      {hasSubrows &&
        deliverySlots?.map((slot, index) => {
          const isLast = index === deliverySlots.length - 1;
          return (
            <DeliverySlotRow
              key={index}
              className={`delivery-sub-row ${
                isLast ? "delivery-sub-row--last" : ""
              }`}
              day={item.day}
              slot={slot}
              slotIndex={index}
              handleDeliveryTimeChange={handleDeliveryTimeChange}
              handleRemoveDeliveryTimeSlot={handleRemoveDeliveryTimeSlot}
              deliveryTimeEnabled={deliveryTimeEnabled}
              tempDeliveryText={tempDeliveryText}
              setTempDeliveryText={setTempDeliveryText}
              handleAddDeliveryTimeSlot={handleAddDeliveryTimeSlot}
            />
          );
        })}
    </>
  );
};

export default TimeSlotRow;
