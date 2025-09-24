import React, { useEffect, useState } from "react";
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
import { typeStore } from "../../../../web/js/helper/typeStore";
import CustomeDatePicker from "../DatePicker/CustomeDatePicker";

const StoreForm = ({ open, onClose, onAddStore, loading }) => {
  const [store, setStore] = useState({
    store_name: "",
    postal_code: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    limit_order: "",
    type: null,
    start_date: null,
    end_date: null,
  });

  const [errors, setErrors] = useState({});
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (field, date) => {
    let formattedValue = date;

    if (field === "date" && date) {
      formattedValue = new Date(date).toISOString().split("T")[0];
    }

    setStartDate(date);
    setStore((prev) => ({ ...prev, start_date: formattedValue }));
  };

  const handleEndDateChange = (field, date) => {
    let formattedValue = date;

    if (field === "date" && date) {
      formattedValue = new Date(date).toISOString().split("T")[0];
    }

    setEndDate(date);
    setStore((prev) => ({ ...prev, end_date: formattedValue }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!store.store_name) tempErrors.store_name = "Name is required";
    if (!store.postal_code) tempErrors.postal_code = "Postal code is required";
    if (!store.address) tempErrors.address = "Address is required";
    if (!store.phone) tempErrors.phone = "Phone number is required";
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
        outlet_address: {
          postal_code: store.postal_code,
          address: store.address,
          coordinates: {
            lat: store.latitude,
            lng: store.longitude,
          },
        },
        type: store.type || null,
        start_date: store.start_date || null,
        end_date: store.end_date || null,
        limit_order: store.limit_order || null,
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
            limit_order: "",
            type: null,
            start_date: null,
            end_date: null,
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
            <InputLabel id="address-select-label">Choose an address</InputLabel>
            <Select
              name="address"
              labelId="address-select-label"
              label="Choose an address"
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
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              label="Type"
              name="type"
              value={store.type || ""}
              onChange={handleChange}
            >
              {typeStore.map((t) => (
                <MenuItem key={t.key} value={t.key}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Limit Order Per Day"
            name="limit_order"
            value={store.limit_order}
            onChange={handleChange}
            error={!!errors.limit_order}
            helperText={errors.limit_order}
            fullWidth
            margin="dense"
            type="number"
            sx={{ mb: 2 }}
          />
          <InputLabel>Start Date</InputLabel>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <CustomeDatePicker
              startDate={startDate}
              handleDateChange={(date) => handleStartDateChange("date", date)}
              placeholderText="Select a date"
              isClearable={true}
              selectsRange={false}
              sx={{ height: "200px" }}
            />
          </FormControl>
          <InputLabel>End Date</InputLabel>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <CustomeDatePicker
              startDate={endDate}
              handleDateChange={(date) => handleEndDateChange("date", date)}
              placeholderText="Select a date"
              isClearable={true}
              selectsRange={false}
            />
          </FormControl>
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
