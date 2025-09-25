import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  TableCell,
  TableRow,
  TextField,
  Box,
  Stack,
  IconButton,
  Collapse,
  InputLabel,
  FormControl,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import theme from "../../../theme/theme";
import ProductDetails from "../../Pages/Orders/AddProducts/ProductDetails";
import PackingInstruction from "../../Pages/Orders/AddProducts/PackingInstruction";

const CustomTableRow = ({
  hideCheckbox = false,
  hover,
  row,
  rowIndex,
  selectedRows,
  cols,
  columnWidths,
  onChangeCheckbox,
  isSubtableRow = false,
  showCollapseProp = false,
  onAddProduct, // callback for adding product
  onSubTableChange, // callback for updating sub row table [quantity, packing instructions]
}) => {
  const minOrder = row.MinOrder ?? 0;
  const [disabled, setDisabled] = useState(true && minOrder <= 0);
  const [showCollapse, setShowCollapse] = useState(showCollapseProp);
  const [showCollapsePackingInstruction, setShowCollapsePackingInstruction] =
    useState(false);
  const handleToggleCollapse = () => {
    setShowCollapse((prev) => !prev);
  };
  const [quantity, setQuantity] = useState(minOrder);
  const [packingInstructions, setPackingInstructions] = useState("");

  const handleSubTableChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      setDisabled(false);
      const inputValue = parseInt(value, 10) || 0;
      const clampedValue = inputValue < minOrder ? minOrder : inputValue;
      setQuantity(clampedValue);
      if (onSubTableChange) {
        row.quantity = clampedValue;
        onSubTableChange(row);
      }
    }

    // Update packing instructions state
    if (name === "packingInstructions") {
      setPackingInstructions(value);
      row.packingInstructions = value;
      if (onSubTableChange) {
        onSubTableChange(row);
      }
    }
  };

  const handleAddProduct = () => {
    if (onAddProduct) {
      onAddProduct(row);
      setDisabled(true);
    }
  };

  const ActionGroup = () => (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      justifyContent={"flex-end"}
    >
      <TextField
        name="quantity"
        type="number"
        value={quantity}
        onChange={handleSubTableChange}
        size="small"
        sx={{ width: "70px" }}
      />
      {Object.keys(row.ADDONS || {}).length == 0 && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          // onClick={handleAddProduct}
          onClick={() => setShowCollapsePackingInstruction((prev) => !prev)}
          disabled={disabled}
        >
          {showCollapsePackingInstruction ? "Hide" : "Add to Order"}
        </Button>
      )}
      {Object.keys(row.ADDONS || {}).length > 0 && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleToggleCollapse}
        >
          {showCollapse ? "Hide Add-ons" : "Show Add-ons"}
        </Button>
      )}
    </Stack>
  );
  return (
    <>
      <TableRow
        hover={hover}
        key={rowIndex}
        sx={{ borderColor: theme.palette.primary.main }}
      >
        {cols.map((col, colIndex) => (
          <TableCell
            key={colIndex}
            style={{ width: columnWidths[col] || "auto" }}
          >
            {col === "ACTIONS" ? <ActionGroup /> : row[col]}
          </TableCell>
        ))}
      </TableRow>

      {/* Case ADDONS = 0 */}
      {Object.keys(row.ADDONS || {}).length === 0 && (
        <TableRow>
          <TableCell
            colSpan={cols.length}
            style={{ paddingBottom: 0, paddingTop: 0 }}
          >
            <Collapse
              in={showCollapsePackingInstruction}
              timeout="auto"
              unmountOnExit
            >
              <PackingInstruction
                value={packingInstructions}
                onChange={handleSubTableChange}
                showButton
                onAdd={handleAddProduct}
                disabled={disabled}
              />
            </Collapse>
          </TableCell>
        </TableRow>
      )}

      {/* Case ADDONS > 0 */}
      {Object.keys(row.ADDONS || {}).length > 0 && (
        <TableRow>
          <TableCell
            colSpan={cols.length}
            style={{ paddingBottom: 0, paddingTop: 0 }}
          >
            <Collapse in={showCollapse} timeout="auto" unmountOnExit>
              <PackingInstruction
                value={packingInstructions}
                onChange={handleSubTableChange}
              />

              <ProductDetails
                productID={row.productID}
                orderID={row.orderID}
                quantity={quantity}
                addonMinOrder={row.MinAddons}
                packingInstructions={row.packingInstructions}
              />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default CustomTableRow;
