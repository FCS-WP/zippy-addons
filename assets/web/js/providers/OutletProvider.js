import React, { useEffect, useState, useContext } from "react";
import OutletContext from "../contexts/OutletContext";
import { webApi } from "../api";
import { showAlert } from "../helper/showAlert";
import { getSelectProductId } from "../helper/booking";
import { format } from "date-fns";

const OutletProvider = ({ children }) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState();
  const [menusConfig, setMenusConfig] = useState([]);
  const [orderModeData, setOrderModeData] = useState();
  const [holidayConfig, setHolidayConfig] = useState([]);
  const [periodWindow, setPeriodWindow] = useState(0);

  const getConfigOutlet = async () => {
    try {
      const { data: response } = await webApi.getStores();
      if (response) {
        setOutlets(response.data);
      }
    } catch (error) {
      console.warn("Missing outlets");
    }
  };

  const getHolidayConfig = async () => {
    if (!selectedOutlet) {
      setHolidayConfig([]);
      return;
    }
    const params = {
      outlet_id: selectedOutlet.id,
    };

    const { data: response } = await webApi.getHolidayConfig(params);
    if (!response) {
      return;
    }
    if (response.data && response.data.length > 0) {
      setHolidayConfig(response.data);
    }
  };

  const handleChangeOutlet = async () => {
    if (!selectedOutlet) {
      return;
    }

    const productId = getSelectProductId();
    const outletId = selectedOutlet.id;
    const currentDate = new Date();

    const params = {
      outlet_id: outletId,
      product_id: productId,
      current_date: format(currentDate, "yyyy-MM-dd"),
    };

    const { data: response } = await webApi.checkProduct(params);
    if (!response || response.status !== "success") {
      console.warn(response?.message ?? "Can not check product!");
    }
    setPeriodWindow(response.data?.period_window);
    setMenusConfig(response.data.menus_operation);
  };

  useEffect(() => {
    handleChangeOutlet();
    getHolidayConfig();
  }, [selectedOutlet]);

  useEffect(() => {
    getConfigOutlet();

    return () => {};
  }, []);

  const value = {
    outlets,
    holidayConfig,
    orderModeData,
    selectedOutlet,
    setSelectedOutlet,
    menusConfig,
    setOrderModeData,
    periodWindow,
  };
  return (
    <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
  );
};

export default OutletProvider;
export const useOutletProvider = () => useContext(OutletContext);
