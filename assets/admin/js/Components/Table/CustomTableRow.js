import { Checkbox, FormControlLabel, TableCell, TableRow } from "@mui/material";
import React from "react";
import theme from "../../../theme/theme";

const CustomTableRow = (props) => {
  const {
    hideCheckbox = false,
    hover,
    row,
    rowIndex,
    selectedRows,
    cols,
    columnWidths,
    onChangeCheckbox,
    isSubtableRow = false,
  } = props;
  return (
    <>
      <TableRow
        hover={hover}
        key={rowIndex}
        sx={{ borderColor: theme.palette.primary.main }}
      >
        {!isSubtableRow && !hideCheckbox && (
          <TableCell padding="checkbox" style={{ textAlign: "center" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedRows[rowIndex] || false}
                  onChange={() => onChangeCheckbox(rowIndex)}
                />
              }
              style={{ marginRight: 0 }}
            />
          </TableCell>
        )}
        {cols.map((col, colIndex) => (
          <TableCell
            key={colIndex}
            style={{ width: columnWidths[col] || "auto" }}
          >
            {row[col]}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};

export default CustomTableRow;
