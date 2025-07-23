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

  const checkProductType = async () => {
    const params = {
      product_id: document
        .querySelector("#zippy-form")
        .getAttribute("data-product_id"),
    };
    const { data: response } = await webApi.checkBeforeAddToCart(params);
    if (response && response?.status == "success") {
      let enableDelivery = response.is_available_delivery;
      setCartType(enableDelivery ? "retail-store" : "popup-reservation");
      let donaOutletData = enableDelivery ? dataRetailStore : dataPopupReservation
      setCustomOutletData(donaOutletData);
      setCustomOutletSelected(donaOutletData[0]);
    }
  };

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
    checkProductType();

    return () => {};
  }, []);

  const value = {
    outlets,
    selectedOutlet,
    setSelectedOutlet,
    menusConfig,
    cartType,
    customOutletData,
    customOutletSelected,
    setCustomOutletSelected,
  };
  return (
    <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
  );
};

export default OutletProvider;
