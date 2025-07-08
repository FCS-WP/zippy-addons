import { Stack } from "@mui/material";
import React, { useContext } from "react";
import ButtonEditMenu from "./actions/ButtonEditMenu";
import ButtonDelete from "./actions/ButtonDelete";
import MenuContext from "../../contexts/MenuContext";

const MenuActions = ({ menu }) => {
  const { refetchMenus } = useContext(MenuContext);
  return (
    <Stack spacing={1} direction={"row"}>
      <ButtonEditMenu menu={menu} />
      <ButtonDelete data={menu} type="menu" onDeleted={refetchMenus} />
    </Stack>
  );
};

export default MenuActions;
