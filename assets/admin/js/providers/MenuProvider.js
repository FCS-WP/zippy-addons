import React, { useEffect, useState } from "react";
import MenuContext from "../contexts/MenuContext";
import { Api } from "../api";
import { handleDateData } from "../utils/dateHelper";

const defaultMenus = [
  {
    id: 1,
    name: "Primary menu",
    slug: "primary-menu",
    availables: [
      { weekday: 0, is_available: 0 },
      { weekday: 1, is_available: 1 },
      { weekday: 2, is_available: 1 },
      { weekday: 3, is_available: 1 },
      { weekday: 4, is_available: 1 },
      { weekday: 5, is_available: 1 },
      { weekday: 6, is_available: 0 },
    ],
  },
  {
    id: 2,
    name: "Secondary menu",
    slug: "secondary-menu",
    availables: [
      { weekday: 0, is_available: 1 },
      { weekday: 1, is_available: 0 },
      { weekday: 2, is_available: 0 },
      { weekday: 3, is_available: 0 },
      { weekday: 4, is_available: 0 },
      { weekday: 5, is_available: 0 },
      { weekday: 6, is_available: 1 },
    ],
  },
];

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
    // let results = [];
    // menus.map((item) => {
    //   if (handleDateData(item.start_date) && handleDateData(item.end_date)) {
    //     results.push({ start_date: item.start_date, end_date: item.end_date });
    //   }
    // });
    // setDisabledRanges([results]);
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
  }, [menus])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export default MenuProvider;
