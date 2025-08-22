import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#EC7265", // Use 'main' key
    },
    secondary: {
      main: "#DB3F2E",
    },
    white: {
      main: "#FFF",
    },
    text: {
      primary: "#000",
      secondary: "#666",
    },
  },
  typography: {
    fontFamily: 'var(--oworganic-main-font), Helvetica, Arial, sans-serif',
    body1: {
      fontSize: "15px",
      lineHeight: 1.5,
    },
  },
});

export default theme;
