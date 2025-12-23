// // import { createTheme } from "@mui/material/styles";

// // const theme = createTheme({
// //   palette: {
// //     mode: "light",
// //     primary: {
// //       main: "#343a40",
// //       light: "#495057",
// //       dark: "#212529",
// //       contrastText: "#f8f9fa",
// //     },
// //     secondary: {
// //       main: "#6c757d",
// //       light: "#adb5bd",
// //       dark: "#495057",
// //       contrastText: "#f8f9fa",
// //     },
// //     background: {
// //       default: "#f8f9fa",
// //       paper: "#e9ecef",
// //     },
// //     text: {
// //       primary: "#212529",
// //       secondary: "#495057",
// //       disabled: "#adb5bd",
// //     },
// //     divider: "#dee2e6",
// //   },

// //   typography: {
// //     fontFamily: ['"Roboto"', '"Helvetica"', '"Arial"', "sans-serif"].join(","),
// //     h1: { fontWeight: 700, color: "#212529" },
// //     h2: { fontWeight: 600, color: "#343a40" },
// //     body1: { color: "#212529", fontSize: "1rem" },
// //     body2: { color: "#495057", fontSize: "0.9rem" },
// //     button: { textTransform: "none", fontWeight: 600 },
// //   },

// //   components: {
// //     MuiButton: {
// //       styleOverrides: {
// //         root: {
// //           borderRadius: 8,
// //           "&:hover": { backgroundColor: "#495057" },
// //         },
// //       },
// //     },
// //     MuiCard: {
// //       styleOverrides: {
// //         root: {
// //           borderRadius: 12,
// //           backgroundColor: "#e9ecef",
// //           boxShadow: "0 2px 8px rgba(33, 37, 41, 0.1)",
// //         },
// //       },
// //     },
// //     MuiAppBar: {
// //       styleOverrides: {
// //         root: {
// //           backgroundColor: "#343a40",
// //           color: "#f8f9fa",
// //           boxShadow: "0 2px 10px rgba(33, 37, 41, 0.2)",
// //         },
// //       },
// //     },
// //   },
// // });

// // export default theme;

// // src/theme/theme.js

// const theme = {
//   colors: {
//     light: "#f8f9fa",
//     lighter: "#e9ecef",
//     soft: "#dee2e6",
//     muted: "#ced4da",
//     grayish: "#adb5bd",
//     medium: "#6c757d",
//     dark: "#495057",
//     darker: "#343a40",
//     deepest: "#212529",
//   },
//   radius: {
//     soft: "12px",
//     medium: "8px",
//   },
//   shadow: {
//     soft: "0 2px 8px rgba(33, 37, 41, 0.1)",
//   },
//   font: {
//     family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//   },
// };

// export default theme;

// src/theme/theme.js
export const theme = {
  colors: {
    light: "#F8F9FA",
    lightGray: "#E9ECEF",
    gray: "#DEE2E6",
    mediumGray: "#CED4DA",
    darkGray: "#ADB5BD",
    darkerGray: "#6C757D",
    textDark: "#495057",
    textDarker: "#343A40",
    textDarkest: "#212529",
  },
  fonts: {
    body: "Inter, sans-serif",
    heading: "Poppins, sans-serif",
  },
  borderRadius: "0.5rem",
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },
};
