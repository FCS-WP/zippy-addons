import React from "react";
import {
  TableCell,
  TableRow,
  Box,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TimePicker from "../../DatePicker/TimePicker";
import { parseTime } from "../../../utils/dateHelper";

const DeliverySlotRow = ({
  day,
  slot,
  slotIndex,
  handleDeliveryTimeChange,
  handleRemoveDeliveryTimeSlot,
  deliveryTimeEnabled,
  tempDeliveryText,
  setTempDeliveryText,
  handleAddDeliveryTimeSlot,
}) => {
  const handleChange = (e) => {
    setTempDeliveryText((prev) => ({
      ...prev,
      [day]: e.target.value,
    }));
  };

  const handleAdd = () => {
    handleAddDeliveryTimeSlot(day, tempDeliveryText[day]);
    setTempDeliveryText((prev) => ({
      ...prev,
      [day]: "",
    }));
  };

  return (
    <TableRow style={{ border: "none", backgroundColor: "#f9f9f9" }}>
      <TableCell />

      {/* From - To TimePickers in one TableCell */}
      <TableCell colSpan={2} sx={{ width: "40%" }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Box sx={{ border: "1px solid #ccc", borderRadius: "5px" }}>
            <TimePicker
              selectedTime={parseTime(slot.from)}
              onChange={(time) =>
                handleDeliveryTimeChange(day, slotIndex, "from", time)
              }
              placeholderText="Delivery Time"
            />
          </Box>
          <Typography variant="body2" mx={1}>
            to
          </Typography>
          <Box sx={{ border: "1px solid #ccc", borderRadius: "5px" }}>
            <TimePicker
              selectedTime={parseTime(slot.to)}
              onChange={(time) =>
                handleDeliveryTimeChange(day, slotIndex, "to", time)
              }
              placeholderText="Delivery Time"
            />
          </Box>
        </Box>
      </TableCell>

      {/* Slot input + Add button */}
      {deliveryTimeEnabled[day] ? (
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              size="small"
              placeholder="Slot"
              value={tempDeliveryText[day] || ""}
              onChange={handleChange}
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={handleAdd}>
              <AddCircleOutlineIcon color="primary" />
            </IconButton>
          </Box>
        </TableCell>
      ) : (
        <TableCell />
      )}

      {/* Remove button */}
      <TableCell>
        <IconButton
          onClick={() => handleRemoveDeliveryTimeSlot(day, slotIndex)}
        >
          <RemoveCircleOutlineIcon color="error" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default DeliverySlotRow;
