import { Box, IconButton } from "@mui/material";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { alertConfirmDelete } from "../../../utils/alertHelper";
import { Api } from "../../../api";
import { callToDeleteItems } from "../../../utils/bookingHelper";
import { toast } from "react-toastify";
import theme from "../../../../theme/theme";

const ButtonDelete = ({ data, type, menuId = null, onDeleted }) => {
  const handleDeleteItem = async () => {
    const confirmDelete = await alertConfirmDelete();
    if (!confirmDelete) {
      return;
    }
    const ids = [data.id];
    if (type == "menu") {
      const delMenu = await callToDeleteItems(ids);
    } else {
      const params = {
        menu_id: menuId,
        product_ids: ids,
      };
      const { data: delProduct } = await Api.removeProductsFromMenu(params);
      if (!delProduct || delProduct.status !== "success") {
        toast.error(delProduct.message ?? "Failed to delete product");
        return;
      }
    }
    onDeleted();
    return;
  };

  return (
    <Box>
      <IconButton
        aria-label="delete"
        size="small"
        onClick={() => handleDeleteItem()}
      >
        <DeleteIcon sx={{ fontSize: "20px", color: theme.palette.danger.main }} />
      </IconButton>
    </Box>
  );
};

export default ButtonDelete;
