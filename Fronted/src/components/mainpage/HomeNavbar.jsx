// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
// import {
//   SparklesIcon,
//   BuildingOfficeIcon,
//   MusicalNoteIcon,
//   CakeIcon,
//   CameraIcon,
//   GlobeAltIcon,
// } from "@heroicons/react/24/outline";
// import { VITE_API_BASE_URL } from "../../utils/api";

// const categories = [
//   { name: "Weddings", path: "/category/weddings", icon: SparklesIcon, color: "text-pink-500" },
//   { name: "Corporate Events", path: "/category/corporate-events", icon: BuildingOfficeIcon, color: "text-blue-500" },
//   { name: "Concerts & Festivals", path: "/category/concerts-festivals", icon: MusicalNoteIcon, color: "text-purple-500" },
//   { name: "Birthday Parties", path: "/category/birthday-parties", icon: CakeIcon, color: "text-yellow-500" },
//   { name: "Fashion Shows", path: "/category/fashion-shows", icon: CameraIcon, color: "text-fuchsia-500" },
//   { name: "Exhibitions", path: "/category/exhibitions", icon: GlobeAltIcon, color: "text-green-500" },
// ];

// const HomeNavbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [categoriesOpen, setCategoriesOpen] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userRole, setUserRole] = useState("");
//   const [userName, setUserName] = useState("");

//   const categoriesRef = useRef(null);
//   const userMenuRef = useRef(null);
//   const navigate = useNavigate();

//   // -----------------------------------------
//   // CHECK LOGIN STATUS FROM LOCAL STORAGE
//   // -----------------------------------------
//   useEffect(() => {
//     const checkAuth = () => {
//       const role = localStorage.getItem("role");
//       const name = localStorage.getItem("name") || localStorage.getItem("username");

//       if (role) {
//         setIsLoggedIn(true);
//         setUserRole(role);
//         setUserName(name || "User");
//       } else {
//         setIsLoggedIn(false);
//         setUserRole("");
//         setUserName("");
//       }
//     };

//     checkAuth();
//     window.addEventListener("storage", checkAuth);
//     return () => window.removeEventListener("storage", checkAuth);
//   }, []);

//   // -----------------------------------------
//   // CLICK OUTSIDE HANDLERS
//   // -----------------------------------------
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
//         setCategoriesOpen(false);
//       }
//       if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
//         setUserMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // -----------------------------------------
//   // LOGOUT HANDLER
//   // -----------------------------------------
//   const handleLogout = async () => {
//     const confirmLogout = window.confirm("Are you sure you want to logout?");
//     if (!confirmLogout) return;

//     try {
//       await fetch(`${VITE_API_BASE_URL}/User/Logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//     } catch (err) {
//       console.log("Error hitting logout API", err);
//     }

//     localStorage.clear();
//     setIsLoggedIn(false);
//     setUserRole("");
//     setUserName("");

//     navigate("/");
//   };

//   const getDashboardPath = () => {
//     switch (userRole?.toLowerCase()) {
//       case "admin": return "/admin/dashboard";
//       case "vendor": return "/vendor/dashboard";
//       case "user": return "/user/dashboard";
//       case "marketer": return "/marketer/dashboard";
//       default: return "/";
//     }
//   };

//   return (
//     <nav className="bg-transparent backdrop-blur-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

//         {/* Logo */}
//         <Link to="/" className="flex items-center space-x-2">
//           <img src="/logo2.png" alt="Logo" className="h-15 w-auto" />
//         </Link>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">

//           <Link to="/" className="relative group">
//             Home
//             <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
//           </Link>

//           {/* Categories */}
//           <div className="relative" ref={categoriesRef}>
//             <button
//               onClick={() => setCategoriesOpen(!categoriesOpen)}
//               className="flex items-center gap-1 relative group"
//             >
//               Categories
//               <FiChevronDown className={`transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
//               <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
//             </button>

