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
import { Api } from "../../api";
import { toast } from "react-toastify";

const StoreFormEdit = ({ store, loading, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    outlet_name: "",
    outlet_phone: "",
    postal_code: "",
    address: "",
    latitude: "",
    longitude: "",
    day_limited: "",
  });
  const [addressOptions, setAddressOptions] = useState([]);

  useEffect(() => {
    if (store) {
      setFormData({
        id: store.id,
        outlet_name: store.outlet_name || "",
        outlet_phone: store.outlet_phone || "",
        postal_code: store.outlet_address?.postal_code || "",
        address: store.outlet_address?.address || "",
        latitude: store.outlet_address?.coordinates?.lat || "",
        longitude: store.outlet_address?.coordinates?.lng || "",
        day_limited: store.day_limited || "",
      });

      if (store.outlet_address?.address) {
        setAddressOptions([
          {
            address: store.outlet_address.address,
            latitude: store.outlet_address.coordinates?.lat,
            longitude: store.outlet_address.coordinates?.lng,
          },
        ]);
      }
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "postal_code" && value.length === 6) {
      fetchAddressOptions(value);
    }
  };

  const fetchAddressOptions = async (postalCode) => {
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

      setAddressOptions(options);
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressOptions([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const updateData = {
        outlet_id: store.id,
        display: "T",
        outlet_name: formData.outlet_name,
        outlet_phone: formData.outlet_phone,
        day_limited: Number(formData.day_limited),
        outlet_address: {
          postal_code: formData.postal_code,
          address: formData.address,
          coordinates: {
            lat: formData.latitude,
            lng: formData.longitude,
          },
        },
      };

      const response = await Api.updateStore(updateData);

      if (response.data.status === "success") {
        toast.success("Store updated successfully!");
        onSave();
        onClose();
      } else {
        toast.error("Failed to update store.");
      }
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("Error updating store.");
    }
  };

  return (
    <Modal open={Boolean(store)} onClose={onClose}>
      <Box
        p={4}
        bgcolor="white"
        boxShadow={3}
        borderRadius={2}
        width={600}
        mx="auto"
        mt="10%"
      >
        <Typography variant="h6" mb={2}>
          Edit Store
        </Typography>
        {formData && (
          <>
            <Box mb={2}>
              <Typography variant="body1">Store Name</Typography>
              <TextField
                name="outlet_name"
                value={formData.outlet_name}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body1">Phone</Typography>
              <TextField
                name="outlet_phone"
                value={formData.outlet_phone}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body1">Postal Code</Typography>
              <TextField
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                fullWidth
                disabled={loading}
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body1">Address</Typography>
              <FormControl fullWidth>
                <Select
                  name="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                      latitude:
                        addressOptions.find(
                          (opt) => opt.address === e.target.value
                        )?.latitude || "",
                      longitude:
                        addressOptions.find(
                          (opt) => opt.address === e.target.value
                        )?.longitude || "",
                    })
                  }
                  disabled={loading || addressOptions.length === 0}
                >
                  {addressOptions.length === 0 ? (
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
            </Box>
            <Box mb={2}>
              <Typography variant="body1">Pre-order window period</Typography>
              <TextField
                name="day_limited"
                type="number"
                value={formData.day_limited}
                onChange={handleChange}
                fullWidth
              />
            </Box>
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

export default StoreFormEdit;
