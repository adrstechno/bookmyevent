import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleDrawerToggle = () => setMobileOpen((s) => !s);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onMenuClick={handleDrawerToggle} isMobile={isMobile} />

      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      <main
        className={`pt-16 ${isMobile ? "" : "md:ml-64"} p-5 min-h-[calc(100vh-4rem)]`}
        style={{ boxSizing: "border-box" }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

// import React from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";

// const drawerWidth = 240;
// // const navHeight = 64; // still used if you have fixed headers inside pages

// const MainLayout = () => {
//   return (
//     <div>
//       {/* Removed Navbar */}
//       <Sidebar />

//       <main
//         style={{
//           marginLeft: drawerWidth,
//           padding: 20,
//           minHeight: "100vh",
//           background: "#f7f7f8",
//           boxSizing: "border-box",
//         }}
//       >
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default MainLayout;

