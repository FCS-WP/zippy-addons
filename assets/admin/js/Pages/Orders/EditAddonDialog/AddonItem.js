import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const AddonItem = ({ addon, quantity, onQuantityChange }) => {
  const min = parseInt(addon.addon_rules?.min) || 0;
  const max = parseInt(addon.addon_rules?.max) || 99;

  const handleChange = (type) => {
    if (type === "inc" && quantity < max) {
      onQuantityChange(addon.product_id, quantity + 1);
    }
    if (type === "dec" && quantity > min) {
      onQuantityChange(addon.product_id, quantity - 1);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={1}
      p={1}
      sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}
    >
      {/* Name + Price */}
      <Box flex={1}>
        <Typography variant="subtitle1">{addon.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          ${addon.price?.toFixed(2) ?? "0.00"}{" "}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Min: {min} | Max: {max === 99 ? "∞" : max}
        </Typography>
      </Box>

      {/* Quantity controls */}
      <Box display="flex" alignItems="center">
        <IconButton
          size="small"
          onClick={() => handleChange("dec")}
          disabled={quantity <= min}
          sx={{
            "&.Mui-disabled": {
              backgroundColor: "#f0f0f0",
              color: "#bbb",
              cursor: "not-allowed",
            },
          }}
        >
          <RemoveIcon color="error" />
        </IconButton>

        <Typography sx={{ mx: 1, minWidth: 20, textAlign: "center" }}>
          {quantity}
        </Typography>

        <IconButton
          size="small"
          onClick={() => handleChange("inc")}
          disabled={quantity >= max}
          sx={{
            "&.Mui-disabled": {
              backgroundColor: "#f0f0f0",
              color: "#bbb",
              cursor: "not-allowed",
            },
          }}
        >
          <AddIcon color="error" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AddonItem;
