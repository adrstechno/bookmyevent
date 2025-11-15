// import React, { useState } from "react";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Stack,
//   Menu,
//   MenuItem,
//   Box,
// } from "@mui/material";
// import { Link, useNavigate } from "react-router-dom";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// const HomeNavbar = () => {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);

//   const handleDropdownClick = (event) => setAnchorEl(event.currentTarget);
//   const handleDropdownClose = () => setAnchorEl(null);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//     navigate("/login");
//   };

//   const handleLogin = () => navigate("/login");

//   return (
//     <AppBar
//       position="sticky"
//       elevation={1}
//       sx={{
//         backgroundColor: "rgba(248, 249, 250, 0.9)",
//         backdropFilter: "blur(12px)",
//         color: "#212529",
//         paddingX: { xs: 2, md: 6 },
//         borderBottom: "1px solid #dee2e6",
//       }}
//     >
//       <Toolbar>
//         {/* Left Logo */}
//         <Typography
//           variant="h6"
//           component={Link}
//           to="/"
//           sx={{
//             color: "#212529",
//             textDecoration: "none",
//             fontWeight: "bold",
//             letterSpacing: 1,
//             flexGrow: { xs: 1, md: 0 },
//           }}
//         >
//           EventSite
//         </Typography>

//         {/* Center Navigation Links */}
//         <Stack
//           direction="row"
//           spacing={3}
//           sx={{
//             mx: "auto",
//             display: { xs: "none", md: "flex" },
//             alignItems: "center",
//           }}
//         >
//           {["Home", "About", "Contact"].map((item) => (
//             <Button
//               key={item}
//               color="inherit"
//               component={Link}
//               to={`/${item.toLowerCase()}`}
//               sx={{
//                 fontWeight: 500,
//                 textTransform: "none",
//                 color: "#343a40",
//                 "&:hover": {
//                   color: "#000",
//                   backgroundColor: "#e9ecef",
//                 },
//                 transition: "all 0.2s ease",
//               }}
//             >
//               {item}
//             </Button>
//           ))}

//           {/* Dropdown Example */}
//           <Box>
//             <Button
//               color="inherit"
//               endIcon={<KeyboardArrowDownIcon />}
//               onClick={handleDropdownClick}
//               sx={{
//                 fontWeight: 500,
//                 textTransform: "none",
//                 color: "#343a40",
//                 "&:hover": {
//                   color: "#000",
//                   backgroundColor: "#e9ecef",
//                 },
//                 transition: "all 0.2s ease",
//               }}
//             >
//               Services
//             </Button>

//             <Menu
//               anchorEl={anchorEl}
//               open={open}
//               onClose={handleDropdownClose}
//               anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//               transformOrigin={{ vertical: "top", horizontal: "center" }}
//               sx={{
//                 "& .MuiPaper-root": {
//                   backgroundColor: "#f8f9fa",
//                   color: "#212529",
//                   border: "1px solid #dee2e6",
//                   borderRadius: 2,
//                 },
//               }}
//             >
//               {[
//                 { label: "Vendor Services", path: "/vendor-services" },
//                 { label: "Event Management", path: "/event-management" },
//                 { label: "Decorations", path: "/decorations" },
//               ].map((service) => (
//                 <MenuItem
//                   key={service.label}
//                   onClick={() => {
//                     handleDropdownClose();
//                     navigate(service.path);
//                   }}
//                   sx={{
//                     "&:hover": {
//                       backgroundColor: "#dee2e6",
//                       color: "#000",
//                     },
//                   }}
//                 >
//                   {service.label}
//                 </MenuItem>
//               ))}
//             </Menu>
//           </Box>
//         </Stack>

//         {/* Right Side Auth Buttons */}
//         <Box sx={{ display: "flex", gap: 2 }}>
//           {isLoggedIn ? (
//             <Button
//               variant="outlined"
//               onClick={handleLogout}
//               sx={{
//                 color: "#212529",
//                 borderColor: "#6c757d",
//                 fontWeight: 500,
//                 textTransform: "none",
//                 "&:hover": {
//                   backgroundColor: "#dee2e6",
//                   borderColor: "#495057",
//                 },
//               }}
//             >
//               Logout
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleLogin}
//               sx={{
//                 backgroundColor: "#343a40",
//                 color: "#f8f9fa",
//                 fontWeight: 600,
//                 textTransform: "none",
//                 "&:hover": {
//                   backgroundColor: "#212529",
//                 },
//               }}
//             >
//               Login
//             </Button>
//           )}
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// };

// export default HomeNavbar;


import React, { useState } from "react";
import { Link } from "react-router-dom";

const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
          {/* <span className="text-xl font-bold text-[#3c6e71]">EventPlus</span> */}
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {["Home", "Vendors", "Events", "About", "Contact"].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="relative group"
            >
              {item}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Buttons */}
        <div className="hidden md:flex space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 border border-[#3c6e71] text-[#3c6e71] rounded-lg hover:bg-[#3c6e71] hover:text-white transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-[#3c6e71] text-white rounded-lg hover:bg-[#2e5558] transition-all duration-300"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div
          className="md:hidden flex flex-col space-y-1 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`w-6 h-[2px] bg-[#3c6e71] transition-transform duration-300 ${
              menuOpen ? "rotate-45 translate-y-[6px]" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-[2px] bg-[#3c6e71] transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-[2px] bg-[#3c6e71] transition-transform duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
            }`}
          ></span>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden bg-white shadow-md transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center py-4 space-y-4 text-gray-700 font-medium">
          {["Home", "Vendors", "Events", "About", "Contact"].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="hover:text-[#3c6e71] transition-colors duration-200"
            >
              {item}
            </Link>
          ))}
          <Link
            to="/login"
            className="px-4 py-2 border border-[#3c6e71] text-[#3c6e71] rounded-lg hover:bg-[#3c6e71] hover:text-white transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-[#3c6e71] text-white rounded-lg hover:bg-[#2e5558] transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
