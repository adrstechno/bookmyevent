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
