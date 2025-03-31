import { Box, IconButton } from "@mui/material";
import React, { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { alertConfirmDelete, AlertStatus, showAlert } from "../../../utils/alertHelper";
import { Api } from "../../../api";
import MenuContext from "../../../contexts/MenuContext";

const ButtonDelete = ({ data, type }) => {
  const { refetchMenus } = useContext(MenuContext);
  const handleDeleteItem = async () => {
    switch (type) {
      case "menu":
        const confirmDelete = await alertConfirmDelete();
        if (confirmDelete) {
          console.log("delete", data);
        }
        const params = {
          menu_id: data.id,
        };
        const { data: response } = await Api.deleteMenu(params);
        if (!response || response.status !== 'success') {
          showAlert(AlertStatus.error, "Error!", "Delete menu failed. Please try again!");
          return;
        }
        showAlert(AlertStatus.success, "Success!", "Menu has been deleted!");
        refetchMenus();
        break;
    
      default:
        break;
    }
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
