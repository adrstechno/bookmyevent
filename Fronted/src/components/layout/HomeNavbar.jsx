import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const HomeNavbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        background: "rgba(25, 118, 210, 0.95)",
        backdropFilter: "blur(10px)",
        paddingX: { xs: 2, md: 6 },
      }}
    >
      <Toolbar>
        {/* Left Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
            letterSpacing: 1,
            flexGrow: { xs: 1, md: 0 },
          }}
        >
          EventSite
        </Typography>

        {/* Center Navigation Links */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            mx: "auto",
            display: { xs: "none", md: "flex" },
            alignItems: "center",
          }}
        >
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ fontWeight: 500, "&:hover": { color: "#ffeb3b" } }}
          >
            Home
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/about"
            sx={{ fontWeight: 500, "&:hover": { color: "#ffeb3b" } }}
          >
            About
          </Button>

          {/* Dropdown Example */}
          <Box>
            <Button
              color="inherit"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleDropdownClick}
              sx={{
                fontWeight: 500,
                "&:hover": { color: "#ffeb3b" },
              }}
            >
              Services
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleDropdownClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <MenuItem
                onClick={() => {
                  handleDropdownClose();
                  navigate("/vendor-services");
                }}
              >
                Vendor Services
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDropdownClose();
                  navigate("/event-management");
                }}
              >
                Event Management
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDropdownClose();
                  navigate("/decorations");
                }}
              >
                Decorations
              </MenuItem>
            </Menu>
          </Box>

          <Button
            color="inherit"
            component={Link}
            to="/contact"
            sx={{ fontWeight: 500, "&:hover": { color: "#ffeb3b" } }}
          >
            Contact
          </Button>
        </Stack>

        {/* Right Side Auth Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {isLoggedIn ? (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              sx={{
                borderColor: "#fff",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "primary.main",
                },
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogin}
              sx={{
                backgroundColor: "#ffeb3b",
                color: "#000",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#fff176",
                },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HomeNavbar;
