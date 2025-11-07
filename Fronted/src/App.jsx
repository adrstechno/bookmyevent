// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/HomePage";

// Admin Pages
import AddService from "./pages/Dashboards/Admin/AddServices";
import Admindashboard from "./pages/Dashboards/Admin/Admindashboard";

// Vendor Pages
import VendorProfileSetup from "./pages/Dashboards/Vendor/VendorProfileSetup";

// Test Page
import TestPage from "./pages/TestPage"; // optional
import AdminUsers from "./pages/Dashboards/Admin/AdminUsers";
import ChangePassword from "./components/ChangePassword";
import VendorDashboard from "./pages/Dashboards/Vendor/VendorDashboard";
import VendorSettings from "./pages/Dashboards/Vendor/VendorSettings";
import MyEvents from "./pages/Dashboards/Vendor/MyEvents";

// import { AuthContext } from "./context/AuthContext"; // not needed now
// import ProtectedRoute from "./components/ProtectedRoute"; // comment out for dev

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path ="/changepassword" element={<ChangePassword />} />
        <Route path="/" element={<Home />} />

        {/* Routes that use MainLayout (dashboard panels) */}
        <Route element={<MainLayout />}>
          {/* Admin */}
          <Route path="admin">
            <Route path="dashboard" element={<Admindashboard />} />
            <Route path = "users" element = {<AdminUsers/>}/>
            <Route path="addservices" element={<AddService />} />
          </Route>

          {/* Vendor */}
          <Route path="vendor">
            <Route path="profile-setup" element={<VendorProfileSetup />} />
            <Route path= "dashboard" element = {<VendorDashboard />} />
            <Route path = "myevents" element={<MyEvents />} />
            <Route path ="setting" element= {<VendorSettings />}/>
            <Route path="test" element={<TestPage />} />
          </Route>

          {/* User */}
          <Route path="user">
            <Route path="test" element={<TestPage />} />
            
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
