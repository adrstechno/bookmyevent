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
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* ---------------- MAIN BAR ---------------- */}
        <motion.div
          animate={{ scale: isScrolled ? 0.97 : 1 }}
          className={`flex items-center justify-between px-6 py-4 rounded-3xl
            backdrop-blur-xl border border-white/20 shadow-lg
            ${isScrolled ? "bg-white/50" : "bg-white/30"}`}
        >
          {/* Logo */}
          <Link to="/">
            <img src="/logo2.png" className="w-25 h-auto" />
          </Link>

          {/* -------- DESKTOP NAV -------- */}
          <div className="hidden lg:flex items-center gap-2">
            <NavLink to="/" className={({ isActive }) =>
              `${navBtnBase} ${isActive ? navBtnActive : navBtnInactive}`
            }>
              Home
            </NavLink>

            <NavLink to="/about" className={({ isActive }) =>
              `${navBtnBase} ${isActive ? navBtnActive : navBtnInactive}`
            }>
              About
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) =>
              `${navBtnBase} ${isActive ? navBtnActive : navBtnInactive}`
            }>
              Contact
            </NavLink>

            {/* Categories */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`${navBtnBase} ${navBtnInactive} flex items-center gap-1`}
              >
                Categories <FiChevronDown />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl p-3"
                  >
                    {categories.map((c) => {
                      const Icon = c.icon;
                      return (
                        <NavLink
                          key={c.name}
                          to={c.path}
                          onClick={() => setCategoriesOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg ${
                              isActive
                                ? "bg-[#3c6e71]/10 text-[#3c6e71] font-semibold"
                                : "hover:bg-gray-100"
                            }`
                          }
                        >
                          <Icon className={`w-5 h-5 ${c.color}`} />
                          {c.name}
                        </NavLink>
                      );
                    })}
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
                  className="flex items-center gap-2 px-5 py-2 bg-primary rounded-full shadow"
                >
                  <FiUser /> {userName}
                  <span className="border border-black px-2 py-[2px] text-xs rounded uppercase">
                    {userRole}
                  </span>
                  <FiChevronDown />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl p-3">
                    <Link to={getDashboardPath()} className="block p-2 hover:bg-gray-100 rounded-lg">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className={`${navBtnBase} ${navBtnInactive}`}>
                  Login
                </Link>
                <Link to="/register" className={`${navBtnBase} bg-primary shadow`}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* -------- MOBILE BUTTON -------- */}
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setCategoriesOpen(false);
            }}
            className="lg:hidden text-3xl p-2"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </motion.div>
      </div>

      {/* ---------------- MOBILE MENU ---------------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mx-4 mt-2 bg-white rounded-2xl shadow-xl"
            style={{ pointerEvents: "auto" }}
          >
            <div className="p-4 space-y-2">
              {["/", "/about", "/contact"].map((path) => {
                const label = path === "/" ? "Home" : path.replace("/", "");
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                  </Link>
                );
              })}

              {/* Mobile Categories */}
              <div ref={mobileCategoriesRef} className="bg-gray-50 rounded-xl p-3">
                <div
                  className="flex justify-between font-semibold cursor-pointer"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                >
                  Categories <FiChevronDown />
                </div>

                {categoriesOpen && (
                  <div className="mt-2 space-y-2">
                    {categories.map((c) => {
                      const Icon = c.icon;
                      return (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => handleMobileCategoryNavigate(c.path)}
                          className="flex w-full items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <Icon className={`w-5 h-5 ${c.color}`} />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mobile Auth */}
              <div className="pt-3 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 border border-[#3c6e71] text-[#3c6e71] rounded-xl hover:bg-[#3c6e71] hover:text-white transition-colors"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 bg-[#3c6e71] text-white rounded-xl shadow hover:bg-[#2f5b60] transition-colors"
                    >
                      Sign Up
                    </NavLink>
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
