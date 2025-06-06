import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-toastify";
import { Api } from "../../api";

const StoreForm = ({ open, onClose, onAddStore, loading }) => {
  const [store, setStore] = useState({
    store_name: "",
    postal_code: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const validate = () => {
    let tempErrors = {};
    if (!store.store_name) tempErrors.store_name = "Name is required";
    if (!store.phone) tempErrors.phone = "Phone number is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStore((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async () => {
    if (validate()) {
      const requestData = {
        display: "T",
        outlet_name: store.store_name,
        outlet_phone: store.phone,
        outlet_address: {
          postal_code: "NULL",
          address: "NULL",
          coordinates: {
            lat: "NULL",
            lng: "NULL",
          },
        },
      };

      try {
        const response = await Api.addStore(requestData);

        if (response.data.status === "success") {
          toast.success("Store created successfully!");
          onAddStore();
          onClose();
          setStore({
            store_name: "",
            postal_code: "",
            address: "",
            latitude: "",
            longitude: "",
            phone: "",
          });
          setAddressOptions([]);
          setSelectedAddress(null);
        } else {
          toast.error(response.data.message || "Failed to create store");
        }
      } catch (error) {
        toast.error("Error creating store");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Store</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField
            label="Store Name"
            name="store_name"
            value={store.store_name}
            onChange={handleChange}
            error={!!errors.store_name}
            helperText={errors.store_name}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={store.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
            margin="dense"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Loading..." : "Add Store"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreForm;