//             {categoriesOpen && (
//               <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border animate-fadeIn p-2">
//                 {categories.map((category) => {
//                   const Icon = category.icon;
//                   return (
//                     <Link
//                       key={category.path}
//                       to={category.path}
//                       onClick={() => setCategoriesOpen(false)}
//                       className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group"
//                     >
//                       <Icon className={`w-6 h-6 ${category.color} group-hover:scale-110`} />
//                       <span className="group-hover:text-[#3c6e71]">{category.name}</span>
//                     </Link>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <Link to="/about" className="relative group">
//             About
//             <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
//           </Link>

//           <Link to="/contact" className="relative group">
//             Contact
//             <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
//           </Link>
//         </div>

//         {/* RIGHT SIDE AUTH */}
//         <div className="hidden md:flex items-center space-x-4">

//           {isLoggedIn ? (
//             <div className="relative" ref={userMenuRef}>

//               <button
//                 onClick={() => setUserMenuOpen(!userMenuOpen)}
//                 className="flex items-center gap-2 px-4 py-2 bg-[#3c6e71] text-white rounded-lg hover:bg-[#2f5b60] transition-all"
//               >
//                 <FiUser />
//                 <span>{userName}</span>

//                 <span className="ml-2 bg-white text-[#3c6e71] px-2 py-[2px] rounded text-xs font-semibold uppercase">
//                   {userRole}
//                 </span>

//                 <FiChevronDown className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
//               </button>

//               {userMenuOpen && (
//                 <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border p-3 space-y-2">

//                   <Link
//                     to={getDashboardPath()}
//                     className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
//                   >
//                     <FiUser className="text-[#3c6e71]" />
//                     Dashboard
//                   </Link>

//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-all w-full"
//                   >
//                     <FiLogOut />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               <Link
//                 to="/register"
//                 className="px-4 py-2 bg-[#3c6e71] text-white rounded-lg hover:bg-[#2f5b60] transition-all"
//               >
//                 Sign Up
//               </Link>

//               <Link
//                 to="/login"
//                 className="px-4 py-2 border border-[#3c6e71] text-[#3c6e71] rounded-lg hover:bg-[#3c6e71] hover:text-white transition-all"
//               >
//                 Login
//               </Link>
//             </>
//           )}
//         </div>

//         {/* MOBILE MENU BUTTON */}
//         <div
//           className="md:hidden flex flex-col space-y-1 cursor-pointer"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           <span className={`w-6 h-[2px] bg-[#3c6e71] transition-all ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`}></span>
//           <span className={`w-6 h-[2px] bg-[#3c6e71] transition-all ${menuOpen ? "opacity-0" : ""}`}></span>
//           <span className={`w-6 h-[2px] bg-[#3c6e71] transition-all ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}></span>
//         </div>
//       </div>

//       {/* ---------------------- MOBILE MENU ---------------------- */}
//       {menuOpen && (
//         <div className="md:hidden backdrop-blur-xl bg-white/80 shadow-xl border-t animate-fadeIn">

//           <div className="px-6 py-5 space-y-6">

//             {/* MAIN LINKS */}
//             <div className="flex flex-col space-y-4 text-gray-800 font-medium">

//               <Link
//                 to="/"
//                 onClick={() => setMenuOpen(false)}
//                 className="flex items-center justify-between py-3 px-3 rounded-xl bg-white shadow hover:shadow-md transition-all"
//               >
//                 <span>Home</span>
//               </Link>

//               {/* MOBILE CATEGORIES */}
//           {/* MOBILE CATEGORIES */}
// <div className="bg-white shadow rounded-xl p-4">

//   <div
//     onClick={() => setCategoriesOpen(!categoriesOpen)}
//     className="flex items-center justify-between cursor-pointer"
//   >
//     <span className="font-semibold">Categories</span>
//     <FiChevronDown
//       className={`transition-transform duration-300 ${categoriesOpen ? "rotate-180" : ""}`}
//     />
//   </div>

//   {categoriesOpen && (
//     <div className="mt-3 space-y-3 pl-2 animate-fadeIn">

//       {categories.map((category) => {
//         const Icon = category.icon;

//         return (
//           <Link
//             key={category.path}
//             to={category.path}
//             className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all"
//             onClick={() => {
//               setMenuOpen(false);          // close mobile menu
//               setCategoriesOpen(false);     // close dropdown
//             }}
//           >
//             <Icon className={`w-6 h-6 ${category.color}`} />
//             <span>{category.name}</span>
//           </Link>
//         );
//       })}

