import { Stack } from "@mui/material";
import React from "react";
import ButtonEditMenu from "./actions/ButtonEditMenu";
import ButtonDelete from "./actions/ButtonDelete";
import ButtonUpdateMenu from "./actions/ButtonUpdateMenu";

const MenuActions = ({ menu }) => {
  return (
    <Stack spacing={1} direction={"row"}>
      <ButtonEditMenu menu={menu} />
      {/* <ButtonUpdateMenu data={menu} /> */}
      <ButtonDelete data={menu} type="menu" />
    </Stack>
  );
};

export default MenuActions;
