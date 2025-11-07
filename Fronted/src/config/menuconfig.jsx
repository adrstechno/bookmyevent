// src/config/menuConfig.js
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import CampaignIcon from "@mui/icons-material/Campaign";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

export const menuConfig = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Users", path: "/admin/users", icon: <PeopleIcon /> },
    { label: "Services", path: "/admin/addservices", icon: <EventIcon /> },
  ],

  vendor: [
    { label: "Create Profile", path: "/vendor/profile-setup", icon: <PersonIcon /> },   
    { label: "Dashboard", path: "/vendor/dashboard", icon: <PersonIcon /> },   
    { label: "My Events", path: "/vendor/myevents", icon: <ListAltIcon /> },
    { label: "Orders", path: "/vendor/orders", icon: <ShoppingCartIcon /> },
    { label: "Setting", path: "/vendor/setting", icon: <ShoppingCartIcon /> },
    

  ],

  marketer: [
    { label: "Campaigns", path: "/marketer/campaigns", icon: <CampaignIcon /> },
    { label: "Leads", path: "/marketer/leads", icon: <SearchIcon /> },
  ],

  user: [
    { label: "Home", path: "/", icon: <HomeIcon /> },
    { label: "My Bookings", path: "/bookings", icon: <ConfirmationNumberIcon /> },
    { label: "Profile", path: "/profile", icon: <PersonIcon /> },
  ],
};
