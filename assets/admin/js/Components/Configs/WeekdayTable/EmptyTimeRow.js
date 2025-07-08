import React from "react";
import { TableCell, TableRow, IconButton , Typography} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const EmptyTimeRow = ({ day, handleAddTimeSlot , disabled }) => (
  <TableRow>
    <TableCell><Typography fontWeight="bold" fontSize="14px">{day}</Typography></TableCell>
    <TableCell colSpan={2} width={"40%"}></TableCell>
    <TableCell></TableCell>
    <TableCell>
      <IconButton onClick={() => handleAddTimeSlot(day) } disabled={disabled}>
        <AddCircleOutlineIcon color="primary" />
      </IconButton>
    </TableCell>
  </TableRow>
);

export default EmptyTimeRow;
