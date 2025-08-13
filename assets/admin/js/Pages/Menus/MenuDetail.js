import React, { useContext, useEffect, useState } from "react";
import MenuProducts from "../../Components/menus/MenuProducts";
import { Box } from "@mui/material";
import DetailHeader from "../../Components/menus/layouts/DetailHeader";
import { Api } from "../../api";
import BoxEditMenu from "../../Components/menus/layouts/BoxEditMenu";
import { ToastContainer } from "react-toastify";
import { useMenuProvider } from "../../providers/MenuProvider";

const MenuDetail = ({ menuId }) => {
  const [menu, setMenu] = useState();
  const { setSelectedMenu } = useMenuProvider();

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
  }, []);

  return (
    <Box>
      {menu && (
        <>
          <DetailHeader menu={menu} />
          <BoxEditMenu menu={menu} />
          <MenuProducts menu={menu} />
        </>
      )}
      <ToastContainer />
    </Box>
  );
};

export default MenuDetail;
