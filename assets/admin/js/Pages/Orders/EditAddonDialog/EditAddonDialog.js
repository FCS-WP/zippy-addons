import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";

import { generalAPI } from "../../../api/general";
import OrderItem from "./OrderItem";

const EditAddonDialog = ({ open, onClose, orderID }) => {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Load items + addons
  useEffect(() => {
    if (!open || !orderID) return;

    const fetchData = async () => {
      try {
        const { data } = await generalAPI.getItems({ orderID });

        if (data?.status === "success") {
          setItems(data.data);

          // preload quantities
          const initQuantities = {};
          data.data.forEach((item) => {
            (item.addons || []).forEach((addon) => {
              initQuantities[addon.product_id] = addon.quantity;
            });
          });
          setQuantities(initQuantities);
        }
      } catch {
        toast.error("Failed to load addons!");
      }
    };

    fetchData();
  }, [open, orderID]);

  const handleQuantityChange = (id, newQty) => {
    setQuantities((prev) => ({ ...prev, [id]: newQty }));
  };

  const handleSubmit = async () => {
    // Build request payload
    const result = items.map((item) => ({
      item_id: item.item_id,
      product_id: item.product_id,
      addons: (item.addons || []).map((addon) => ({
        product_id: addon.product_id,
        quantity: quantities[addon.product_id] ?? addon.quantity ?? 0,
        min: addon.addon_rules?.min ?? 0,
        max: addon.addon_rules?.max ?? 99,
      })),
    }));

    // Validation for composite products
    for (const item of items) {
      if (
        item.is_composite_product &&
        item.grouped_addons?.product_ids?.length > 0
      ) {
        const requiredQty =
          parseInt(item.grouped_addons.quantity_products_group) || 0;

        // sum only grouped addons
        const totalGroupedQty = (item.addons || [])
          .filter((addon) =>
            item.grouped_addons.product_ids.includes(addon.product_id)
          )
          .reduce((sum, addon) => {
            return sum + (quantities[addon.product_id] ?? addon.quantity ?? 0);
          }, 0);

        if (totalGroupedQty !== requiredQty) {
          toast.error(
            `${item.name}: You must select exactly ${requiredQty} items from grouped addons (current: ${totalGroupedQty})`
          );
          return;
        }
      }
    }

    const params = {
      order_id: orderID,
      data: result,
      action: "woocommerce_calc_line_taxes",
    };

    try {
      const { data } = await generalAPI.update_items_order(params);
      if (data?.status === "success") {
        toast.success("Updated successfully!");
        window.location.reload();
      }
    } catch {
      toast.error("Update failed!");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Order #{orderID}</DialogTitle>
      <DialogContent>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No order items found
          </Typography>
        ) : (
          items.map((item) => (
            <OrderItem
              key={item.item_id}
              item={item}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
            />
          ))
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="error" variant="contained">
          Save
        </Button>
      </DialogActions>
      <ToastContainer />
    </Dialog>
  );
};

export default EditAddonDialog;
