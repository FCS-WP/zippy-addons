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
  const [showCollapse, setShowCollapse] = useState(showCollapseProp);

  const handleToggleCollapse = () => {
    setShowCollapse((prev) => !prev);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    if (onQuantityChange) {
      onQuantityChange(row, value);
    }
  };

  const handleAddProduct = () => {
    if (onAddProduct) {
      onAddProduct(row);
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
        value={row.MinOrder ?? 0}
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
