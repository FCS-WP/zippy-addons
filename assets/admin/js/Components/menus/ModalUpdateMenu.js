import { IconButton } from "@mui/material";
import React, { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";

const ModalUpdateMenu = ({ data }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  
  return (
    <div>
      <IconButton aria-label="delete" size="small" onClick={handleClickOpen}>
        <SettingsIcon sx={{ fontSize: "20px" }} />
      </IconButton>
    </div>
  );
};

export default ModalUpdateMenu;
