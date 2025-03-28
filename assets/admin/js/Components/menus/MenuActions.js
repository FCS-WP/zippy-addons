import { Stack } from "@mui/material";
import React from "react";
import ButtonEditMenu from "./actions/ButtonEditMenu";
import ButtonDeleteMenu from "./actions/ButtonDeleteMenu";
import ButtonUpdateMenu from "./actions/ButtonUpdateMenu";

const MenuActions = ({ menu }) => {
  return (
    <Stack spacing={1} direction={"row"}>
      <ButtonEditMenu menu={menu} />
      <ButtonUpdateMenu data={menu} />
      <ButtonDeleteMenu data={menu} />
    </Stack>
  );
};

export default MenuActions;