//     </div>
//   )}
// </div>


//               <Link
//                 to="/about"
//                 onClick={() => setMenuOpen(false)}
//                 className="flex items-center justify-between py-3 px-3 rounded-xl bg-white shadow hover:shadow-md transition-all"
//               >
//                 <span>About</span>
//               </Link>

//               <Link
//                 to="/contact"
//                 onClick={() => setMenuOpen(false)}
//                 className="flex items-center justify-between py-3 px-3 rounded-xl bg-white shadow hover:shadow-md transition-all"
//               >
//                 <span>Contact</span>
//               </Link>
//             </div>

//             {/* AUTH SECTION */}
//             <div className="pt-2 border-t border-gray-200">

//               {isLoggedIn ? (
//                 <div className="bg-white shadow rounded-xl p-4">

//                   <button
//                     onClick={() => setUserMenuOpen(!userMenuOpen)}
//                     className="w-full flex items-center justify-between"
//                   >
//                     <span className="font-semibold">{userName}</span>
//                     <FiChevronDown
//                       className={`transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`}
//                     />
//                   </button>

//                   {userMenuOpen && (
//                     <div className="mt-3 space-y-4 animate-fadeIn pl-2">

//                       <Link
//                         to={getDashboardPath()}
//                         onClick={() => {
//                           setUserMenuOpen(false);
//                           setMenuOpen(false);
//                         }}
//                         className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all"
//                       >
//                         <FiUser className="text-[#3c6e71]" />
//                         Dashboard
//                       </Link>

//                       <button
//                         onClick={() => {
//                           handleLogout();
//                           setMenuOpen(false);
//                         }}
//                         className="flex items-center gap-3 p-2 text-red-600 rounded-lg hover:bg-red-50 transition-all"
//                       >
//                         <FiLogOut />
//                         Logout
//                       </button>

//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex flex-col space-y-4">

//                   <Link
//                     to="/register"
//                     onClick={() => setMenuOpen(false)}
//                     className="w-full text-center py-3 bg-[#3c6e71] text-white rounded-xl shadow hover:bg-[#2f5b60] transition-all"
//                   >
//                     Sign Up
//                   </Link>

//                   <Link
//                     to="/login"
//                     onClick={() => setMenuOpen(false)}
//                     className="w-full text-center py-3 border border-[#3c6e71] text-[#3c6e71] rounded-xl hover:bg-[#3c6e71] hover:text-white transition-all"
//                   >
//                     Login
//                   </Link>

//                 </div>
//               )}

//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default HomeNavbar;


import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const categories = [
  { name: "Weddings", path: "/category/weddings", icon: SparklesIcon, color: "text-pink-500" },
  { name: "Corporate Events", path: "/category/corporate-events", icon: BuildingOfficeIcon, color: "text-blue-500" },
  { name: "Concerts & Festivals", path: "/category/concerts-festivals", icon: MusicalNoteIcon, color: "text-purple-500" },
  { name: "Birthday Parties", path: "/category/birthday-parties", icon: CakeIcon, color: "text-yellow-500" },
  { name: "Fashion Shows", path: "/category/fashion-shows", icon: CameraIcon, color: "text-fuchsia-500" },
  { name: "Exhibitions", path: "/category/exhibitions", icon: GlobeAltIcon, color: "text-green-500" },
];

