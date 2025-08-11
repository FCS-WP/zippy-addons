import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import StoreSelector from "../../Components/ShippingFee/StoreSelector";
import TabPanelWrapper from "../../Components/ShippingFee/TabPanelWrapper";
import { toast, ToastContainer } from "react-toastify";
import { Api } from "../../api";
import { generalAPI } from "../../api/general";

const ShippingFeeCalculator = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [minimumOrderToDelivery, setMinimumOrderToDelivery] = useState([]);
  const [minimumOrderToFreeship, setMinimumOrderToFreeship] = useState([]);
  const [extraFee, setExtraFee] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [configMinimumOrder, setConfigMinimumOrder] = useState({});

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const response = await Api.getStore();
        const storeList = response.data.data;
        setStores(storeList);

        if (storeList.length > 0) {
          const firstStoreId = storeList[0].id;
          setSelectedStore(firstStoreId);
          fetchConfig(firstStoreId);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };
    fetchStores();
  }, []);

  const fetchConfig = async (storeId) => {
    if (!storeId) return;
    setLoading(true);

    try {
      const response = await Api.getShipping({ outlet_id: storeId });
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shipping config:", error);
      setMinimumOrderToDelivery([]);
      setMinimumOrderToFreeship([]);
      setExtraFee([]);
      setLoading(false);
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
  const isOverlapping = (index, field, value, state, type, tabIndex) => {
    let newState = [...state];
    newState[index][field] = value;
    let newEntry = newState[index];

    if (
      newEntry.greater_than !== undefined &&
      newEntry.lower_than !== undefined &&
      parseFloat(newEntry.lower_than) <= parseFloat(newEntry.greater_than)
    ) {
      toast.error(
        `Error: 'Lower Than' (${newEntry.lower_than}) must be greater than 'Greater Than' (${newEntry.greater_than})!`
      );
      return true;
    }

    if (
      newEntry.from !== undefined &&
      newEntry.to !== undefined &&
      parseFloat(newEntry.to) <= parseFloat(newEntry.from)
    ) {
      toast.error(
        `Error: 'To' (${newEntry.to}) must be greater than 'From' (${newEntry.from})!`
      );
      return true;
    }

    for (let i = 0; i < state.length; i++) {
      if (i !== index) {
        let current = state[i];

        if (type === "minimum_order_to_delivery") {
          if (
            (newEntry.greater_than >= current.greater_than &&
              newEntry.greater_than < current.lower_than) ||
            (newEntry.lower_than > current.greater_than &&
              newEntry.lower_than <= current.lower_than) ||
            (newEntry.greater_than <= current.greater_than &&
              newEntry.lower_than >= current.lower_than)
          ) {
            toast.error(
              `Error: Overlapping delivery order range with another entry. ` +
                `Greater Than: ${newEntry.greater_than}, Lower Than: ${newEntry.lower_than}`
            );
            return true;
          }
        }

        if (type === "minimum_order_to_freeship") {
          if (
            (newEntry.greater_than >= current.greater_than &&
              newEntry.greater_than < current.lower_than) ||
            (newEntry.lower_than > current.greater_than &&
              newEntry.lower_than <= current.lower_than) ||
            (newEntry.greater_than <= current.greater_than &&
              newEntry.lower_than >= current.lower_than)
          ) {
            toast.error(
              `Error: Overlapping freeship order range with another entry. ` +
                `Greater Than: ${newEntry.greater_than}, Lower Than: ${newEntry.lower_than}`
            );
            return true;
          }
        }

        if (type === "extra_fee") {
          if (newEntry.type === current.type) {
            if (
              (newEntry.from >= current.from && newEntry.from < current.to) ||
              (newEntry.to > current.from && newEntry.to <= current.to) ||
              (newEntry.from <= current.from && newEntry.to >= current.to)
            ) {
              toast.error(
                `Error: Overlapping extra fee range for type '${newEntry.type}'. ` +
                  `From: ${newEntry.from}, To: ${newEntry.to}`
              );
              return true;
            }
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
  const hasEmptyFields = (data, fields) => {
    return data.some((entry) =>
      fields.some(
        (field) =>
          entry[field] === "" ||
          entry[field] === undefined ||
          entry[field] === null
      )
    );
  };
  const handleSaveConfig = async () => {
    setLoading(true);

    if (configMinimumOrder?.key == "minimum_order" && tabIndex == 3) {
      try {
        const params = {
          option_name: [configMinimumOrder.key],
          option_data: [configMinimumOrder.value],
        };
        const { data } = await generalAPI.updateZippOptions(params);
        if (data.status == "success") {
          toast.success("Minimum Order configuration saved successfully!");
          setLoading(false);
        }
      } catch (error) {
        toast.error("Cannot process this action");

        setLoading(false);
      }
      return;
    }

    if (!selectedStore) {
      toast.error("Please select a store.");
      return;
    }
    if (
      hasEmptyFields(minimumOrderToDelivery, ["greater_than", "lower_than"]) ||
      hasEmptyFields(minimumOrderToFreeship, ["greater_than", "lower_than"]) ||
      hasEmptyFields(extraFee, ["from", "to", "type", "fee"])
    ) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }

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
      setLoading(false);
    } catch (error) {
      console.error("Error saving shipping config:", error);
      toast.error("Failed to save shipping fee configuration.");
      setLoading(false);
    }
  };

  const handleConfigMinimumOrder = (data) => {
    console.log(data);
    setConfigMinimumOrder(data);
  };

  return (
    <Container maxWidth="100">
      <Typography variant="h5" style={{ marginBottom: 20 }}>
        Shipping Fee Configuration
      </Typography>

      <Box component={Paper} sx={{ p: 2, mb: 2 }}>
        <StoreSelector
          stores={stores}
          selectedStore={selectedStore}
          onChange={handleStoreChange}
        />
      </Box>
      <TabPanelWrapper
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        selectedStore={selectedStore}
        minimumOrderToDelivery={minimumOrderToDelivery}
        setMinimumOrderToDelivery={setMinimumOrderToDelivery}
        minimumOrderToFreeship={minimumOrderToFreeship}
        setMinimumOrderToFreeship={setMinimumOrderToFreeship}
        extraFee={extraFee}
        setExtraFee={setExtraFee}
        handleInputChange={handleInputChange}
        handleBlur={handleBlur}
        handleDeleteRow={handleDeleteRow}
        handleAddNewRow={handleAddNewRow}
        minimumOrder={handleConfigMinimumOrder}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveConfig}
        style={{ marginTop: 20, marginBottom: 20 }}
        disabled={!selectedStore}
        loading={loading}
      >
        Save
      </Button>
      <ToastContainer />
    </Container>
  );
};

export default ShippingFeeCalculator;
