import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import ScrollToTop from "./components/ScrollToTop";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ChangePassword from "./components/ChangePassword";

// Public Pages
import Home from "./pages/HomePage";
import WhyUsPage from "./pages/WhyUsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import Admindashboard from "./pages/Dashboards/Admin/Admindashboard";
import AdminUsers from "./pages/Dashboards/Admin/AdminUsers";
import AddService from "./pages/Dashboards/Admin/AddServices";

// Vendor Pages
import VendorDashboard from "./pages/Dashboards/Vendor/VendorDashboard";
import VendorProfileSetup from "./pages/Dashboards/Vendor/VendorProfileSetup";
import VendorShiftPage from "./pages/Dashboards/Vendor/VendorShiftPage";
import MyEvents from "./pages/Dashboards/Vendor/MyEvents";
import VendorGallery from "./pages/Dashboards/Vendor/VendorGallery";
import MyPackege from "./pages/Dashboards/Vendor/MyPackege";
import VendorSettings from "./pages/Dashboards/Vendor/VendorSettings";

// User Pages
import UserDashboard from "./pages/Dashboards/User/UserDashboard";
import MyBookings from "./pages/Dashboards/User/MyBookings";

// Category Pages
import Weddings from "./pages/Category/Weddings";
import CorporateEvents from "./pages/Category/CorporateEvents";
import ConcertsFestivals from "./pages/Category/ConcertsFestivals";
import BirthdayParties from "./pages/Category/BirthdayParties";
import FashionShows from "./pages/Category/FashionShows";
import Exhibitions from "./pages/Category/Exhibitions";

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/why-us" element={<WhyUsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/" element={<Home />} />

         {/* Category Pages */}
        <Route path="/category/weddings" element={<Weddings />} />
        <Route path="/category/corporate-events" element={<CorporateEvents />} />
        <Route path="/category/concerts-festivals" element={<ConcertsFestivals />} />
        <Route path="/category/birthday-parties" element={<BirthdayParties />} />
        <Route path="/category/fashion-shows" element={<FashionShows />} />
        <Route path="/category/exhibitions" element={<Exhibitions />} />

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
            <Route path="bookings" element={<MyBookings />} />
          </Route>

                  
        </Route>
      </Routes>
    </AuthProvider>
  );
}
