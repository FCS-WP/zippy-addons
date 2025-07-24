import React, { useEffect, useState } from "react";
import OutletContext from "../contexts/OutletContext";
import { webApi } from "../api";
import { showAlert } from "../helper/showAlert";
import {
  dataPopupReservation,
  dataRetailStore,
  getSelectProductId,
} from "../helper/booking";
import { format } from "date-fns";

const OutletProvider = ({ children }) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState();
  const [menusConfig, setMenusConfig] = useState([]);
  const [cartType, setCartType] = useState();
  const [customOutletData, setCustomOutletData] = useState();
  const [customOutletSelected, setCustomOutletSelected] = useState();

  const checkCartType = async () => {
    const currentPath = window.location.pathname;
    let is_retail = currentPath.includes("retail-store");
    let is_popup = currentPath.includes("popup-reservation");
    if (is_retail || is_popup) {
      setCartType(is_retail ? "retail-store" : "popup-reservation");
      let donaOutletData = is_retail ? dataRetailStore : dataPopupReservation;
    }
  };

  useEffect(() => {
    if (cartType) {
      let donaOutletData =
        cartType === "retail-store" ? dataRetailStore : dataPopupReservation;
      setCustomOutletData(donaOutletData);
      setCustomOutletSelected(donaOutletData[0]);
    }
  }, [cartType]);

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

  const handleChangeOutlet = async () => {
    if (!selectedOutlet) {
      return;
    }

    const productId = getSelectProductId()[0];
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

    setMenusConfig(response.data.menus_operation);
  };

  useEffect(() => {
    handleChangeOutlet();
  }, [selectedOutlet]);

  useEffect(() => {
    getConfigOutlet();
    checkCartType();

    return () => {};
  }, []);

  const value = {
    outlets,
    selectedOutlet,
    setSelectedOutlet,
    menusConfig,
    cartType,
    setCartType,
    customOutletData,
    customOutletSelected,
    setCustomOutletSelected,
  };
  return (
    <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
  );
};

export default OutletProvider;
