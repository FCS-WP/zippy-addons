// EditAddonButton.js
import React, { useState } from "react";
import { Button } from "@mui/material";
import EditAddonDialog from "./EditAddonDialog";

const EditAddonButton = ({ orderID }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        variant="contained"
        color="error"
        size="small"
        onClick={handleOpen}
      >
        Edit Order Items
      </Button>

      {open && (
        <EditAddonDialog open={open} orderID={orderID} onClose={handleClose} />
      )}
    </>
  );
};

export default EditAddonButton;
