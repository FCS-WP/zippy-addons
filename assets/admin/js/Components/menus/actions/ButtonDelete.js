import { Box, IconButton } from "@mui/material";
import React, { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  alertConfirmDelete,
  AlertStatus,
  showAlert,
} from "../../../utils/alertHelper";
import { Api } from "../../../api";
import MenuContext from "../../../contexts/MenuContext";
import { callToDeleteItems } from "../../../utils/bookingHelper";
import { toast } from "react-toastify";

const ButtonDelete = ({ data, type, menuId = null, onDeleted }) => {
  const handleDeleteItem = async () => {
    const confirmDelete = await alertConfirmDelete();

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
        <DeleteIcon sx={{ fontSize: "20px" }} />
      </IconButton>
    </Box>
  );
};

export default ButtonDelete;
