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
} from "@mui/material";
import { toast } from "react-toastify";
import { Api } from "../../api";

const ShippingFeeCalculator = () => {
  const [config, setConfig] = useState([]);
  const [minimumShippingFee, setMinimumShippingFee] = useState("");
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newConfig, setNewConfig] = useState({ from: "", to: "", value: "" });
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await Api.getShipping();
        setConfig(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching shipping config:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleOpen = (index = null) => {
    setEditIndex(index);
    setNewConfig(
      index !== null ? config[index] : { from: "", to: "", value: "" }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setNewConfig({ ...newConfig, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateConfig = () => {
    if (!newConfig.from || !newConfig.to || !newConfig.value) {
      alert("Please fill in all fields before saving.");
      return;
    }

    const updatedConfig = [...config];
    if (editIndex !== null) {
      updatedConfig[editIndex] = newConfig;
    } else {
      updatedConfig.push(newConfig);
    }
    setConfig(updatedConfig);
    handleClose();
  };

  const handleDeleteConfig = (index) => {
    const updatedConfig = config.filter((_, i) => i !== index);
    setConfig(updatedConfig);
  };

  const handleSaveConfig = async () => {
    try {
      const payload = { config, minimum_shipping_fee: minimumShippingFee };
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
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
          padding: "5px",
        }}
      >
        <Tab
          label="Minimum Shipping Fee"
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#3d7730",
              color: "white",
              borderRadius: "10px 10px 0 0",
            },
          }}
        />
        <Tab
          label="Shipping Configuration"
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#3d7730",
              color: "white",
              borderRadius: "10px 10px 0 0",
            },
          }}
        />
      </Tabs>

      {tabIndex === 0 && (
        <Paper style={{ padding: 20, marginTop: 20 }}>
          <Typography variant="subtitle1">Minimum Shipping Fee</Typography>
          <TextField
            variant="outlined"
            type="text"
            value={minimumShippingFee}
            onChange={(e) => setMinimumShippingFee(e.target.value)}
            style={{ marginBottom: 20 }}
          />
        </Paper>
      )}
      {tabIndex === 1 && (
        <Paper style={{ padding: 20, marginTop: 20 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
            style={{ marginBottom: 10 }}
          >
            Add New Configuration
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>From Value</TableCell>
                  <TableCell>To Value</TableCell>
                  <TableCell>Shipping Fee</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.length > 0 ? (
                  config.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.from}</TableCell>
                      <TableCell>{row.to}</TableCell>
                      <TableCell>{row.value}</TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => handleOpen(index)}
                          style={{ marginRight: 10 }}
                        >
                          Edit
                        </Button>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => handleDeleteConfig(index)}
                          style={{ marginRight: 10 }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      style={{ textAlign: "center", padding: "16px" }}
                    >
                      No shipping configuration available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Button
        variant="contained"
        color="secondary"
        onClick={handleSaveConfig}
        style={{ marginTop: 20 }}
      >
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
            name="from"
            type="text"
            fullWidth
            margin="dense"
            label="From Value"
            value={newConfig.from}
            onChange={handleChange}
          />
          <TextField
            name="to"
            type="text"
            fullWidth
            margin="dense"
            label="To Value"
            value={newConfig.to}
            onChange={handleChange}
          />
          <TextField
            name="value"
            type="text"
            fullWidth
            margin="dense"
            label="Shipping Fee"
            value={newConfig.value}
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
