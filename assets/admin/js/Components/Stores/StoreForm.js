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
    day_limited: "",
  });

  const [errors, setErrors] = useState({});
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const validate = () => {
    let tempErrors = {};
    if (!store.store_name) tempErrors.store_name = "Name is required";
    if (!store.postal_code) tempErrors.postal_code = "Postal code is required";
    if (!store.address) tempErrors.address = "Address is required";
    if (!store.phone) tempErrors.phone = "Phone number is required";
    if (!store.day_limited) tempErrors.day_limited = "Day limited is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStore((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostalCodeChange = async (e) => {
    const { value } = e.target;
    handleChange(e);

    if (value.length === 6) {
      try {
        const response = await fetch(
          `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${value}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setAddressOptions(
            data.results.map((result) => ({
              address: result.ADDRESS,
              latitude: result.LATITUDE,
              longitude: result.LONGITUDE,
            }))
          );
        } else {
          setAddressOptions([]);
        }
      } catch (error) {
        toast.error("Failed to fetch address.");
        setAddressOptions([]);
      }
    } else {
      setAddressOptions([]);
    }
  };

  const handleAddressChange = (e) => {
    const selected = addressOptions.find(
      (option) => option.address === e.target.value
    );
    setSelectedAddress(selected);
    setStore((prev) => ({
      ...prev,
      address: selected.address,
      latitude: selected.latitude,
      longitude: selected.longitude,
    }));
  };

  const handleSubmit = async () => {
    if (validate()) {
      const requestData = {
        display: "T",
        outlet_name: store.store_name,
        outlet_phone: store.phone,
        day_limited: Number(store.day_limited),
        outlet_address: {
          postal_code: store.postal_code,
          address: store.address,
          coordinates: {
            lat: store.latitude,
            lng: store.longitude,
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
            day_limited: "",
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
          <TextField
            label="Postal Code"
            name="postal_code"
            value={store.postal_code}
            onChange={handlePostalCodeChange}
            error={!!errors.postal_code}
            helperText={errors.postal_code}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense" error={!!errors.address}>
            <InputLabel>Choose an address</InputLabel>
            <Select
              name="address"
              value={store.address}
              onChange={handleAddressChange}
              disabled={!addressOptions.length}
            >
              {addressOptions.map((option, index) => (
                <MenuItem key={index} value={option.address}>
                  {option.address}
                </MenuItem>
              ))}
            </Select>
            {errors.address && (
              <Typography color="error">{errors.address}</Typography>
            )}
          </FormControl>

          <TextField
            label="Pre-order window period (days)"
            name="day_limited"
            type="number"
            value={store.day_limited}
            onChange={handleChange}
            error={!!errors.day_limited}
            helperText={errors.day_limited}
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
          disabled={loading || !selectedAddress}
        >
          {loading ? "Loading..." : "Add Store"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreForm;
