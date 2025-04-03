import { IconButton } from "@mui/material";
import React, { useContext } from "react";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuContext from "../../../contexts/MenuContext";
import { useNavigate } from "react-router";
import { linkMenuAdmin } from "../../../utils/bookingHelper";
import theme from "../../../../theme/theme";

const ButtonEditMenu = ({ menu }) => {
  const { setSelectedMenu } = useContext(MenuContext);
  const navigate = useNavigate();
  const onClick = () => {
    setSelectedMenu(menu);
    navigate(linkMenuAdmin + "&id=" + menu.id);
  };

  return (
    <IconButton aria-label="delete" size="small" onClick={onClick}>
      <ListAltIcon sx={{ fontSize: "20px", color: theme.palette.primary.main  }} />
    </IconButton>
  );
};

export default ButtonEditMenu;
