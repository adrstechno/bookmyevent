
// src/config/menuConfig.js
import {
  FaTachometerAlt,     // Dashboard
  FaUsers,              // Users
  FaConciergeBell,     // Services (sub-services)
  FaThLarge,           // Main Services (categories)
  FaCalendarCheck,     // Bookings
  FaClipboardList,     // My Events
  FaShoppingCart,      // Gallery / Setting
  FaUser,              // Profile
  FaBullhorn,          // Campaigns
  FaSearch,            // Leads
  FaHome,              // User Dashboard
  FaTicketAlt,         // User Bookings
  FaCog,               // Settings
  FaBoxOpen,          // Package
  FaHandHoldingUsd,    // Manual Reservations (admin)
  FaCalendarPlus,      // Manual Reservations (vendor)
} from "react-icons/fa";

export const menuConfig = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { label: "Users", path: "/admin/users", icon: <FaUsers /> },
    { label: "Services", path: "/admin/addservices", icon: <FaConciergeBell /> },
    { label: "Main Services", path: "/admin/mainservice", icon: <FaThLarge /> },
    { label: "Bookings", path: "/admin/bookings", icon: <FaCalendarCheck /> },
    { label: "Manual Reservations", path: "/admin/reservations", icon: <FaHandHoldingUsd /> },
  ],

  vendor: [
    { label: "Dashboard", path: "/vendor/dashboard", icon: <FaTachometerAlt /> },
    // { label: "Create Profile", path: "/vendor/profile-setup", icon: <FaUser /> },
    { label: "Shifts", path: "/vendor/shifts", icon: <FaClipboardList /> },
    { label: "Bookings", path: "/vendor/bookings", icon: <FaCalendarCheck /> },
    { label: "Manual Reservations", path: "/vendor/reservations", icon: <FaCalendarPlus /> },
    { label: "Events", path: "/vendor/myevents", icon: <FaTicketAlt /> },
    { label: "Gallery", path: "/vendor/gallery", icon: <FaShoppingCart /> },
    { label: "Package", path: "/vendor/mypackege", icon: <FaBoxOpen /> },
    { label: "Settings", path: "/vendor/setting", icon: <FaCog /> },
  ],

  marketer: [
    { label: "Campaigns", path: "/marketer/campaigns", icon: <FaBullhorn /> },
    { label: "Leads", path: "/marketer/leads", icon: <FaSearch /> },
  ],

  user: [
    { label: "Dashboard", path: "/user/dashboard", icon: <FaHome /> },
    { label: "My Bookings", path: "/user/bookings", icon: <FaTicketAlt /> },
  ],
};
