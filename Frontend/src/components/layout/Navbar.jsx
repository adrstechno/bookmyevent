import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { UserCircleIcon, Bars3Icon,ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { VITE_API_BASE_URL } from "../../utils/api";
import NotificationBell from "../NotificationBell";
import toast from "react-hot-toast";

const navHeight = 64;

const Navbar = ({ onMenuClick, isMobile }) => {
  const auth = useContext(AuthContext) || {};
  const { user, logout } = auth;
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/Logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log("Logout API responded with an error");
      }
    } catch (error) {
      toast.error("Logout API call failed:", error);
    }

    logout();
    navigate("/login");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-50"
      style={{ height: navHeight, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Left Side */}
      <div className="flex items-center gap-2 md:gap-3">
        {isMobile && (
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={onMenuClick}
            aria-label="open menu"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
        )}

        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer"
          onClick={() => {
            const role = user?.role;
            let dest = "/";

            if (role === "admin") dest = "/admin/dashboard";
            else if (role === "vendor") dest = "/vendor/dashboard";
            else if (role === "user") dest = "/user/dashboard";
            else if (role === "marketer") dest = "/marketer/dashboard";

            navigate(dest);
          }}
        >
          
          <img
            src={isMobile ? "/logo2.png" : "/logo2.png"}
            alt="GoEventify"
            className="h-10 md:h-12 w-auto"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Info - Hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <UserCircleIcon className="h-5 w-5 md:h-6 md:w-6 text-[#3c6e71]" />
          <span className="text-gray-700 font-medium text-sm md:text-base truncate max-w-[100px] md:max-w-[150px]">
            {user?.name || user?.role || "User"}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-3 md:px-4 py-2 rounded-md bg-[#3c6e71] text-white font-medium text-sm md:text-base hover:bg-[#284b63] transition-colors"
        >
          <span className="hidden sm:inline">Logout</span>
          <span
  className="sm:hidden cursor-pointer"
  onClick={handleLogout}
>
  <ArrowRightOnRectangleIcon className="h-6 w-6 text-white-600" />
</span>

        </button>
      </div>
    </header>
  );
};

export default Navbar;
