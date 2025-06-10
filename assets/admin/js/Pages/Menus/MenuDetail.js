import React, { useContext, useEffect, useState } from "react";
import MenuProducts from "../../Components/menus/MenuProducts";
import { Box } from "@mui/material";
import DetailHeader from "../../Components/menus/layouts/DetailHeader";
import { Api } from "../../api";
import BoxEditMenu from "../../Components/menus/layouts/BoxEditMenu";
import { ToastContainer } from "react-toastify";
import MenuContext from "../../contexts/MenuContext";
import BoxEditHappyHours from "../../Components/menus/layouts/BoxEditHappyHours";

const MenuDetail = ({ menuId }) => {
  const [menu, setMenu] = useState();
  const { setSelectedMenu } = useContext(MenuContext);
  const fetchMenuData = async () => {
    const response = await Api.getMenus({ id: menuId });

    if (!response.data || response.data.status !== "success") {
      console.log("Error when get menus", menuId);
      return;
    }

    setMenu(response.data.data[0]);
    setSelectedMenu(response.data.data[0]);
  };

  useEffect(() => {
    fetchMenuData();
    return () => {};
  }, []);

  return (
    <Box>
      {menu && (
        <>
          <DetailHeader menu={menu} />
          <BoxEditMenu menu={menu} />
          <BoxEditHappyHours menu={menu} />
          <MenuProducts menu={menu} />
        </>
      )}
      <ToastContainer />
    </Box>
  );
};

export default MenuDetail;
