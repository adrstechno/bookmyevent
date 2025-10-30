// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VendorProfileSetup from "./pages/Dashboards/Vendor/VendorProfileSetup";
// import AboutPage from "./pages/Home/AboutPage";
// import ContactPage from "./pages/Home/ContactPage";

const App = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home */}
      {/* <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} /> */}
       <Route path="vendor/profile-setup" element={<VendorProfileSetup />}/> 

      {/* Default route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
