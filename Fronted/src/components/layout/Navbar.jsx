// import React, { useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";

// const navHeight = 64; // use same value as Sidebar

// const Navbar = () => {
//   // guard against missing provider: useContext may return null if AuthProvider isn't mounted
//   const auth = useContext(AuthContext) || {};
//   const { user, logout } = auth;
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <header
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         height: navHeight,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         padding: "0 20px",
//         background: "#ffffff",
//         borderBottom: "1px solid #e0e0e0",
//         zIndex: 1000,
//       }}
//     >
//       <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//         <div style={{ fontWeight: 700, fontSize: 18 }}>BookMyEvent</div>
//       </div>

//       <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//         <div style={{ color: "#333" }}>{user?.name }</div>
//         {user ? (
//           <button
//             onClick={handleLogout}
//             style={{
//               padding: "6px 12px",
//               borderRadius: 4,
//               border: "1px solid #d0d0d0",
//               background: "#fff",
//               cursor: "pointer",
//             }}
//           >
//             Logout
//           </button>
//         ) : (
//           <button
//             onClick={() => navigate("/login")}
//             style={{
//               padding: "6px 12px",
//               borderRadius: 4,
//               border: "1px solid #1976d2",
//               background: "#1976d2",
//               color: "#fff",
//               cursor: "pointer",
//             }} 
//           >
//             Logout
//           </button>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Navbar;


// // import React, { useContext } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { AuthContext } from "../../context/AuthContext";
// // import { UserCircleIcon } from "@heroicons/react/24/outline";

// // const navHeight = 64;

// // const Navbar = () => {
// //   const auth = useContext(AuthContext) || {};
// //   const { user, logout } = auth;
// //   const navigate = useNavigate();

// //   const handleLogout = () => {
// //     logout();
// //     navigate("/login");
// //   };

// //   return (
// //     <header
// //       style={{
// //         position: "fixed",
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         height: navHeight,
// //         display: "flex",
// //         alignItems: "center",
// //         justifyContent: "space-between",
// //         padding: "0 24px",
// //         backgroundColor: "#3c6e71",
// //         color: "#ffffff",
// //         boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
// //         zIndex: 1000,
// //       }}
// //     >
// //       <h1 style={{ fontSize: 20, fontWeight: 600 }}>Vendor Dashboard</h1>

// //       <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
// //         <UserCircleIcon style={{ height: 28, width: 28, color: "white" }} />
// //         <span style={{ fontWeight: 500 }}>
// //           Welcome, {user?.name || "Vendor"}
// //         </span>

// //         <button
// //           onClick={handleLogout}
// //           style={{
// //             backgroundColor: "white",
// //             color: "#3c6e71",
// //             padding: "6px 14px",
// //             borderRadius: 6,
// //             fontWeight: 500,
// //             border: "none",
// //             cursor: "pointer",
// //             transition: "all 0.3s ease",
// //           }}
// //           onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e8f0f0")}
// //           onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
// //         >
// //           Logout
// //         </button>
// //       </div>
// //     </header>
// //   );
// // };

// // export default Navbar;

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { UserCircleIcon, Bars3Icon } from "@heroicons/react/24/outline";

const navHeight = 64;

const Navbar = ({ onMenuClick, isMobile }) => {
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
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 1200,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo / Brand + hamburger on mobile */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={onMenuClick}
            aria-label="open menu"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
        )}
        {/* Logo image: desktop vs mobile */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            // role-based redirect when clicking the logo
            const role = user?.role;
            let dest = "/";
            if (role === "admin") dest = "/admin/dashboard";
            else if (role === "vendor") dest = "/vendor/dashboard";
            else if (role === "user") dest = "/user/dashboard";
            else if (role === "marketer") dest = "/marketer/dashboard";
            else dest = "/"; // fallback to home
            navigate(dest);
          }}
        >
          <img
            src={isMobile ? "/mobilelogo.png" : "/logo.png"}
            alt="Celebria"
            className={isMobile ? "h-12 w-auto" : "h-12 w-auto"}
          />
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* User Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            backgroundColor: "#f9fafb",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
          }}
        >
          <UserCircleIcon
            style={{ height: 24, width: 24, color: "#3c6e71" }}
          />
          <span style={{ color: "#333", fontWeight: 500 }}>
            {user?.name || "Vendor"}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#3c6e71",
            color: "#ffffff",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#284b63")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#3c6e71")
          }
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
