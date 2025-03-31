import React, { useEffect, useState } from "react";
import MenuContext from "../contexts/MenuContext";
import { Api } from "../api";

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

  const refetchMenus = async (newMenu) => {
    const response = await Api.getMenus();
    if (!response.data || response.data.status !== 'success') {
      console.log("Error when get menus");
      return;
    } 
    setMenus(response.data.data);
  };

  const value = {
    selectedMenu,
    setSelectedMenu,
    menus,
    setMenus,
    refetchMenus,
  };

  useEffect(()=>{
    refetchMenus();
    
    return () => {
      
    }
  }, [])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export default MenuProvider;
