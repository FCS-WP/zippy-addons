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
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
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
      console.log("Shipping Config Response:", response.data);
      const data = response.data.data;

      if (response.data.status === "error") {
        toast.error(response.data.message || "Failed to fetch shipping data");
        setMinimumOrderToDelivery([]);
        setMinimumOrderToFreeship([]);
        setExtraFee([]);
        return;
      }

      setMinimumOrderToDelivery(data?.minimum_order_to_delivery || []);
      setMinimumOrderToFreeship(data?.minimum_order_to_freeship || []);
      setExtraFee(data?.extra_fee || []);
    } catch (error) {
      console.error("Error fetching shipping config:", error);
      toast.error("An error occurred while fetching shipping configuration.");
      setMinimumOrderToDelivery([]);
      setMinimumOrderToFreeship([]);
      setExtraFee([]);
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

  const isOverlapping = (index, field, value, state, type) => {
    let newState = [...state];
    newState[index][field] = value;
    let newEntry = newState[index];

    if (
      newEntry.greater_than !== undefined &&
      newEntry.lower_than !== undefined &&
      parseFloat(newEntry.lower_than) <= parseFloat(newEntry.greater_than)
    ) {
      toast.error("'Lower Than' must be greater than 'Greater Than'!");
      return true;
    }

    if (
      newEntry.from !== undefined &&
      newEntry.to !== undefined &&
      parseFloat(newEntry.to) <= parseFloat(newEntry.from)
    ) {
      toast.error("'To' must be greater than 'From'!");
      return true;
    }

    for (let i = 0; i < newState.length; i++) {
      if (i !== index) {
        let current = newState[i];

        if (type === "order_range") {
          if (
            (newEntry.greater_than >= current.greater_than &&
              newEntry.greater_than < current.lower_than) ||
            (newEntry.lower_than > current.greater_than &&
              newEntry.lower_than <= current.lower_than) ||
            (newEntry.greater_than <= current.greater_than &&
              newEntry.lower_than >= current.lower_than)
          ) {
            toast.error(
              "Order range is overlapping with another entry. Please adjust!"
            );
            return true;
          }
        }

        if (type === "extra_fee" && newEntry.type === current.type) {
          if (
            (newEntry.from >= current.from && newEntry.from < current.to) ||
            (newEntry.to > current.from && newEntry.to <= current.to) ||
            (newEntry.from <= current.from && newEntry.to >= current.to)
          ) {
            toast.error(
              "Extra Fee range is overlapping with another entry. Please adjust!"
            );
            return true;
          }
        }
      }
    }
    return false;
  };

  const handleInputChange = (index, field, value, setState, state) => {
    const updatedData = [...state];
    updatedData[index][field] = value;
    setState(updatedData);
  };

  const handleBlur = (index, field, state, type) => {
    if (isOverlapping(index, field, state[index][field], state, type)) {
      return;
    }
  };

  const handleDeleteRow = (index, setState, state) => {
    setState(state.filter((_, i) => i !== index));
  };
  const handleSaveConfig = async () => {
    if (!selectedStore) {
      toast.error("Please select a store.");
      return;
    }

    // Check for overlap errors in Minimum Order to Delivery
    for (let i = 0; i < minimumOrderToDelivery.length; i++) {
      if (
        isOverlapping(
          i,
          "greater_than",
          minimumOrderToDelivery[i].greater_than,
          minimumOrderToDelivery,
          "order_range"
        )
      ) {
        return;
      }
    }

    for (let i = 0; i < minimumOrderToFreeship.length; i++) {
      if (
        isOverlapping(
          i,
          "greater_than",
          minimumOrderToFreeship[i].greater_than,
          minimumOrderToFreeship,
          "order_range"
        )
      ) {
        return;
      }
    }

    for (let i = 0; i < extraFee.length; i++) {
      if (isOverlapping(i, "from", extraFee[i].from, extraFee, "extra_fee")) {
        return;
      }
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
        <Select
          value={selectedStore || ""}
          onChange={handleStoreChange}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Please choose
          </MenuItem>
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
                                setMinimumOrderToDelivery,
                                minimumOrderToDelivery
                              )
                            }
                            onBlur={() =>
                              handleBlur(
                                index,
                                "greater_than",
                                minimumOrderToDelivery,
                                "order_range"
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
                                setMinimumOrderToDelivery,
                                minimumOrderToDelivery
                              )
                            }
                            onBlur={() =>
                              handleBlur(
                                index,
                                "lower_than",
                                minimumOrderToDelivery,
                                "order_range"
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
                        value={row.type || ""}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "type",
                            e.target.value,
                            setExtraFee,
                            extraFee
                          )
                        }
                        displayEmpty
                      >
                        {!extraFee.some(
                          (fee) => fee.type === "postal_code"
                        ) && (
                          <MenuItem value="postal_code">postal_code</MenuItem>
                        )}

                        {extraFee
                          .map((fee) => fee.type)
                          .filter(
                            (type, idx, self) =>
                              type && self.indexOf(type) === idx
                          )
                          .map((type, idx) => (
                            <MenuItem key={idx} value={type}>
                              {type}
                            </MenuItem>
                          ))}
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
                        onBlur={() =>
                          handleBlur(index, "from", extraFee, "extra_fee")
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
                        onBlur={() =>
                          handleBlur(index, "to", extraFee, "extra_fee")
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
      <ToastContainer />
    </Container>
  );
};

export default ShippingFeeCalculator;
