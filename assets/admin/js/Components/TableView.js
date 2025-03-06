import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  FormControlLabel,
  Button,
  Box,
  Grid2,
  Collapse,
  IconButton,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomTableRow from "./Table/CustomTableRow";

const TableView = ({
  cols,
  rows,
  columnWidths = {},
  canBeDeleted = false,
  onDeleteRows = () => {},
  showBookingFilter = false,
  onChangeList = () => {},
}) => {
  const [selectedRows, setSelectedRows] = useState({});

  useEffect(() => {
    const initialSelection = rows.reduce((acc, _, index) => {
      acc[index] = false;
      return acc;
    }, {});
    setSelectedRows(initialSelection);
  }, [rows]);

  const handleRowCheckboxChange = (rowIndex) => {
    setSelectedRows((prevState) => ({
      ...prevState,
      [rowIndex]: !prevState[rowIndex],
    }));
  };

  const handleMasterCheckboxChange = (event) => {
    const newSelection = rows.reduce((acc, _, index) => {
      acc[index] = event.target.checked;
      return acc;
    }, []);
    setSelectedRows(newSelection);
  };

  const isMasterChecked =
    rows.length > 0 && Object.values(selectedRows).every(Boolean);

  const isMasterIndeterminate =
    !isMasterChecked && Object.values(selectedRows).some((checked) => checked);

  const renderDeleteButton = () => {
    return (
      <Box textAlign={"end"} m={2}>
        <IconButton
          disabled={!isMasterChecked && !isMasterIndeterminate ? true : false}
          aria-label="delete"
          size="small"
          color="error"
          sx={{ fontSize: "12px" }}
          onClick={() => onDeleteRows(selectedRows)}
        >
          <DeleteIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Box>
    );
  };

  return (
    <TableContainer component={Paper}>
      {canBeDeleted ? renderDeleteButton() : ""}
      <Table>
        <TableHead sx={{ backgroundColor: "#f1f1f1" }}>
          <TableRow>
            <TableCell
              padding="checkbox"
              style={{ width: "50px", textAlign: "center" }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isMasterChecked}
                    indeterminate={isMasterIndeterminate}
                    onChange={handleMasterCheckboxChange}
                    sx={{ textAlign: "center" }}
                  />
                }
                style={{ marginRight: 0 }}
              />
            </TableCell>
            {cols && cols.map((col, index) => (
              <TableCell
                key={index}
                style={{
                  width: columnWidths[col] || "auto",
                  backgroundColor: "#f1f1f1",
                }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: "#fff" }}>
          {rows.map((row, rowIndex) => (
            <CustomTableRow
              key={rowIndex}
              row={row}
              cols={cols}
              columnWidths={columnWidths}
              selectedRows={selectedRows}
              rowIndex={rowIndex}
              onChangeList={onChangeList}
              onChangeCheckbox={handleRowCheckboxChange}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableView;
