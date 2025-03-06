import React, { useState } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { alertConfirm } from "../../utils/bookingHelper";
import { Api } from "../../api";
import { toast } from "react-toastify";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const ModalUpdatePrice = ({ data, onChangeData }) => {
  const [open, setOpen] = useState(false);
  const [regularPrice, setRegularPrice] = useState(data["Regular Price"] ?? ``);
  const [extraPrice, setExtraPrice] = useState(data["Extra Price"] ?? ``);

  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleSaveChanges = async () => {
    setOpen(false);
    const confirm = await alertConfirm(`Update Prices`, `Confirm update ${data.Name} prices?`, "Update");
    if (!confirm) {
      setExtraPrice(data["Extra Price"]);
      return false;
    }
    const params = {
      product_id: data.ID,
      regular_price: regularPrice != '' ? regularPrice : 0,
      extra_price: extraPrice != '' ? extraPrice : 0
    }
    const { data: response} = await Api.updateBookingProductPrices(params);
    if (!response || response.status !== 'success') {
      toast.error(response?.message ?? "Can not update price");
      return false;
    }
    toast.success(response.message);
    onChangeData();
    return;
  }

  return (
    <>
      <IconButton aria-label="delete" size="small" onClick={handleClickOpen}>
        <SettingsIcon sx={{ fontSize: "20px" }} />
      </IconButton>
      <BootstrapDialog
        onClose={handleClose}
        maxWidth={'md'}
        className="custom-mui"
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Update <strong> {data.Name} </strong>prices
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
          <Stack width={"lg"} px={5} py={3} gap={3} >
            <Box minWidth={"350px"} maxWidth={{ sm: '100%'}}>
                <TextField
                  fullWidth
                  label="Regular Price"
                  variant="standard"
                  type="number"
                  placeholder="Enter regular price"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            <Box minWidth={"350px"} maxWidth={{ sm: '100%'}}>
              <TextField
                fullWidth
                label="Extra Price"
                variant="standard"
                type="number"
                placeholder="Enter extra price ..."
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            <Typography fontStyle={'italic'} fontSize={'12px'}><strong>Note: </strong> Extra price is the price applied for Extra Time.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction={'row'} spacing={2} m={2}>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveChanges}>Save Changes</Button>
          </Stack>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};

export default ModalUpdatePrice;
