import React, { useEffect, useState } from "react";
import MenuProducts from "../../Components/menus/MenuProducts";
import { Box } from "@mui/material";
import DetailHeader from "../../Components/menus/layouts/DetailHeader";
import { Api } from "../../api";
import BoxEditMenu from "../../Components/menus/layouts/BoxEditMenu";

const MenuDetail = ({ menuId }) => {
  const [menu, setMenu] = useState();
  const fetchMenuData = async () => {
    const response = await Api.getMenus({ id: menuId });

    if (!response.data || response.data.status !== "success") {
      console.log("Error when get menus", menuId);
      return;
    }

    setMenu(response.data.data[0]);
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
          <MenuProducts menu={menu} />
        </>
      )}
    </Box>
  );
};

export default MenuDetail;
