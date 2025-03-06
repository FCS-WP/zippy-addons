import { createTheme, styled, Tooltip, tooltipClasses } from '@mui/material';
import React from 'react'

const tooltipTheme = createTheme({
    custom: {
        danger: "#b50a0a",
        primary: "#40a944",
        white: "#FFF"
    }
})

const CustomToolTip = styled(({ className, type, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme, type }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: type == 'error' ? tooltipTheme.custom.danger : tooltipTheme.custom.primary,
      color: tooltipTheme.custom.white,
      fontSize: 11,
    },
}));

export { CustomToolTip }