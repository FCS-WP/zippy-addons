import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { toast } from "react-toastify";
import { Api } from "../../api";
import { LogarithmicScale } from "chart.js";

const ShippingFeeCalculator = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [config, setConfig] = useState([]);
  const [minimumTotalToShipping, setMinimumTotalToShipping] = useState("");
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newConfig, setNewConfig] = useState({
    min_distance: "",
    max_distance: "",
    shipping_fee: "",
  });
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await Api.getStore();
        setStores(response.data.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };
    fetchStores();
  }, []);

  const fetchConfig = async (storeId) => {
    if (!storeId) return;

    try {
      const response = await Api.getShipping({ outlet_id: storeId });
      setConfig(response.data.data.shipping_config.shipping_config || []);

      setMinimumTotalToShipping(
        response.data.data.minimum_total_to_shipping || ""
      );
    } catch (error) {
      console.error("Error fetching shipping config:", error);
      setConfig([]);
      setMinimumTotalToShipping("");
    }
  };

  const handleStoreChange = (event) => {
    const storeId = event.target.value;
    setSelectedStore(storeId);
    fetchConfig(storeId);
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleOpen = (index = null) => {
    setEditIndex(index);
    setNewConfig(
      index !== null
        ? config[index]
        : { min_distance: "", max_distance: "", shipping_fee: "" }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setNewConfig({ ...newConfig, [e.target.name]: e.target.value });
    console.log(newConfig);
  };

  const handleAddOrUpdateConfig = () => {
    console.log(newConfig);

    if (
      !newConfig.min_distance ||
      !newConfig.max_distance ||
      !newConfig.shipping_fee
    ) {
      alert("Please fill in all fields before saving.");
      return;
    }

    const updatedConfig = [config];
    if (editIndex !== null) {
      updatedConfig[editIndex] = newConfig;
    } else {
      updatedConfig.push(newConfig);
    }
    setConfig(updatedConfig);
    handleClose();
  };

  const handleDeleteConfig = (index) => {
    setConfig(config.filter((_, i) => i !== index));
  };

  const handleSaveConfig = async () => {
    if (!selectedStore) {
      toast.error("Please select a store.");
      return;
    }

    try {
      const payload = {
        outlet_id: selectedStore,
        config,
        minimum_total_to_shipping: minimumTotalToShipping,
      };
      const response = await Api.addShipping(payload);

      if (response.data.status === "success") {
        toast.success("Shipping configuration saved successfully!");
      } else {
        toast.error("Failed to save shipping configuration!");
      }
    } catch (error) {
      console.error("Error saving shipping config:", error);
      toast.error("An error occurred while saving!");
    }
  };

  return (
    <Container maxWidth="100" style={{ marginTop: 20 }}>
      <Typography variant="h5" gutterBottom>
        Shipping Fee Configuration
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Select Store</InputLabel>
        <Select value={selectedStore} onChange={handleStoreChange}>
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.outlet_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="Minimum Total to Shipping" />
        <Tab label="Shipping Configuration" />
      </Tabs>

      {tabIndex === 0 && (
        <Paper style={{ padding: 20, marginTop: 20 }}>
          <TextField
            variant="outlined"
            fullWidth
            label="Minimum Total to Shipping"
            value={minimumTotalToShipping}
            onChange={(e) => setMinimumTotalToShipping(e.target.value)}
          />
        </Paper>
      )}

      {tabIndex === 1 && (
        <Paper style={{ padding: 20, marginTop: 20 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
          >
            Add New Configuration
          </Button>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Min Distance</TableCell>
                  <TableCell>Max Distance</TableCell>
                  <TableCell>Shipping Fee</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.min_distance}</TableCell>
                    <TableCell>{row.max_distance}</TableCell>
                    <TableCell>{row.shipping_fee}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpen(index)}
                        style={{ marginRight: 10 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteConfig(index)}
                        style={{ marginRight: 10 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Button variant="contained" color="secondary" onClick={handleSaveConfig}>
        Save
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editIndex !== null
            ? "Edit Shipping Configuration"
            : "Add Shipping Configuration"}
        </DialogTitle>
        <DialogContent>
          <TextField
            name="min_distance"
            type="text"
            fullWidth
            margin="dense"
            label="From Value"
            value={newConfig.min_distance}
            onChange={handleChange}
          />
          <TextField
            name="max_distance"
            type="text"
            fullWidth
            margin="dense"
            label="To Value"
            value={newConfig.max_distance}
            onChange={handleChange}
          />
          <TextField
            name="shipping_fee"
            type="text"
            fullWidth
            margin="dense"
            label="Shipping Fee"
            value={newConfig.shipping_fee}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddOrUpdateConfig}
            variant="contained"
            color="primary"
          >
            {editIndex !== null ? "Update" : "Add"}
          </Button>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShippingFeeCalculator;
