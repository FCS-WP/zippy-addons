import { IconButton } from "@mui/material";
import React, { useContext } from "react";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuContext from "../../../contexts/MenuContext";
import { NavLink, useNavigate } from "react-router";
import { linkMenuAdmin } from "../../../utils/bookingHelper";

const ButtonEditMenu = ({ menu }) => {
  const { setSelectedMenu } = useContext(MenuContext);
  const navigate = useNavigate();
  const onClick = () => {
    setSelectedMenu(menu);
    navigate(linkMenuAdmin + "&id=" + menu.id);
  };

  return (
    <IconButton aria-label="delete" size="small" onClick={onClick}>
      <ListAltIcon sx={{ fontSize: "20px" }} />
    </IconButton>
  );
};

export default ButtonEditMenu;
