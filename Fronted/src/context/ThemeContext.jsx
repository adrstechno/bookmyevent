import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#7B1E24" }, // traditional maroon
    secondary: { main: "#CBA135" }, // gold tone
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export const ThemeContext = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);
