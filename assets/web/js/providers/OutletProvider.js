import React, { useEffect, useState } from "react";
import OutletContext from "../contexts/OutletContext";
import { webApi } from "../api";
import { showAlert } from "../helper/showAlert";
import { getSelectProductId } from "../helper/booking";
import { format } from "date-fns";

const OutletProvider = ({ children }) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState();
  const [menusConfig, setMenusConfig] = useState([]);

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

    return () => {};
  }, []);

  const value = { outlets, selectedOutlet, setSelectedOutlet, menusConfig };
  return (
    <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
  );
};

export default OutletProvider;
