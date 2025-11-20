// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/HomePage";
import VendorDetail from "./pages/VendorDetail";
import CartPage from "./pages/CartPage";

// Admin Pages
import AddService from "./pages/Dashboards/Admin/AddServices";
import Admindashboard from "./pages/Dashboards/Admin/Admindashboard";

// Vendor Pages
import VendorProfileSetup from "./pages/Dashboards/Vendor/VendorProfileSetup";


import AdminUsers from "./pages/Dashboards/Admin/AdminUsers";
import ChangePassword from "./components/ChangePassword";
import VendorDashboard from "./pages/Dashboards/Vendor/VendorDashboard";
import VendorSettings from "./pages/Dashboards/Vendor/VendorSettings";
import MyEvents from "./pages/Dashboards/Vendor/MyEvents";
import VendorGallery from "./pages/Dashboards/Vendor/VendorGallery";
import UserDashboard from "./pages/Dashboards/User/UserDashboard";
import CategoryPage from "./pages/CategoryPage";
import WhyUsPage from "./pages/WhyUsPage";
import ShiftList from "./pages/Dashboards/Vendor/VendorShiftPage";
import VendorShiftPage from "./pages/Dashboards/Vendor/VendorShiftPage";
import MyPackege from "./pages/Dashboards/Vendor/MyPackege";
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
  <Route path ="/category/:slug" element={<CategoryPage />} />
  <Route path="/vendor/view/:id" element={<VendorDetail />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/why-us" element={<WhyUsPage />} />
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
            <Route path="shifts" element={<VendorShiftPage />} />
            <Route path= "dashboard" element = {<VendorDashboard />} />
            <Route path = "myevents" element={<MyEvents />} />
            <Route path ="gallery" element={<VendorGallery />} />
            <Route path ="mypackege" element={<MyPackege />} />
            <Route path ="setting" element= {<VendorSettings />}/>
           
          </Route>

          {/* User */}
          <Route path="user">
            <Route path="dashboard" element={<UserDashboard />} />
            
            
          </Route>

                  
        </Route>
      </Routes>
    </AuthProvider>
  );
}
