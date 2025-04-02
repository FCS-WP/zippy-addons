import React, { useEffect, useState } from "react";
import OutletContext from "../contexts/OutletContext";
import { webApi } from "../api";
import { showAlert } from "../helper/showAlert";

const OutletProvider = ({ children }) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState();

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

  useEffect(()=>{
    getConfigOutlet();

    return () => {}
  }, [])

  const value = { outlets, selectedOutlet, setSelectedOutlet };
  return (
    <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
  );
};

export default OutletProvider;
