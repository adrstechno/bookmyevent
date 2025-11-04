import React, { useContext } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Box,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { menuConfig } from "../../config/menuconfig";

const drawerWidth = 240;

const Sidebar = () => {
  // guard against missing provider
  const auth = useContext(AuthContext) || {};
  const user = auth.user;
  const role = user?.role || localStorage.getItem("role") || "user";
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = menuConfig[role] || [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#fff",
          borderRight: "1px solid #e0e0e0",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
          {role.charAt(0).toUpperCase() + role.slice(1)} Panel
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item, index) => {
            // normalize path: menuConfig already stores full paths (starting with '/')
            const path = item.path && item.path.startsWith("/") ? item.path : `/${item.path}`;
            // active if exact match or current location starts with the path (so subroutes highlight)
            const active = location.pathname === path || location.pathname.startsWith(path + "/");
            return (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={active}
                  onClick={() => navigate(path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
