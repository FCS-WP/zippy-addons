import { Paper, styled } from "@mui/material";

export const DateBoxedItem = styled(Paper)(({ theme, selected, disabled }) => ({
  backgroundColor: disabled
    ? "#E0E0E0"
    : selected
    ? theme.palette.primary.main
    : theme.palette.white.main,
  ...theme.typography.body2,
  textAlign: "center",
  color: selected ? theme.palette.white.main : theme.palette.text.secondary,
  transition: "background-color 0.3s ease",
  cursor: disabled ? "not-allowed" : "pointer",
  "&:hover": {
    backgroundColor: disabled
      ? "#E0E0E0"
      : selected
      ? theme.palette.primary.main
      : theme.palette.mode === "dark"
      ? "#2C3740"
      : "#f0f0f0",
  },
}));
