import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { Api } from "../api";

const FormEdit = ({ store, loading, onClose, onSave }) => {
  const [formData, setFormData] = useState(store);
  const [addressOptions, setAddressOptions] = useState([]);

  useEffect(() => {
    setFormData(store);
    if (store?.address) {
      setAddressOptions((prevOptions) =>
        prevOptions.some((opt) => opt.address === store.address)
          ? prevOptions
          : [
              {
                address: store.address,
                latitude: store.latitude,
                longitude: store.longitude,
              },
              ...prevOptions,
            ]
      );
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev[name] === value ? prev : { ...prev, [name]: value }
    );
    if (name === "postal_code" && value.length === 6) {
      handlePostalCodeChange(value);
    }
  };

  const handlePostalCodeChange = async (postalCode) => {
    try {
      const response = await fetch(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
      );
      const data = await response.json();

      const options =
        data.results?.map((result) => ({
          address: result.ADDRESS,
          latitude: result.LATITUDE,
          longitude: result.LONGITUDE,
        })) || [];

      if (
        store?.address &&
        !options.some((opt) => opt.address === store.address)
      ) {
        options.push({
          address: store.address,
          latitude: store.latitude,
          longitude: store.longitude,
        });
      }

      setAddressOptions(options);
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressOptions([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await Api.updateStore({
        id: formData.store_id,
        ...formData,
      });
      if (response.data.status === "success") {
        alert("Store updated successfully!");
        onSave();
        onClose();
      } else {
        alert("Failed to update store.");
      }
    } catch (error) {
      console.error("Error updating store:", error);
      alert("Error updating store.");
    }
  };

  return (
    <Modal open={Boolean(store)} onClose={onClose}>
      <Box
        p={4}
        bgcolor="white"
        boxShadow={3}
        borderRadius={2}
        width={400}
        mx="auto"
        mt="10%"
      >
        <Typography variant="h6" mb={2}>
          Edit Store
        </Typography>
        {formData && (
          <>
            <TextField
              label="Store Name"
              name="store_name"
              value={formData.store_name || ""}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={loading}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Choose an address</InputLabel>
              <Select
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={
                  loading || (addressOptions.length === 0 && !formData.address)
                }
              >
                {addressOptions.length === 0 && !formData.address ? (
                  <MenuItem value="" disabled>
                    No address available
                  </MenuItem>
                ) : (
                  addressOptions.map((option, index) => (
                    <MenuItem key={index} value={option.address}>
                      {option.address}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </>
        )}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={onClose}
              variant="outlined"
              color="secondary"
              fullWidth
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default FormEdit;
