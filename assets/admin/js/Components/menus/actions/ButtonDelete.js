import { Box, IconButton } from "@mui/material";
import React, { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { alertConfirmDelete, AlertStatus, showAlert } from "../../../utils/alertHelper";
import { Api } from "../../../api";
import MenuContext from "../../../contexts/MenuContext";
import { callToDeleteItems } from "../../../utils/bookingHelper";

const ButtonDelete = ({ data, type }) => {
  const { refetchMenus } = useContext(MenuContext);

  const handleDeleteItem = async () => {
    const confirmDelete = await alertConfirmDelete();
    if (confirmDelete) {
      console.log("delete", data);
    }
    const ids = [data.id];
    const del = await callToDeleteItems(ids);
    refetchMenus();
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
