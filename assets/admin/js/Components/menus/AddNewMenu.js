import {
  Box,
  Button,
  Grid2,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useContext, useState } from "react";
import { SearchContainer, StyledPaper } from "../mui-custom-styles";
import { BsFillQuestionCircleFill, BsSearch } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { AlertStatus, showAlert } from "../../utils/alertHelper";
import MenuContext from "../../contexts/MenuContext";

const AddNewMenu = () => {
  const { handleAddNewMenu } = useContext(MenuContext);
  const [isLoading, setIsLoading] = useState(false);
  const [menuName, setMenuName] = useState("");

  const handleAddMenus = () => {
    if (!menuName || menuName === "hello") {
      showAlert(AlertStatus.error, "Failed!", "Menu name invalid ");
    } else {
      const newItem = {
        id:  Math.floor(Math.random() * 10000), 
        name: menuName,
        slug: menuName.toLowerCase(),
        availables: [
          {
            weekday: 0,
            is_available: 0,
          },
          {
            weekday: 1,
            is_available: 0,
          },
          {
            weekday: 2,
            is_available: 0,
          },
          {
            weekday: 3,
            is_available: 0,
          },
          {
            weekday: 4,
            is_available: 0,
          },
          {
            weekday: 5,
            is_available: 0,
          },
          {
            weekday: 6,
            is_available: 0,
          },
        ],
      };
      handleAddNewMenu(newItem);
      setMenuName("");
      
      showAlert(AlertStatus.success, "Successfully!", `Menu "${menuName}" had been added`);
    }
  };

  const tooltipAddCategories = `Add new menu.`;

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <StyledPaper>
          <Grid2 container alignItems={"center"} spacing={2}>
            <Grid2 size={{ xs: 12, md: 9 }}>
              <SearchContainer>
                <TextField
                  fullWidth
                  label="Add new menu"
                  variant="outlined"
                  placeholder="Enter menu name..."
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BsSearch />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </SearchContainer>
            </Grid2>
            <Grid2
              display={"flex"}
              justifyContent={"end"}
              size={{ xs: 12, md: 3 }}
              textAlign={"end"}
              alignItems={"center"}
              gap={1}
            >
              <Button
                className="btn-hover-float"
                sx={{ fontSize: "12px" }}
                onClick={handleAddMenus}
                variant="contained"
                disabled={isLoading}
                startIcon={<FiPlus />}
              >
                Create Menu
              </Button>
              <Tooltip title={tooltipAddCategories}>
                <IconButton size="small" sx={{ p: 0, mb: 0.5 }}>
                  <BsFillQuestionCircleFill role="button" />
                </IconButton>
              </Tooltip>
            </Grid2>
          </Grid2>
        </StyledPaper>
      </Grid2>
    </Grid2>
  );
};

export default AddNewMenu;
