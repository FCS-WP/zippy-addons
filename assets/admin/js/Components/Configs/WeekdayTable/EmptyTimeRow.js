import React from "react";
import { TableCell, TableRow, IconButton } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const EmptyTimeRow = ({ day, handleAddTimeSlot }) => (
  <TableRow>
    <TableCell>{day}</TableCell>
    <TableCell colSpan={2} width={"40%"}></TableCell>
    <TableCell></TableCell>
    <TableCell>
      <IconButton onClick={() => handleAddTimeSlot(day)}>
        <AddCircleOutlineIcon color="primary" />
      </IconButton>
    </TableCell>
  </TableRow>
);

export default EmptyTimeRow;
