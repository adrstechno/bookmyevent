import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteDebugger from "./components/RouteDebugger";
import { useEffect } from "react";

import ProtectedRoute from "./routes/ProtectedRoute";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ChangePassword from "./components/ChangePassword";

// Public Pages
import Home from "./pages/HomePage";
import HomePageWrapper from "./components/HomePageWrapper";
import WhyUsPage from "./pages/WhyUsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import Admindashboard from "./pages/Dashboards/Admin/AdminDashboard";
import AdminUsers from "./pages/Dashboards/Admin/AdminUsers";
import AddService from "./pages/Dashboards/Admin/AddServices";
import MainService from "./pages/Dashboards/Admin/MainService";
import AdminBookings from "./pages/Dashboards/Admin/AdminBookings";
import ManualReservations from "./pages/Dashboards/Admin/ManualReservations";

// Vendor Pages
import VendorDashboard from "./pages/Dashboards/Vendor/VendorDashboard";
import VendorProfileSetup from "./pages/Dashboards/Vendor/VendorProfileSetup";
import VendorShiftPage from "./pages/Dashboards/Vendor/VendorShiftPage";
import MyEvents from "./pages/Dashboards/Vendor/MyEvents";
import VendorGallery from "./pages/Dashboards/Vendor/VendorGallery";
import MyPackege from "./pages/Dashboards/Vendor/MyPackege";
import VendorSettings from "./pages/Dashboards/Vendor/VendorSettings";
import VendorBookings from "./pages/Dashboards/Vendor/VendorBookings";
import VendorManualReservations from "./pages/Dashboards/Vendor/VendorManualReservations";

// User Pages
import UserDashboard from "./pages/Dashboards/User/UserDashboard";
import MyBookings from "./pages/Dashboards/User/MyBookings";

// Notifications Page
import NotificationsPage from "./pages/NotificationsPage";

// Review Page
import ReviewPage from "./pages/ReviewPage";

// Email Verification Page
import EmailVerification from "./pages/EmailVerification";

// Emergency Reset Page
import EmergencyReset from "./pages/EmergencyReset";

// Test Email Verification Page
import TestEmailVerification from "./pages/TestEmailVerification";

// Category Pages
import Weddings from "./pages/Category/Weddings";
import CorporateEvents from "./pages/Category/CorporateEvents";
import ConcertsFestivals from "./pages/Category/ConcertsFestivals";
import BirthdayParties from "./pages/Category/BirthdayParties";
import FashionShows from "./pages/Category/FashionShows";
import Exhibitions from "./pages/Category/Exhibitions";
import VendorsByService from "./pages/VendorsByService";
import VendorDetail from "./pages/VendorDetail";

import ShowcaseSection from "./components/mainpage/ShowcaseSection";
import ComingSoon from "./ComingSoon.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouteDebugger>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <ScrollToTop />

          <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePageWrapper />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/why-us" element={<WhyUsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<Home />} />

        {/* Public Category Routes */}
        <Route path="/category/weddings" element={<Weddings />} />
        <Route path="/category/corporate-events" element={<CorporateEvents />} />
        <Route path="/category/concerts-festivals" element={<ConcertsFestivals />} />
        <Route path="/category/birthday-parties" element={<BirthdayParties />} />
        <Route path="/category/fashion-shows" element={<FashionShows />} />
        <Route path="/category/exhibitions" element={<Exhibitions />} />
        <Route path="/vendors/:serviceId" element={<VendorsByService />} />
        <Route path="/vendor/:vendorId" element={<VendorDetail />} />
        
        {/* Review Page - Public access via email link */}
        <Route path="/review/:bookingId" element={<ReviewPage />} />
        
        {/* Email Verification Page - Public access via email link */}
        <Route path="/verify-email" element={<EmailVerification />} />
        
        {/* Emergency Reset Page - Public access for troubleshooting */}
        <Route path="/emergency-reset" element={<EmergencyReset />} />
        
        {/* Test Email Verification - Temporary testing page */}
        <Route path="/test-email-verification" element={<TestEmailVerification />} />

        {/* Fallback route for any unmatched paths */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* 🔐 PROTECTED AREA (Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* 🔐 ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="admin">
                <Route path="dashboard" element={<Admindashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="addservices" element={<AddService />} />
                <Route path="mainservice" element={<MainService />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="reservations" element={<ManualReservations />} />
              </Route>
            </Route>

            {/* 🔐 VENDOR ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
              <Route path="vendor">
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="profile-setup" element={<VendorProfileSetup />} />
                <Route path="shifts" element={<VendorShiftPage />} />
                <Route path="myevents" element={<MyEvents />} />
                <Route path="gallery" element={<VendorGallery />} />
                <Route path="mypackege" element={<MyPackege />} />
                <Route path="setting" element={<VendorSettings />} />
                <Route path="bookings" element={<VendorBookings />} />
                <Route path="reservations" element={<VendorManualReservations />} />
              </Route>
            </Route>

            {/* 🔐 USER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="user">
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="bookings" element={<MyBookings />} />
              </Route>
            </Route>

            {/* 🔐 Notifications (logged-in users only) */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "vendor", "user"]} />}>
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

          </Route>
        </Route>
        </Routes>
        </RouteDebugger>
      </AuthProvider>
    </ErrorBoundary>
  );
}
