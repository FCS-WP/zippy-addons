import React, { useState } from "react";
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
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import theme from "../../../theme/theme";
import ProductDetails from "../../Pages/Orders/AddProducts/ProductDetails";

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
  onQuantityChange, // callback for updating quantity
}) => {
  const minOrder = row.MinOrder ?? 0;
  const [disabled, setDisabled] = useState(true);
  const [showCollapse, setShowCollapse] = useState(showCollapseProp);

  const handleToggleCollapse = () => {
    setShowCollapse((prev) => !prev);
  };
  const [quantity, setQuantity] = useState(minOrder);

  const handleQuantityChange = (e) => {
    setDisabled(false);
    const inputValue = parseInt(e.target.value, 10) || 0;
    const clampedValue = inputValue < minOrder ? minOrder : inputValue;

    setQuantity(clampedValue);
    if (onQuantityChange) {
      onQuantityChange(row, clampedValue);
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
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
        size="small"
        sx={{ width: "70px" }}
      />
      {Object.keys(row.ADDONS || {}).length == 0 && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleAddProduct}
          disabled={disabled}
        >
          Add Product
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

      {/* Collapsible Addons */}
      {Object.keys(row.ADDONS || {}).length > 0 && (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={cols.length}
          >
            <Collapse in={showCollapse} timeout="auto" unmountOnExit>
              <Box mb={2} mt={1}>
                <ProductDetails
                  productID={row.productID}
                  orderID={row.orderID}
                  quantity={quantity}
                  addonMinOrder={row.MinAddons}
                />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default CustomTableRow;
