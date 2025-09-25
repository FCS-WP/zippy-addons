import React, { useState, useEffect, useCallback } from "react";
import { addProducts } from "../../../utils/tableHelper";
import { generalAPI } from "../../../api/general";
import TableView from "../../../Components/TableView";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";

const ProductDetails = ({
  productID,
  orderID,
  quantity,
  addonMinOrder,
  packingInstructions,
}) => {
  const orderIDParam = orderID.orderID;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [groupTotal, setGroupTotal] = useState(0);

  useEffect(() => {
    console.log("Packing Instructions:", packingInstructions);
  }, [packingInstructions]);

  /**
   * Fetch product addons
   */
  const fetchProduct = useCallback(async () => {
    if (!productID) return;

    setLoading(true);
    try {
      const { data } = await generalAPI.product({ productID });
      if (data?.status === "success" && data.data?.addons) {
        setData(convertRows(data.data));
        setGroupTotal(data.data.grouped_addons?.quantity_products_group || 0);
      } else {
        setData([]);
        setGroupTotal(0);
      }
    } catch (error) {
      console.error("Error fetching product addons:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [productID]);

  const convertRows = (rows) =>
    Object.entries(rows.addons).map(([key, value]) => ({
      ID: key,
      NAME: value.name,
      SKU: value.sku,
      IMAGE: value.image || "",
      MIN: value.min,
      MAX: value.max,
      QUANTITY: value.min ?? 0,
      isGrouped: rows.grouped_addons.product_ids.includes(Number(key)),
    }));

  /**
   * Handle quantity changes with group validation
   */
  const handleQuantityChange = (id, value) => {
    const newValue = Math.max(0, Number(value));

    setData((prev) => {
      const updated = prev.map((row) => {
        if (row.ID !== id) return row;
        let clamped = Math.min(Math.max(newValue, row.MIN), row.MAX);
        return { ...row, QUANTITY: clamped };
      });

      const groupSum = updated
        .filter((r) => r.isGrouped)
        .reduce((s, r) => s + (r.QUANTITY || 0), 0);

      if (groupTotal > 0 && groupSum > groupTotal) {
        toast.error(
          `Group limit exceeded: ${groupSum}/${groupTotal}. Please adjust.`
        );
        return prev;
      }

      if (groupTotal > 0 && groupSum === groupTotal) {
        toast.success(`Group total completed: ${groupSum}/${groupTotal}`);
      }

      return updated;
    });
  };

  /**
   * Add image and action column
   */
  const rowsWithInputs = data.map((row) => ({
    ...row,
    IMAGE: row.IMAGE ? (
      <img
        src={row.IMAGE}
        alt={row.NAME}
        style={{ width: "50px", height: "50px", objectFit: "cover" }}
      />
    ) : (
      "No Image"
    ),
    "ADDON ACTIONS": (
      <TextField
        type="number"
        size="small"
        value={row.QUANTITY ?? 0}
        onChange={(e) => handleQuantityChange(row.ID, e.target.value)}
        inputProps={{ min: row.MIN, max: row.MAX }}
        sx={{ width: "70px" }}
      />
    ),
  }));

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const columnWidths = {
    IMAGE: "20%",
    NAME: "auto",
    "ADDON ACTIONS": "30%",
  };

  const handleAddAllAddons = () => {
    const selected = data
      .filter((row) => row.QUANTITY > 0)
      .map((row) => ({
        item_id: row.ID,
        quantity: row.QUANTITY,
      }));

    if (!selected.length) {
      toast.warn("Please select at least one addon with quantity.");
      return;
    }
    if (
      addonMinOrder &&
      selected.reduce((sum, r) => sum + r.quantity, 0) < addonMinOrder
    ) {
      toast.error(
        `Minimum addons required: ${addonMinOrder}. Currently selected: ${selected.reduce(
          (sum, r) => sum + r.quantity,
          0
        )}`
      );
      return;
    }

    // Validate grouped addons

    if (groupTotal > 0) {
      const groupSum = selected
        .filter((r) =>
          data.find((row) => row.ID === r.item_id && row.isGrouped)
        )
        .reduce((s, r) => s + r.quantity, 0);

      if (groupSum < groupTotal) {
        toast.error(
          `You must select exactly ${groupTotal} items in grouped add-ons. Currently: ${groupSum}`
        );
        return;
      }
    }

    handleAddProducts(selected, orderIDParam, quantity);
  };

  const handleAddProducts = async (selected, orderID, quantity) => {
    try {
      const params = {
        order_id: orderID,
        addons: selected,
        parent_product_id: productID,
        quantity: quantity,
        packing_instructions: packingInstructions || "",
      };
      const response = await generalAPI.addProductsToOrder(params);
      if (response.data.status === "success") {
        toast.success("Products added to order successfully!");
      } else {
        toast.error("Failed to add products to order.");
      }
    } catch (error) {
      console.error("Error adding products to order:", error);
      toast.error("An error occurred while adding products to order.");
    } finally {
      window.location.reload();
    }
  };
  return (
    <Box>
      <ToastContainer
        position="bottom-center"
        theme="colored"
        autoClose={3000}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : data.length > 0 ? (
        <>
          <TableView
            hideCheckbox
            cols={addProducts}
            columnWidths={columnWidths}
            rows={rowsWithInputs}
            className="table-addons"
          />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAllAddons}
              disabled={!data.some((row) => row.QUANTITY > 0)}
            >
              Add All Add-ons
            </Button>
          </Box>
        </>
      ) : (
        <Typography
          variant="body2"
          align="center"
          py={3}
          color="text.secondary"
        >
          No addons found for this product.
        </Typography>
      )}
    </Box>
  );
};

export default ProductDetails;
