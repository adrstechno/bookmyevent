import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiChevronDown, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import {
  SparklesIcon,
  BuildingOfficeIcon,
  MusicalNoteIcon,
  CakeIcon,
  CameraIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { VITE_API_BASE_URL } from "../../utils/api";
import NotificationBell from "../NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { checkAndCleanAuth } from "../../utils/tokenValidation";

/* ---------------- DATA ---------------- */

const categories = [
  { name: "Weddings", path: "/category/weddings", icon: SparklesIcon, color: "text-pink-500" },
  { name: "Corporate Events", path: "/category/corporate-events", icon: BuildingOfficeIcon, color: "text-blue-500" },
  { name: "Concerts & Festivals", path: "/category/concerts-festivals", icon: MusicalNoteIcon, color: "text-purple-500" },
  { name: "Birthday Parties", path: "/category/birthday-parties", icon: CakeIcon, color: "text-yellow-500" },
  { name: "Fashion Shows", path: "/category/fashion-shows", icon: CameraIcon, color: "text-fuchsia-500" },
  { name: "Exhibitions", path: "/category/exhibitions", icon: GlobeAltIcon, color: "text-green-500" },
];

/* ---------------- STYLES ---------------- */

const navBtnBase =
  "px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium";

const navBtnActive =
  "bg-[#3c6e71] text-white shadow";

const navBtnInactive =
  "text-gray-700 hover:bg-[#3c6e71]/10";

/* ---------------- COMPONENT ---------------- */

const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const categoriesRef = useRef(null);
  const mobileCategoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  
  // Use AuthContext instead of localStorage
  const { user, logout: authLogout } = useAuth();
  
  // Derive auth state from AuthContext
  const isLoggedIn = !!user;
  const userRole = user?.role || "";
  const userName = user?.first_name || user?.name || "User";

  const handleMobileCategoryNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
    setCategoriesOpen(false);
  };

  /* ---------- Scroll ---------- */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- Validate Auth on Mount ---------- */
  useEffect(() => {
    // Check if stored auth data is still valid
    const hasValidAuth = checkAndCleanAuth();
    if (!hasValidAuth && user) {
      // If auth is invalid but user is set, logout
      // console.log('Invalid auth detected, logging out');
      authLogout();
    }
  }, [user, authLogout]);

  /* ---------- Click Outside ---------- */
  useEffect(() => {
    const handleClick = (e) => {
      const clickedInsideDesktopCategories = categoriesRef.current?.contains(e.target);
      const clickedInsideMobileCategories = mobileCategoriesRef.current?.contains(e.target);

      if (!clickedInsideDesktopCategories && !clickedInsideMobileCategories) {
        setCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      await fetch(`${VITE_API_BASE_URL}/User/Logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // console.log("Logout API failed, but proceeding with client-side cleanup");
    }

    // Use AuthContext logout which will clean up everything
    authLogout();
    navigate("/");
  };

  const getDashboardPath = () => {
    switch (userRole?.toLowerCase()) {
      case "admin": return "/admin/dashboard";
      case "vendor": return "/vendor/dashboard";
      case "user": return "/user/dashboard";
      case "marketer": return "/marketer/dashboard";
      default: return "/";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* ---------------- MAIN BAR ---------------- */}
        <motion.div
          animate={{ 
            scale: isScrolled ? 0.98 : 1,
            y: isScrolled ? 4 : 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300
            backdrop-blur-xl border shadow-lg
            ${isScrolled 
              ? "bg-white/95 border-gray-200/50 shadow-xl" 
              : "bg-white/90 border-white/30 shadow-lg"
            }`}
        >
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/logo2.png" 
              className="h-12 w-auto transition-transform duration-300 hover:scale-105" 
              alt="GoEventify Logo"
            />
          </Link>

          {/* -------- DESKTOP NAV -------- */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" className={({ isActive }) =>
              `px-5 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                isActive 
                  ? "bg-[#3c6e71] text-white shadow-md" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#3c6e71]"
              }`
            }>
              Home
            </NavLink>

            <NavLink to="/about" className={({ isActive }) =>
              `px-5 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                isActive 
                  ? "bg-[#3c6e71] text-white shadow-md" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#3c6e71]"
              }`
            }>
              About
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) =>
              `px-5 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                isActive 
                  ? "bg-[#3c6e71] text-white shadow-md" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#3c6e71]"
              }`
            }>
              Contact
            </NavLink>

            {/* Categories */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="px-5 py-3 rounded-xl text-base font-bold text-gray-700 hover:bg-gray-100 hover:text-[#3c6e71] transition-all duration-200 flex items-center gap-2"
              >
                Categories 
                <FiChevronDown className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50"
                  >
                    <div className="grid grid-cols-1 gap-1">
                      {categories.map((c) => {
                        const Icon = c.icon;
                        return (
                          <NavLink
                            key={c.name}
                            to={c.path}
                            onClick={() => setCategoriesOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                isActive
                                  ? "bg-[#3c6e71]/10 text-[#3c6e71] font-semibold"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`
                            }
                          >
                            <div className={`p-2 rounded-lg ${c.color} bg-gray-50`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{c.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* -------- DESKTOP AUTH -------- */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn && <NotificationBell />}

            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#3c6e71] to-[#284b63] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{userName}</div>
                    <div className="text-xs opacity-80 uppercase">{userRole}</div>
                  </div>
                  <FiChevronDown className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50"
                    >
                      <Link 
                        to={getDashboardPath()} 
                        className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      >
                        <div className="w-8 h-8 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-[#3c6e71]" />
                        </div>
                        <span className="text-sm font-medium">Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                          <FiLogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-5 py-3 text-base font-bold text-gray-700 hover:text-[#3c6e71] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-3 bg-gradient-to-r from-[#3c6e71] to-[#284b63] text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* -------- MOBILE BUTTON -------- */}
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setCategoriesOpen(false);
            }}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </motion.div>
      </div>

      {/* ---------------- MOBILE MENU ---------------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mx-4 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {[
                { path: "/", label: "Home" },
                { path: "/about", label: "About" },
                { path: "/contact", label: "Contact" }
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#3c6e71] rounded-xl transition-all duration-200 font-medium"
                >
                  {label}
                </Link>
              ))}

              {/* Mobile Categories */}
              <div ref={mobileCategoriesRef} className="bg-gray-50 rounded-xl overflow-hidden">
                <button
                  className="flex justify-between items-center w-full px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                >
                  Categories 
                  <FiChevronDown className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-2 space-y-1">
                        {categories.map((c) => {
                          const Icon = c.icon;
                          return (
                            <button
                              type="button"
                              key={c.name}
                              onClick={() => handleMobileCategoryNavigate(c.path)}
                              className="flex w-full items-center gap-3 p-3 rounded-xl hover:bg-white transition-all duration-200 text-left"
                            >
                              <div className={`p-2 rounded-lg ${c.color} bg-white`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Auth */}
              <div className="pt-2 space-y-2 border-t border-gray-100">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-[#3c6e71]" />
                      </div>
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <FiLogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-center border-2 border-[#3c6e71] text-[#3c6e71] rounded-xl hover:bg-[#3c6e71] hover:text-white transition-all duration-200 font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-center bg-gradient-to-r from-[#3c6e71] to-[#284b63] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default HomeNavbar;
