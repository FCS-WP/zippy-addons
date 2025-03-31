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
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { Api } from "../../api";

const ShippingFeeCalculator = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [minimumOrderToDelivery, setMinimumOrderToDelivery] = useState([]);
  const [minimumOrderToFreeship, setMinimumOrderToFreeship] = useState([]);
  const [extraFee, setExtraFee] = useState([]);
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
      const data = response.data.data;
      setMinimumOrderToDelivery(data.minimum_order_to_delivery || []);
      setMinimumOrderToFreeship(data.minimum_order_to_freeship || []);
      setExtraFee(data.extra_fee || []);
    } catch (error) {
      console.error("Error fetching shipping config:", error);
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

  const handleAddNewRow = (setState, newRow) => {
    setState((prev) => [...prev, newRow]);
  };

  const handleInputChange = (index, field, value, setState, state) => {
    const updatedData = [...state];
    updatedData[index][field] = value;
    setState(updatedData);
  };

  const handleDeleteRow = (index, setState, state) => {
    setState(state.filter((_, i) => i !== index));
  };
  const handleSaveConfig = async () => {
    if (!selectedStore) {
      toast.error("Please select a store.");
      return;
    }

    const payload = {
      outlet_id: selectedStore,
      minimum_order_to_delivery: minimumOrderToDelivery,
      minimum_order_to_freeship: minimumOrderToFreeship,
      extra_fee: extraFee,
    };

    try {
      const response = await Api.addShipping(payload);
      toast.success("Shipping fee configuration saved successfully!");
      console.log("Saved Configuration:", response.data);
    } catch (error) {
      console.error("Error saving shipping config:", error);
      toast.error("Failed to save shipping fee configuration.");
    }
  };

  return (
    <Container maxWidth="100">
      <Typography variant="h5" style={{ marginBottom: 20 }}>
        Shipping Fee Configuration
      </Typography>
      <FormControl fullWidth style={{ marginBottom: 20 }}>
        <Typography>Select Store</Typography>
        <Select value={selectedStore} onChange={handleStoreChange}>
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.outlet_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="Minimum Order to Delivery" />
        <Tab label="Minimum Order to Freeship" />
        <Tab label="Extra Fee" />
      </Tabs>

      {[minimumOrderToDelivery, minimumOrderToFreeship].map(
        (state, idx) =>
          tabIndex === idx && (
            <Paper style={{ padding: 20, marginTop: 20 }} key={idx}>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  handleAddNewRow(
                    idx === 0
                      ? setMinimumOrderToDelivery
                      : setMinimumOrderToFreeship,
                    { greater_than: "", lower_than: "", fee: "" }
                  )
                }
              >
                Add New
              </Button>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Greater Than</TableCell>
                      <TableCell>Lower Than</TableCell>
                      <TableCell>Fee</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.greater_than}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "greater_than",
                                e.target.value,
                                idx === 0
                                  ? setMinimumOrderToDelivery
                                  : setMinimumOrderToFreeship,
                                state
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.lower_than}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "lower_than",
                                e.target.value,
                                idx === 0
                                  ? setMinimumOrderToDelivery
                                  : setMinimumOrderToFreeship,
                                state
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.fee}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "fee",
                                e.target.value,
                                idx === 0
                                  ? setMinimumOrderToDelivery
                                  : setMinimumOrderToFreeship,
                                state
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleDeleteRow(
                                index,
                                idx === 0
                                  ? setMinimumOrderToDelivery
                                  : setMinimumOrderToFreeship,
                                state
                              )
                            }
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )
      )}

      {tabIndex === 2 && (
        <Paper style={{ padding: 20, marginTop: 20 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              handleAddNewRow(setExtraFee, {
                type: "",
                from: "",
                to: "",
                fee: "",
              })
            }
          >
            Add New
          </Button>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extraFee.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ width: "20%" }}>
                      <Select
                        fullWidth
                        value={row.type}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "type",
                            e.target.value,
                            setExtraFee,
                            extraFee
                          )
                        }
                      >
                        <MenuItem value="fixed">Fixed</MenuItem>
                        <MenuItem value="percentage">Percentage</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={{ width: "20%" }}>
                      <TextField
                        fullWidth
                        type="number"
                        value={row.from}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "from",
                            e.target.value,
                            setExtraFee,
                            extraFee
                          )
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ width: "20%" }}>
                      <TextField
                        fullWidth
                        type="number"
                        value={row.to}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "to",
                            e.target.value,
                            setExtraFee,
                            extraFee
                          )
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ width: "20%" }}>
                      <TextField
                        fullWidth
                        type="number"
                        value={row.fee}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "fee",
                            e.target.value,
                            setExtraFee,
                            extraFee
                          )
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ width: "20%" }}>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeleteRow(index, setExtraFee, extraFee)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveConfig}
        style={{ marginTop: 20, marginBottom: 20 }}
      >
        Save
      </Button>
    </Container>
  );
};

export default ShippingFeeCalculator;
