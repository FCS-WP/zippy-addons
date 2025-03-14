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
} from "@mui/material";
import { toast } from "react-toastify";
import { Api } from "../api";

const StoreForm = ({ onAddStore, loading }) => {
  const [store, setStore] = useState({
    store_name: "",
    postal_code: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const validate = () => {
    let tempErrors = {};
    if (!store.store_name) tempErrors.store_name = "Name is required";
    if (!store.postal_code) tempErrors.postal_code = "Postal code is required";
    if (!store.address) tempErrors.address = "Address is required";
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
      try {
        const response = await Api.addStore(store);

        if (response.data.status === "success") {
          toast.success("Store created successfully!");
          onAddStore();

          setStore({
            store_name: "",
            postal_code: "",
            address: "",
            latitude: "",
            longitude: "",
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
    <Box p={3} boxShadow={3} borderRadius={2} bgcolor="white" mb={2}>
      <Typography variant="h5" gutterBottom>
        Add Store
      </Typography>

      <Box mb={2}>
        <Typography>Store Name</Typography>
        <TextField
          name="store_name"
          value={store.store_name}
          onChange={handleChange}
          error={!!errors.store_name}
          helperText={errors.store_name}
          fullWidth
        />
      </Box>

      <Box mb={2}>
        <Typography>Postal Code</Typography>
        <TextField
          name="postal_code"
          value={store.postal_code}
          onChange={handlePostalCodeChange}
          error={!!errors.postal_code}
          helperText={errors.postal_code}
          fullWidth
        />
      </Box>

      <Box mb={2}>
        <Typography>Address</Typography>
        <FormControl fullWidth error={!!errors.address}>
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
      </Box>

      <Box mt={2}>
        <Button
          onClick={handleSubmit}
          variant="outlined"
          color="primary"
          fullWidth
          disabled={loading || !selectedAddress}
        >
          {loading ? "Loading..." : "Add Store"}
        </Button>
      </Box>
    </Box>
  );
};

export default StoreForm;
