import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
  Tooltip,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TimePicker from "../../DatePicker/TimePicker";
import { parseTime } from "../../../utils/dateHelper";
import DeliverySlotRow from "./DeliverySlotRow";
import theme from "../../../../theme/theme";

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
  setCopySlots,
  pasteDeliveryTimeSlots,
}) => {
  const hasSubrows = !!deliveryTimeEnabled[item.day];

  const handleCopy = () => {
    setCopySlots({
      day: item.day,
      slots: deliverySlots,
    });
  };

  const handlePaste = () => {
    pasteDeliveryTimeSlots(item.day);
  };

  return (
    <>
      {/* Main Time Slot Row - with conditional class if subrows exist */}
      <TableRow
        className={hasSubrows ? "has-subrow" : ""}
        sx={{ borderRadius: "8px" }}
      >
        <TableCell sx={{ width: "20%" }}>
          <Typography fontWeight="bold" fontSize="14px">
            {item.day}
          </Typography>
        </TableCell>

        <TableCell colSpan={2} width={"40%"}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="start"
            gap={1}
          >
            <Box
              sx={{
                border: "1px solid ",
                borderRadius: "5px",
                borderColor: theme.palette.info.main,
              }}
            >
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
            <Box
              sx={{
                border: "1px solid",
                borderRadius: "5px",
                borderColor: theme.palette.info.main,
              }}
            >
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
          {/* Remove btn */}
          <IconButton onClick={() => handleRemoveTimeSlot(item.day, slotIndex)}>
            <RemoveCircleOutlineIcon color="error" />
          </IconButton>
          {/* Copy btn */}
          <Tooltip title="Copy" arrow placement="top">
            <IconButton onClick={handleCopy} sx={{ color: "#1976d2" }}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          {/* Paste btn */}
          <Tooltip title="Paste" arrow placement="top">
            <IconButton onClick={handlePaste} sx={{ color: "#1976d2" }}>
              <ContentPasteIcon />
            </IconButton>
          </Tooltip>
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
              setCopySlots={setCopySlots}
            />
          );
        })}
    </>
  );
};

export default TimeSlotRow;
