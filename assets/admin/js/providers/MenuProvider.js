import React, { useState } from "react";
import MenuContext from "../contexts/MenuContext";

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
  const [menus, setMenus] = useState(defaultMenus);
  const [selectedMenu, setSelectedMenu] = useState();

  const handleAddNewMenu = (newMenu) => {
    setMenus((prev) => [...prev, newMenu]);
  };

  const value = {
    selectedMenu,
    setSelectedMenu,
    menus,
    setMenus,
    handleAddNewMenu,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export default MenuProvider;
