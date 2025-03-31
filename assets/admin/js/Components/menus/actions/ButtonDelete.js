import { Box, IconButton } from "@mui/material";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";

const ButtonDelete = ({ data, type }) => {
  const handleDeleteItem = () => {
    console.log("Delete ", data);
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
