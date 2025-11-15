// import React, { useContext } from "react";
// import {
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemText,
//   ListItemIcon,
//   Toolbar,
//   Box,
//   Typography,
// } from "@mui/material";
// import { useNavigate, useLocation } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";
// import { menuConfig } from "../../config/menuconfig";

// const drawerWidth = 240;

// const Sidebar = () => {
//   // guard against missing provider
//   const auth = useContext(AuthContext) || {};
//   const user = auth.user;
//   const role = user?.role || localStorage.getItem("role") || "user";
//   const navigate = useNavigate();
//   const location = useLocation();

//   const menuItems = menuConfig[role] || [];

//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         width: drawerWidth,
//         flexShrink: 0,
//         [`& .MuiDrawer-paper`]: {
//           width: drawerWidth,
//           boxSizing: "border-box",
//           backgroundColor: "#fff",
//           borderRight: "1px solid #e0e0e0",
//         },
//       }}
//     >
//       <Toolbar>
//         <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
//           {role.charAt(0).toUpperCase() + role.slice(1)} Panel
//         </Typography>
//       </Toolbar>
//       <Box sx={{ overflow: "auto" }}>
//         <List>
//           {menuItems.map((item, index) => {
//             // normalize path: menuConfig already stores full paths (starting with '/')
//             const path = item.path && item.path.startsWith("/") ? item.path : `/${item.path}`;
//             // active if exact match or current location starts with the path (so subroutes highlight)
//             const active = location.pathname === path || location.pathname.startsWith(path + "/");
//             return (
//               <ListItem key={index} disablePadding>
//                 <ListItemButton
//                   selected={active}
//                   onClick={() => navigate(path)}
//                   sx={{
//                     borderRadius: 2,
//                     mx: 1,
//                     my: 0.5,
//                     "&.Mui-selected": {
//                       backgroundColor: "primary.main",
//                       color: "#fff",
//                       "&:hover": {
//                         backgroundColor: "primary.dark",
//                       },
//                     },
//                   }}
//                 >
//                   <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
//                   <ListItemText primary={item.label} />
//                 </ListItemButton>
//               </ListItem>
//             );
//           })}
//         </List>
//       </Box>
//     </Drawer>
//   );
// };

// export default Sidebar;


import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { menuConfig } from "../../config/menuconfig";

const Sidebar = ({ mobileOpen = false, handleDrawerToggle = () => {}, isMobile = false }) => {
  const auth = useContext(AuthContext) || {};
  const user = auth.user;
  const role = user?.role || localStorage.getItem("role") || "user";
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = menuConfig[role] || [];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:w-64 md:flex md:flex-col md:bg-white md:border-r md:border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#3c6e71]">{role.charAt(0).toUpperCase() + role.slice(1)} Panel</h3>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {menuItems.map((item, index) => {
            const path = item.path && item.path.startsWith("/") ? item.path : `/${item.path}`;
            const active = location.pathname === path || location.pathname.startsWith(path + "/");
            return (
              <button
                key={index}
                onClick={() => navigate(path)}
                className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-md mb-1 transition-colors ${active ? "bg-[#3c6e71] text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 ${active ? "text-white" : "text-[#3c6e71]"}`}>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 text-center text-sm text-gray-500 border-t">© {new Date().getFullYear()} Vendor System</div>
      </aside>

      {/* Mobile temporary drawer */}
      {isMobile && (
        <div className={`fixed inset-0 z-40 ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
          <div className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity ${mobileOpen ? "opacity-100 backdrop-blur-sm" : "opacity-0"}`} onClick={handleDrawerToggle}></div>

          <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <h3 className="text-lg font-semibold text-[#3c6e71]">{role.charAt(0).toUpperCase() + role.slice(1)} Panel</h3>
              <button onClick={handleDrawerToggle} className="p-2 rounded-md hover:bg-gray-100">✕</button>
            </div>

            <nav className="px-2 py-4 overflow-y-auto">
              {menuItems.map((item, index) => {
                const path = item.path && item.path.startsWith("/") ? item.path : `/${item.path}`;
                const active = location.pathname === path || location.pathname.startsWith(path + "/");
                return (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(path);
                      handleDrawerToggle();
                    }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-md mb-1 transition-colors ${active ? "bg-[#3c6e71] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 ${active ? "text-white" : "text-[#3c6e71]"}`}>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 text-center text-sm text-gray-500 border-t">© {new Date().getFullYear()} Vendor System</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