const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check Auth
  useEffect(() => {
    const checkAuth = () => {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("name") || localStorage.getItem("username");

      if (role) {
        setIsLoggedIn(true);
        setUserRole(role);
        setUserName(name || "User");
      } else {
        setIsLoggedIn(false);
        setUserRole("");
        setUserName("");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) setCategoriesOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      await fetch(`${VITE_API_BASE_URL}/User/Logout`, { method: "POST", credentials: "include" });
    } catch { 
      console.log("Logout failed, but proceeding with client-side cleanup");
    }

    localStorage.clear();
    setIsLoggedIn(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

        {/* MAIN NAV */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, scale: isScrolled ? 0.97 : 1 }}
          transition={{ duration: 0.35 }}
          className={`
            flex items-center justify-between 
            px-8 py-4 rounded-3xl
            transition-all duration-300
            backdrop-blur-xl border border-white/20
            shadow-[0_8px_32px_rgba(0,0,0,0.15)]
            ${isScrolled ? "bg-white/40" : "bg-white/30"}
          `}
        >

          {/* Logo */}
        <Link to="/" className="flex items-center">
  <motion.img
    src="/logo2.png"
    className="w-20 h-auto object-contain drop-shadow-lg" 
    whileHover={{ scale: 1.1 }}
  />
</Link>


          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8 font-medium text-gray-800">

            <Link to="/" className="hover:text-primary transition-all">Home</Link>

            {/* Categories */}
            <div className="relative" ref={categoriesRef}>
              <button
                className="flex items-center gap-1 hover:text-primary transition"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                Categories <FiChevronDown className={`${categoriesOpen ? "rotate-180" : ""} transition`} />
              </button>

              {/* DropDown */}
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white shadow-xl rounded-xl p-3 border"
                  >
                    {categories.map((c) => {
                      const Icon = c.icon;
                      return (
                        <Link
                          key={c.name}
                          to={c.path}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Icon className={`w-6 h-6 ${c.color}`} />
                          <span>{c.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about" className="hover:text-primary transition-all">About</Link>
            <Link to="/contact" className="hover:text-primary transition-all">Contact</Link>
          </div>

          {/* Auth Desktop */}
          <div className="hidden lg:flex items-center space-x-4">

            {/* Notification Bell - Only show when logged in */}
            {isLoggedIn && <NotificationBell />}

            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black rounded-full shadow hover:shadow-lg transition"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <FiUser /> {userName}
                 <span className="bg-transparent border border-black text-black px-2 py-[2px] text-xs rounded uppercase">
                   {userRole}
                 </span>
                  <FiChevronDown className={`${userMenuOpen ? "rotate-180" : ""} transition`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 bg-white shadow-xl w-56 rounded-xl p-3 border space-y-2">
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <FiUser /> Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-2 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/Login"
                  className="px-5 py-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/Register"
                  className="px-6 py-2.5 rounded-full bg-primary text-gray-700 shadow hover:shadow-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-3xl text-gray-800 p-2 rounded-full hover:bg-gray-200 transition"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </motion.button>
        </motion.div>
      </div>

      {/* ---------------- MOBILE MENU ---------------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mx-4 mt-2 rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">

              {/* Main links */}
              <Link onClick={() => setMenuOpen(false)} to="/" className="block py-3 px-4 hover:bg-gray-100 rounded-xl">
                Home
              </Link>

              {/* Mobile Categories */}
              <div className="bg-white shadow rounded-xl p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                >
                  <span className="font-semibold">Categories</span>
                  <FiChevronDown className={`${categoriesOpen ? "rotate-180" : ""} transition`} />
                </div>

                {categoriesOpen && (
                  <div className="mt-3 space-y-3 pl-2">
                    {categories.map((c) => {
                      const Icon = c.icon;
                      return (
                        <Link
                          key={c.name}
                          to={c.path}
                          onClick={() => { setMenuOpen(false); setCategoriesOpen(false); }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Icon className={`w-6 h-6 ${c.color}`} />
                          {c.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link to="/about" onClick={() => setMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-100">
                About
              </Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-100">
                Contact
              </Link>

              {/* Auth */}
              <div className="pt-3 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 px-4 rounded-xl hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="block w-full text-left py-3 px-4 text-red-600 rounded-xl hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
               <>
  <Link
    to="/login"
    onClick={() => setMenuOpen(false)}
    className="
      block py-3 px-4 
      border border-[#3c6e71] 
      text-[#3c6e71]
      rounded-xl 
      hover:bg-[#3c6e71] 
      hover:text-white 
      transition-all
    "
  >
    Login
  </Link>

  <Link
    to="/register"
    onClick={() => setMenuOpen(false)}
    className="
      block py-3 px-4 
      bg-[#3c6e71] 
      text-white 
      rounded-xl 
      shadow 
      hover:bg-[#2f5b60]
      transition-all
    "
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
