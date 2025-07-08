import { Box, Button, styled, Typography } from "@mui/material";
import React from "react";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

const CustomButton = styled(Button)(({ theme })=>({
  transition: 'all 0.2s ease-in-out',
  "&:hover": {
    backgroundColor: theme.palette.primary.main, 
  },
   "&:hover > .MuiSvgIcon-root" : {
    color: theme.palette.white.main,
   }
}));

const FormHeading = ({ onBack, title }) => {
  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      px={2}
    >
      <CustomButton onClick={() => onBack()} color="gray">
        <KeyboardBackspaceIcon />
      </CustomButton>
      <Typography
        variant="h2"
        fontSize={20}
        fontWeight={600}
        textAlign={"center"}
      >
        {title ?? ""}
      </Typography>
      <CustomButton className="btn-close-lightbox" color="gray">
        <ClearIcon />
      </CustomButton>
    </Box>
  );
};

export default FormHeading;
