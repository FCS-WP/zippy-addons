import { IconButton } from "@mui/material";
import React, { useContext } from "react";
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuContext from "../../contexts/MenuContext";


const ButtonEditMenu = ({ menu }) => {
    const { setSelectedMenu } = useContext(MenuContext);
    
    const onSelectMenu = (e) =>{
        setSelectedMenu(menu);
    }

    return (
      <IconButton
        aria-label="delete"
        size="small"
        onClick={onSelectMenu}
      >
        <ListAltIcon sx={{ fontSize: "20px" }} />
      </IconButton>
    );
  }

export default ButtonEditMenu