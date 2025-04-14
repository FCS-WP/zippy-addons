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
import theme from "../../../../theme/theme";

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
  className = "",
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
    <TableRow className={className} sx={{backgroundColor: "#f9f9f9",  border: "none" }}>
      <TableCell />
      {/* From - To TimePickers in one TableCell */}
      <TableCell colSpan={2} sx={{ width: "40%" }}>
        <Box display="flex" alignItems="center" justifyContent="start" gap={1}>
          <Box sx={{ border: "1px solid", borderRadius: "5px" , borderColor:theme.palette.info.main }}>
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
          <Box sx={{  border: "1px solid", borderRadius: "5px" , borderColor:theme.palette.info.main  }}>
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
          <Box display="flex" alignItems="center" gap={1} >
            <TextField
              type="number"
              size="small"
              placeholder="Slot"
              value={
                typeof slot.delivery_slot !== "undefined"
                  ? slot.delivery_slot
                  : tempDeliveryText[day] || ""
              }
              onChange={(e) =>
                handleDeliveryTimeChange(
                  day,
                  slotIndex,
                  "delivery_slot",
                  e.target.value
                )
              }
              sx={{ flexGrow: 1 , border: "1px solid", borderRadius: "5px" , borderColor:theme.palette.info.main }}
              className="delivery-slot-input"
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
