import { Checkbox, FormControlLabel, TableCell, TableRow } from "@mui/material";
import React, { memo } from "react";

const CustomTableRow = memo(
  ({
    hover,
    row,
    rowIndex,
    selectedRows,
    cols,
    columnWidths,
    onChangeCheckbox,
    isSubtableRow = false,
  }) => {
    return (
      <>
        <TableRow
          hover={hover}
          key={rowIndex}
          sx={{
            backgroundColor: rowIndex % 2 === 0 && !hover ? "#fafafa" : "#fff",
          }}
        >
          {!isSubtableRow && (
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
  }
);

export default CustomTableRow;
