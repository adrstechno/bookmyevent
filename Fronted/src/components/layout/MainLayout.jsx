import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const drawerWidth = 240;
const navHeight = 64;

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <Sidebar />

      <main
        style={{
          marginTop: navHeight,
          marginLeft: drawerWidth,
          padding: 20,
          minHeight: `calc(100vh - ${navHeight}px)`,
          background: "#f7f7f8",
          boxSizing: "border-box",
        }}
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

