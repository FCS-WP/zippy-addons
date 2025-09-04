import React, { useCallback, useContext, useEffect, useState } from "react";
import MenuContext from "../contexts/MenuContext";
import { Api } from "../api";
import { handleDateData } from "../utils/dateHelper";
import OrderContext from "../contexts/OrderContext";
import { toast } from "react-toastify";

const OrderProvider = ({ children }) => {
  const [isFetching, setIsFetching] = useState(true);
  const [state, setState] = useState({
    outlets: [],
    selectedOutlet: null,
    menusConfig: [],
    orderModeData: null,
    holidayConfig: [],
    periodWindow: 0,
    selectedDate: null,
    selectedTime: null,
    selectedLocation: null,
    selectedMode: "takeaway",
    deliveryDistance: null,
  });
  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const {
    outlets,
    selectedOutlet,
    orderModeData,
    holidayConfig,
    selectedLocation,
    selectedMode,
    selectedTime,
    selectedDate,
    deliveryDistance,
  } = state;

  const refetchOutlet = async () => {
    const response = await Api.getStore();
    if (!response.data || response.data.status !== "success") {
      console.log("Error when get outlets");
      return;
    }
    updateState({ outlets: response.data.data });
  };

  const handleGetConfig = async () => {
    if (!selectedOutlet || !selectedMode) {
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    const params = {
      outlet_id: selectedOutlet.id,
      delivery_type: selectedMode,
    };
    const { data: response } = await Api.getDeliveryConfig(params);
    if (!response) {
      console.log("Error get config from BE");
      return;
    }
    updateState({ orderModeData: response.data });
    setTimeout(() => {
      setIsFetching(false);
    }, 1000);
  };

  const getHolidayConfig = useCallback(async () => {
    if (!selectedOutlet) {
      updateState({ holidayConfig: [] });
      return;
    }
    try {
      const { data: response } = await Api.getHolidayConfig({
        outlet_id: selectedOutlet.id,
      });
      if (response?.status === "success" && response.data?.date?.length) {
        updateState({ holidayConfig: response.data.date });
      }
    } catch {
      console.warn("Failed to load holiday config");
    }
  }, [selectedOutlet]);

  const handleDistance = async () => {
    if (!selectedOutlet || !selectedLocation || selectedMode !== 'delivery') {
         updateState({ deliveryDistance: null });
      return;
    }
    try {
      const params = {
        from: {
          lat: selectedOutlet.outlet_address.coordinates.lat,
          lng: selectedOutlet.outlet_address.coordinates.lng,
        },
        to: {
          lat: selectedLocation.LATITUDE,
          lng: selectedLocation.LONGITUDE,
        },
      };

      const { data: response } = await Api.searchRoute(params);
      updateState({ deliveryDistance: response.data.total_distance });
      console.log("response.data.total_distance", response.data.total_distance)

    } catch (error) {
      toast.error("Failed to get distance!");
    }
  };

  const value = {
    outlets,
    selectedOutlet,
    orderModeData,
    holidayConfig,
    selectedLocation,
    updateState,
    selectedMode,
    selectedDate,
    isFetching,
    deliveryDistance,
    selectedTime,
  };

  useEffect(() => {
    refetchOutlet();
    getHolidayConfig();

    return () => {};
  }, []);

  useEffect(() => {
    handleGetConfig();
  }, [selectedMode, selectedOutlet]);

  useEffect(()=>{
    if (selectedOutlet && selectedLocation && selectedMode == 'delivery') {
      handleDistance();
    }
  }, [selectedOutlet, selectedLocation])

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export default OrderProvider;

export const useOrderProvider = () => useContext(OrderContext);
