import React from "react";
import { Box, Typography } from "@mui/material";
import AddonItem from "./AddonItem";

const OrderItem = ({ item, quantities, onQuantityChange }) => {
  return (
    <Box mb={3}>
      {/* Parent product */}
      <Typography variant="h6" gutterBottom>
        {item.name} (x{item.quantity})
      </Typography>

      {/* Grouped addons */}
      {item.grouped_addons?.product_ids?.length > 0 && (
        <Typography variant="caption" color="text.secondary" display="block">
          Grouped Addons Qty: {item.grouped_addons.quantity_products_group}
        </Typography>
      )}

      {/* Addons list */}
      {(item.addons || []).map((addon) => (
        <AddonItem
          key={addon.product_id}
          addon={addon}
          quantity={quantities[addon.product_id] ?? addon.quantity}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </Box>
  );
};

export default OrderItem;
