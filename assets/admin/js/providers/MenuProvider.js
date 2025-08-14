import React, { useContext, useEffect, useState } from "react";
import MenuContext from "../contexts/MenuContext";
import { Api } from "../api";
import { handleDateData } from "../utils/dateHelper";

const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState();
  const [disabledRanges, setDisabledRanges] = useState([]);

  const refetchMenus = async (newMenu) => {
    const response = await Api.getMenus();
    if (!response.data || response.data.status !== 'success') {
      console.log("Error when get menus");
      return;
    } 
    setMenus(response.data.data);
  };

  const getDisabledTimeRanges = () => {
    let results = [];
    if (selectedMenu) {
      menus.map((item) => {
        const condition1 = item.id !== selectedMenu.id;
        const condition2 = handleDateData(item.start_date) && handleDateData(item.end_date);
        if (condition1 && condition2) {
          results.push({ start_date: item.start_date, end_date: item.end_date });
        }
      });
    }
    setDisabledRanges(results);
  };

  const value = {
    selectedMenu,
    setSelectedMenu,
    menus,
    setMenus,
    refetchMenus,
    disabledRanges,
  };

  useEffect(()=>{
    refetchMenus();
    
    return () => {}
  }, [])

  useEffect(()=>{
    getDisabledTimeRanges();
  }, [menus, selectedMenu])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export default MenuProvider;

export const useMenuProvider = () => useContext(MenuContext);
