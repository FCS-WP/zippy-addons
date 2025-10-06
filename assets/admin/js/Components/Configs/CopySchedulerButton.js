import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Api } from "../../api";
import { toast } from "react-toastify";

export default function CopySchedulerButton({ stores, selectedOutlet }) {
  const [open, setOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  useEffect(() => {
    console.log(stores);
  }, [stores]);

  const handleSubmit = async () => {
    if (!selectedStore) {
      handleClose();
      return;
    }

    const { data } = await Api.cloneScheduleFromStore({
      from_outlet_id: selectedStore,
      outlet_id: selectedOutlet,
    });

    if (data.status === "success") {
      toast.success("Copy scheduler successfully");
      window.location.reload();
    } else {
      toast.error(data.message || "Copy scheduler failed");
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mt: 2 }}
      >
        Copy Scheduler
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Copy Scheduler</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="store-select-label">Select Store</InputLabel>
            <Select
              labelId="store-select-label"
              value={selectedStore}
              label="Select Store"
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              {stores?.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.outlet_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSubmit();
              handleClose();
            }}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
