
// src/config/menuConfig.js
import {
  FaTachometerAlt,     // Dashboard
  FaUsers,              // Users
  FaCalendarAlt,        // Services / Events
  FaListAlt,            // My Events
  FaShoppingCart,       // Gallery / Setting
  FaUser,               // Profile
  FaBullhorn,           // Campaigns
  FaSearch,             // Leads
  FaHome,               // User Dashboard
  FaTicketAlt,          // Bookings
  FaCog,                // Settings
  FaClipboardList,      // Booking Management
} from "react-icons/fa";

export const menuConfig = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { label: "Users", path: "/admin/users", icon: <FaUsers /> },
    { label: "Services", path: "/admin/addservices", icon: <FaCalendarAlt /> },
    { label: "Bookings", path: "/admin/bookings", icon: <FaClipboardList /> },
  ],

  vendor: [
    { label: "Dashboard", path: "/vendor/dashboard", icon: <FaTachometerAlt /> },
    // { label: "Create Profile", path: "/vendor/profile-setup", icon: <FaUser /> },
    { label: "Shifts", path: "/vendor/shifts", icon: <FaListAlt /> },
    { label: "Bookings", path: "/vendor/bookings", icon: <FaClipboardList /> },
    { label: "Events", path: "/vendor/myevents", icon: <FaListAlt /> },
    { label: "Gallery", path: "/vendor/gallery", icon: <FaShoppingCart /> },
    { label: "Package", path: "/vendor/mypackege", icon: <FaShoppingCart /> },
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
