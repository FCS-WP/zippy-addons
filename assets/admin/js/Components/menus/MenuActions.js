import { Stack } from "@mui/material";
import React, { useContext } from "react";
import ButtonEditMenu from "./actions/ButtonEditMenu";
import ButtonDelete from "./actions/ButtonDelete";
import { useMenuProvider } from "../../providers/MenuProvider";

const MenuActions = ({ menu }) => {
  const { refetchMenus } = useMenuProvider();
  return (
    <Stack spacing={1} direction={"row"}>
      <ButtonEditMenu menu={menu} />
      <ButtonDelete data={menu} type="menu" onDeleted={refetchMenus} />
    </Stack>
  );
};

export default MenuActions;
