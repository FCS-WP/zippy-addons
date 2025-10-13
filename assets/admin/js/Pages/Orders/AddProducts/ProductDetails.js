import React, { useState, useEffect, useCallback, use } from "react";
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
  addedProducts,
  addAddonProduct,
  handleRemoveProduct,
  disabledRemove,
  setDisabledRemove,
}) => {
  const orderIDParam = orderID.orderID;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [groupTotal, setGroupTotal] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Fetch product addons
   */
  const fetchProduct = useCallback(async () => {
    if (!productID) return;

    setLoading(true);
    try {
      const { data } = await generalAPI.product({ productID });
      let converted = [];
      if (data?.status === "success" && data.data?.addons) {
        converted = convertRows(data.data);
        setData(mergeAddedProducts(converted, addedProducts, productID));
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

  useEffect(() => {
    if (!productID || !addedProducts) {
      setData((prev) =>
        prev.map((row) => ({ ...row, QUANTITY: row.MIN || 0 }))
      );
      return;
    }

    const productData = addedProducts[productID];
    if (productData && Array.isArray(productData.addons)) {
      setData((prev) => mergeAddedProducts(prev, addedProducts, productID));
    } else {
      setData((prev) =>
        prev.map((row) => ({ ...row, QUANTITY: row.MIN || 0 }))
      );
    }
  }, [addedProducts, productID]);

  const mergeAddedProducts = (data, addedProducts, productID) => {
    const productData = addedProducts?.[productID];
    if (!productData || !Array.isArray(productData.addons)) return data;

    return data.map((row) => {
      const match = productData.addons.find(
        (addon) => String(addon.item_id) === String(row.ID)
      );
      if (match) return { ...row, QUANTITY: Number(match.quantity) };
      return row;
    });
  };

  const convertRows = (rows) =>
    Object.entries(rows.addons).map(([key, value]) => ({
      ID: value.id,
      NAME: value.name,
      SKU: value.sku,
      IMAGE: value.image || "",
      MIN: value.min,
      MAX: value.max,
      QUANTITY: value.min ?? 0,
      isGrouped: rows.grouped_addons.product_ids.includes(Number(value.id)),
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

    setHasChanges(true);
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
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            fontSize: "20px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() =>
            handleQuantityChange(row.ID, Math.max(0, (row.QUANTITY || 0) - 1))
          }
        >
          –
        </span>
        <input
          name="quantity"
          min={row.MIN}
          max={row.MAX}
          value={row.QUANTITY || 0}
          onChange={(e) => handleQuantityChange(row.ID, e.target.value)}
          className={`custom-input`}
        />
        <span
          style={{
            fontSize: "20px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => handleQuantityChange(row.ID, (row.QUANTITY || 0) + 1)}
        >
          +
        </span>
      </div>
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

    handleAddProducts(selected, quantity);
  };

  const handleAddProducts = async (selected, quantity) => {
    addAddonProduct(productID, quantity, packingInstructions, selected);
    setDisabledRemove(false);
    setHasChanges(false);
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
          <Box display="flex" justifyContent="flex-end" my={2} gap={1}>
            {!!addedProducts?.[productID] && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleRemoveProduct}
                disabled={disabledRemove}
                sx={{ borderColor: "red", color: "red" }}
              >
                Remove
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAllAddons}
              disabled={!data.some((row) => row.QUANTITY > 0) || !hasChanges}
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
