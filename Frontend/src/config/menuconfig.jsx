// // src/config/menuConfig.js
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import PeopleIcon from "@mui/icons-material/People";
// import EventIcon from "@mui/icons-material/Event";
// import ListAltIcon from "@mui/icons-material/ListAlt";
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// import PersonIcon from "@mui/icons-material/Person";
// import CampaignIcon from "@mui/icons-material/Campaign";
// import SearchIcon from "@mui/icons-material/Search";
// import HomeIcon from "@mui/icons-material/Home";
// import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

// export const menuConfig = {
//   admin: [
//     { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
//     { label: "Users", path: "/admin/users", icon: <PeopleIcon /> },
//     { label: "Services", path: "/admin/addservices", icon: <EventIcon /> },
//   ],

//   vendor: [
//     { label: "Create Profile", path: "/vendor/profile-setup", icon: <PersonIcon /> },   
//     { label: "Dashboard", path: "/vendor/dashboard", icon: <PersonIcon /> },   
//     { label: "My Events", path: "/vendor/myevents", icon: <ListAltIcon /> },
//     { label: "Gallery", path: "/vendor/gallery", icon: <ShoppingCartIcon /> },
//     { label: "Setting", path: "/vendor/setting", icon: <ShoppingCartIcon /> },
    

//   ],

//   marketer: [
//     { label: "Campaigns", path: "/marketer/campaigns", icon: <CampaignIcon /> },
//     { label: "Leads", path: "/marketer/leads", icon: <SearchIcon /> },
//   ],

//   user: [
//     { label: "Dashboard", path: "/user/dashboard", icon: <HomeIcon /> },
//     { label: "My Bookings", path: "/bookings", icon: <ConfirmationNumberIcon /> },
//     { label: "Profile", path: "/profile", icon: <PersonIcon /> },
//   ],
// };


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
    { label: "Create Profile", path: "/vendor/profile-setup", icon: <FaUser /> },
    { label: "Shifts", path: "/vendor/shifts", icon: <FaListAlt /> },
    { label: "Dashboard", path: "/vendor/dashboard", icon: <FaTachometerAlt /> },
    { label: "Bookings", path: "/vendor/bookings", icon: <FaClipboardList /> },
    { label: "My Events", path: "/vendor/myevents", icon: <FaListAlt /> },
    { label: "Gallery", path: "/vendor/gallery", icon: <FaShoppingCart /> },
    { label: "My Package", path: "/vendor/mypackege", icon: <FaShoppingCart /> },
    { label: "Setting", path: "/vendor/setting", icon: <FaCog /> },
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
