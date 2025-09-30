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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (minOrder > 0) {
      setQuantity(minOrder);
      if (onSubTableChange) {
        row.quantity = minOrder;
        onSubTableChange(row);
      }
    }
  }, [minOrder]);

  const handleSubTableChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      setDisabled(false);
      const inputValue = parseInt(value, 10) || 0;
      if (inputValue < 0) inputValue = 0;
      setQuantity(inputValue);
      setDisabled(inputValue < minOrder);
      setError(inputValue < minOrder);
      if (onSubTableChange) {
        row.quantity = inputValue;
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
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            fontSize: "20px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() =>
            handleSubTableChange({
              target: { name: "quantity", value: Number(quantity) - 1 },
            })
          }
        >
          –
        </span>
        <input
          name="quantity"
          min={minOrder}
          value={quantity}
          onChange={handleSubTableChange}
          style={{
            width: "50px",
            textAlign: "center",
            fontSize: "16px",
            padding: "4px",
            borderColor: error ? "red" : undefined,
          }}
        />
        <span
          style={{
            fontSize: "20px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() =>
            handleSubTableChange({
              target: { name: "quantity", value: Number(quantity) + 1 },
            })
          }
        >
          +
        </span>
      </div>
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
          disabled={disabled}
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
