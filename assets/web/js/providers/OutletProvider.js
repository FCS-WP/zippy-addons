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
import { SHOP_TYPE } from "../consts/consts";
import DateTimeHelper from "../utils/DateTimeHelper";

const OutletProvider = ({ children }) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState();
  const [menusConfig, setMenusConfig] = useState([]);
  const [cartType, setCartType] = useState();
  const [customOutletData, setCustomOutletData] = useState();
  const [customOutletSelected, setCustomOutletSelected] = useState();

  const checkCartType = async () => {
    const productType = getSelectProductId()[2];
    const currentPath = window.location.pathname;
    let is_retail = currentPath.includes(SHOP_TYPE.RETAIL);
    let is_popup = currentPath.includes(SHOP_TYPE.POPUP_RESERVATION);
    if (is_retail || is_popup) {
      setCartType(is_retail ? SHOP_TYPE.RETAIL : SHOP_TYPE.POPUP_RESERVATION);
      let donaOutletData = is_retail ? dataRetailStore : dataPopupReservation;
    } else {
      setCartType(productType);
    }
  };

  useEffect(() => {
    if (cartType) {
      getStoreData();
    }
  }, [cartType]);

  const getStoreData = async () => {
    const dataStore = await getStoreByType();
    let donaOutletData = dataStore;

    donaOutletData = filterOutlet(donaOutletData);

    setCustomOutletData(donaOutletData);
    setCustomOutletSelected(donaOutletData[0]);
  };

  const filterOutlet = (data) => {
    const today = DateTimeHelper.getToday();

    if (!data || data.length === 0) {
      return [];
    }

    return data.filter((store) => {
      const { start_date, end_date } = store;

      if (!start_date && !end_date) {
        return true;
      }

      if (start_date && end_date) {
        return start_date <= today && today <= end_date;
      }

      if (start_date && !end_date) {
        return start_date <= today;
      }

      if (!start_date && end_date) {
        return today <= end_date;
      }

      return false;
    });
  };

  const getStoreByType = async () => {
    try {
      const { data: response } = await webApi.getStoresByType({
        type: cartType,
      });

      if (response) {
        return response.data;
      }
    } catch (error) {
      showAlert("error", "Failed!", "Can not get retail stores!");
      return [];
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
