import React, { useEffect, useState, useContext, useCallback } from "react";
import OutletContext from "../contexts/OutletContext";
import { webApi } from "../api";
import { getSelectProductId } from "../helper/booking";
import { format } from "date-fns";

const OutletProvider = ({ children }) => {
  const [state, setState] = useState({
    outlets: [],
    selectedOutlet: null,
    menusConfig: [],
    orderModeData: null,
    holidayConfig: [],
    periodWindow: 0,
  });

  const {
    outlets,
    selectedOutlet,
    menusConfig,
    orderModeData,
    holidayConfig,
    periodWindow,
  } = state;

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const getConfigOutlet = useCallback(async () => {
    try {
      const { data: response } = await webApi.getStores();
      if (response?.data) {
        updateState({ outlets: response.data });
      }
    } catch {
      console.warn("Missing outlets");
    }
  }, []);

  const getHolidayConfig = useCallback(async () => {
    if (!selectedOutlet) {
      updateState({ holidayConfig: [] });
      return;
    }
    try {
      const { data: response } = await webApi.getHolidayConfig({
        outlet_id: selectedOutlet.id,
      });
      if (response?.status === "success" && response.data?.date?.length) {
        updateState({ holidayConfig: response.data.date });
      }
    } catch {
      console.warn("Failed to load holiday config");
    }
  }, [selectedOutlet]);

  const handleChangeOutlet = useCallback(async () => {
    if (!selectedOutlet) return;

    try {
      const { id: outletId } = selectedOutlet;
      const productId = getSelectProductId();
      const currentDate = format(new Date(), "yyyy-MM-dd");

      const { data: response } = await webApi.checkProduct({
        outlet_id: outletId,
        product_id: productId,
        current_date: currentDate,
      });

      if (response?.status !== "success") {
        console.warn(response?.message ?? "Can not check product!");
        return;
      }

      updateState({
        periodWindow: response.data?.period_window ?? 0,
        menusConfig: response.data?.menus_operation ?? [],
      });
    } catch {
      console.warn("Failed to check product");
    }
  }, [selectedOutlet]);

  useEffect(() => {
    if (selectedOutlet) {
      handleChangeOutlet();
      getHolidayConfig();
    }
  }, [selectedOutlet, handleChangeOutlet, getHolidayConfig]);

  useEffect(() => {
    getConfigOutlet();
  }, [getConfigOutlet]);
  const productId = getSelectProductId();
  const value = {
    outlets,
    holidayConfig,
    orderModeData,
    selectedOutlet,
    setSelectedOutlet: (outlet) => updateState({ selectedOutlet: outlet }),
    menusConfig,
    setOrderModeData: (data) => updateState({ orderModeData: data }),
    periodWindow,
    productId,
  };

  return (
    <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
  );
};

export default OutletProvider;
export const useOutletProvider = () => useContext(OutletContext);
