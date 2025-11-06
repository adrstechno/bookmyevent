import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const navHeight = 64; // use same value as Sidebar

const Navbar = () => {
  // guard against missing provider: useContext may return null if AuthProvider isn't mounted
  const auth = useContext(AuthContext) || {};
  const { user, logout } = auth;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: navHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>BookMyEvent</div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ color: "#333" }}>{user?.name }</div>
        {user ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #d0d0d0",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #1976d2",
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;

// import React, { useContext } from "react";
// import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";
// import { motion } from "framer-motion";

// const navHeight = 64;

// const Navbar = () => {
//   const { logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <motion.div
//       initial={{ y: -70, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//     >
//       <AppBar
//         position="fixed"
//         elevation={0}
//         sx={{
//           height: navHeight,
//           backdropFilter: "blur(10px)",
//           background:
//             "linear-gradient(135deg, rgba(33,33,33,0.9), rgba(66,66,66,0.85))",
//           borderBottom: "1px solid rgba(255,255,255,0.1)",
//           color: "#f5f5f5",
//           display: "flex",
//           justifyContent: "center",
//           zIndex: 1300,
//           boxShadow: "0 2px 15px rgba(0,0,0,0.3)",
//         }}
//       >
//         <Toolbar
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             px: { xs: 2, sm: 4 },
//           }}
//         >
//           {/* Brand Name */}
//           <Typography
//             variant="h6"
//             sx={{
//               fontWeight: 700,
//               letterSpacing: 0.8,
//               cursor: "pointer",
//               color: "#e0e0e0",
//               fontFamily: "'Poppins', sans-serif",
//               "&:hover": {
//                 color: "#c0c0c0",
//                 transition: "color 0.3s ease",
//               },
//             }}
//             onClick={() => navigate("/")}
//           >
//             BookMyEvent
//           </Typography>

//           {/* Logout Button */}
//           <Box>
//             <Button
//               variant="contained"
//               onClick={handleLogout}
//               sx={{
//                 textTransform: "none",
//                 fontWeight: 600,
//                 borderRadius: "25px",
//                 px: 3,
//                 py: 1,
//                 fontFamily: "'Poppins', sans-serif",
//                 background: "linear-gradient(135deg, #1e1e1e, #3a3a3a)",
//                 color: "#f5f5f5",
//                 boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
//                 border: "1px solid rgba(255,255,255,0.1)",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   background: "linear-gradient(135deg, #2a2a2a, #555)",
//                   boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
//                 },
//                 "&:active": {
//                   transform: "scale(0.98)",
//                 },
//               }}
//             >
//               Logout
//             </Button>
//           </Box>
//         </Toolbar>
//       </AppBar>
//     </motion.div>
//   );
// };

// export default Navbar;
