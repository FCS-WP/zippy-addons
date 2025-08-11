import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  IconButton,
  Typography,
  TextField,
  Tooltip,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TimePicker from "../../DatePicker/TimePicker";
import { parseTime } from "../../../utils/dateHelper";
import theme from "../../../../theme/theme";

const TimeSlotRow = ({
  item,
  slot,
  slotIndex,
  duration,
  className = "",
  handleTimeChange,
  handleRemoveTimeSlot,
  handleAddTimeSlot,
  disabled = false,
}) => {
  const isLast = slotIndex === item.slots.length - 1;

  const timePickerBoxStyle = {
    border: "1px solid",
    borderRadius: "5px",
    borderColor: theme.palette.info.main,
  };

  const inputBoxStyle = {
    ...timePickerBoxStyle,
    width: "100px",
  };

  return (
    <TableRow className={className} sx={{ borderRadius: "8px" }}>
      {/* Day column */}
      <TableCell sx={{ width: "20%" }}>
        {slotIndex === 0 && (
          <Typography fontWeight="bold" fontSize="14px">
            {item.day}
          </Typography>
        )}
      </TableCell>

      {/* Time column */}
      <TableCell colSpan={2} sx={{ width: "40%" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={timePickerBoxStyle}>
            <TimePicker
              selectedTime={slot.from ? parseTime(slot.from) : null}
              onChange={(time) =>
                handleTimeChange(item.day, slotIndex, "from", time)
              }
              duration={duration}
            />
          </Box>
          <Typography variant="body2" mx={1}>
            to
          </Typography>
          <Box sx={timePickerBoxStyle}>
            <TimePicker
              selectedTime={slot.to ? parseTime(slot.to) : null}
              onChange={(time) =>
                handleTimeChange(item.day, slotIndex, "to", time)
              }
              duration={duration}
            />
          </Box>
        </Box>
      </TableCell>

      {/* Slot input column */}
      <TableCell sx={{ width: "30%" }}>
        <Box sx={inputBoxStyle} className="slot-input">
          <TextField
            type="number"
            size="small"
            placeholder="Slot"
            value={slot.delivery_slot || ""}
            onChange={(e) =>
              handleTimeChange(
                item.day,
                slotIndex,
                "delivery_slot",
                e.target.value
              )
            }
            disabled={disabled}
            fullWidth
            InputProps={{
              sx: {
                "& fieldset": {
                  border: "none",
                },
                input: {
                  textAlign: "center",
                },
              },
            }}
          />
        </Box>
      </TableCell>

      {/* Add / Remove buttons */}
      <TableCell sx={{ width: "10%" }}>
        <Box display="flex" alignItems="center">
          <Tooltip title="Remove">
            <IconButton
              onClick={() => handleRemoveTimeSlot(item.day, slotIndex)}
              disabled={disabled}
            >
              <RemoveCircleOutlineIcon color="error" />
            </IconButton>
          </Tooltip>
          {isLast && (
            <Tooltip title="Add Time Slot">
              <IconButton
                onClick={() => handleAddTimeSlot(item.day)}
                disabled={disabled}
              >
                <AddCircleOutlineIcon color="primary" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default TimeSlotRow;
