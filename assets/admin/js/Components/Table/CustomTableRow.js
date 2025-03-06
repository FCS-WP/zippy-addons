import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ModalUpdatePrice from "../Products/ModalUpdatePrice";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  callDeleteMappingItems,
  deleteConfirm,
} from "../../utils/bookingHelper";
import SubTable from "./SubTable";

const CustomTableRow = memo(
  ({
    hover,
    row,
    rowIndex,
    selectedRows,
    cols,
    columnWidths,
    onChangeList = () => {},
    onChangeCheckbox,
    isSubtableRow = false,
  }) => {
    const [showCollapse, setShowCollapse] = useState(false);

    const handleListProduct = (row) => {
      if (showCollapse) {
        setShowCollapse(false);
        return false;
      }
      setShowCollapse(true);
    };

    const handleDeleteMappingItem = async (data) => {
      const confirm = await deleteConfirm();
      if (!confirm) {
        return false;
      }
      const deletedData = {
        items_id: data.ID,
        type: data.Type,
      };

      if (isSubtableRow) {
        deletedData.is_product_in_sub = "true";
      }
      const del = await callDeleteMappingItems([deletedData]);
      onChangeList();
    };

    const ActionGroup = ({ handleListProduct, handleDeleteMappingItem }) => {
      return (
        <Stack direction={"row"} gap={2}>
          {row.Type == "category" ? (
            <IconButton size="small" onClick={(e) => handleListProduct(row)}>
              {showCollapse ? (
                <KeyboardArrowUp fontSize={"20px"} />
              ) : (
                <KeyboardArrowDown fontSize={"20px"} />
              )}
            </IconButton>
          ) : (
            <ModalUpdatePrice data={row} onChangeData={onChangeList} />
          )}
          <IconButton
            aria-label="delete"
            size="small"
            onClick={(e) => handleDeleteMappingItem(row)}
          >
            <DeleteIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </Stack>
      );
    };

    const subTableColumns = [
      "ID",
      "Name",
      "Regular Price",
      "Extra Price",
      "Actions",
    ];

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
              {col === "Actions" ? (
                <ActionGroup
                  handleDeleteMappingItem={handleDeleteMappingItem}
                  handleListProduct={handleListProduct}
                />
              ) : (
                row[col]
              )}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={showCollapse} timeout="auto" unmountOnExit>
              <Box mt={4} mb={5}>
                <SubTable
                  category={row}
                  cols={subTableColumns}
                  onChangeData={onChangeList}
                />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }
);

export default CustomTableRow;
