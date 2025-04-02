import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import { BootstrapDialog } from "../../mui-custom-styles";
import CloseIcon from "@mui/icons-material/Close";

const ButtonUpdateMenu = ({ data }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSaveChanges = () => {};

  return (
    <Box>
      <IconButton aria-label="delete" size="small" onClick={handleClickOpen}>
        <SettingsIcon sx={{ fontSize: "20px" }} />
      </IconButton>
      <BootstrapDialog
        onClose={handleClose}
        maxWidth={"md"}
        className="custom-mui"
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Update <strong> {data.Name} </strong>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography>CONTENT HERE</Typography>
        </DialogContent>
        <DialogActions>
          <Stack direction={"row"} spacing={2} m={2}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Stack>
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
};

export default ButtonUpdateMenu;
