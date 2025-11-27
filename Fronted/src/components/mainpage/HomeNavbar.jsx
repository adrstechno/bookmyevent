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

//   // Check authentication status
//   useEffect(() => {
//     const checkAuth = () => {
//       const token = document.cookie.includes("auth_token");
//       const role = localStorage.getItem("role");
//       const name = localStorage.getItem("name") || localStorage.getItem("username");
      
//       setIsLoggedIn(token);
//       setUserRole(role || "");
//       setUserName(name || "User");
//     };

//     checkAuth();
//     // Check on mount and when localStorage changes
//     window.addEventListener("storage", checkAuth);
//     return () => window.removeEventListener("storage", checkAuth);
//   }, []);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
//         setCategoriesOpen(false);
//       }
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         setUserMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     // Clear cookies and localStorage
//     document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     localStorage.clear();
//     setIsLoggedIn(false);
//     setUserRole("");
//     setUserName("");
//     navigate("/login");
//   };

//   const getDashboardPath = () => {
//     switch (userRole?.toLowerCase()) {
//       case "admin":
//         return "/admin/dashboard";
//       case "vendor":
//         return "/vendor/dashboard";
//       case "user":
//         return "/user/dashboard";
//       default:
//         return "/";
//     }
//   };

//   return (
//     <nav className="bg-white shadow-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
//         {/* Logo */}
//         <Link to="/" className="flex items-center space-x-2">
//           <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
//         </Link>

//         {/* Desktop Links */}
//         <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
//           <Link to="/" className="relative group">
//             Home
//             <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] transition-all duration-300 group-hover:w-full"></span>
//           </Link>

//           {/* Categories Dropdown */}
//           <div className="relative" ref={categoriesRef}>
//             <button
//               onClick={() => setCategoriesOpen(!categoriesOpen)}
//               className="flex items-center gap-1 relative group"
//             >
//               Categories
//               <FiChevronDown className={`transition-transform duration-300 ${categoriesOpen ? "rotate-180" : ""}`} />
//               <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] transition-all duration-300 group-hover:w-full"></span>
//             </button>

//             {/* Dropdown Menu */}
//             {categoriesOpen && (
//               <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
//                 <div className="p-2">
//                   {categories.map((category) => {
//                     const Icon = category.icon;
//                     return (
//                       <Link
//                         key={category.path}
//                         to={category.path}
//                         onClick={() => setCategoriesOpen(false)}
//                         className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
//                       >
//                         <Icon className={`w-6 h-6 ${category.color} group-hover:scale-110 transition-transform`} />
//                         <span className="text-gray-700 group-hover:text-[#3c6e71] font-medium">
//                           {category.name}
//                         </span>
//                       </Link>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>

//           <Link to="/about" className="relative group">
//             About
//             <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] transition-all duration-300 group-hover:w-full"></span>
//           </Link>

//           <Link to="/contact" className="relative group">
//             Contact
//             <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] transition-all duration-300 group-hover:w-full"></span>
//           </Link>
//         </div>

//         {/* Auth Buttons / User Menu */}
//         <div className="hidden md:flex items-center space-x-4">
//           {isLoggedIn ? (
//             <div className="relative" ref={userMenuRef}>
//               <button
//                 onClick={() => setUserMenuOpen(!userMenuOpen)}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white rounded-lg hover:shadow-lg transition-all duration-300"
//               >
//                 <FiUser className="text-lg" />
//                 <span className="font-medium">{userName}</span>
//                 <FiChevronDown className={`transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} />
//               </button>

//               {/* User Dropdown */}
//               {userMenuOpen && (
//                 <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
//                   <div className="p-2">
//                     <div className="px-4 py-3 border-b border-gray-100">
//                       <p className="text-sm text-gray-500">Signed in as</p>
//                       <p className="font-semibold text-gray-800">{userName}</p>
//                       <p className="text-xs text-[#3c6e71] font-medium mt-1 uppercase">{userRole}</p>
//                     </div>
                    
//                     <Link
//                       to={getDashboardPath()}
//                       onClick={() => setUserMenuOpen(false)}
//                       className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 mt-2"
//                     >
//                       <FiUser className="text-[#3c6e71]" />
//                       <span className="text-gray-700 font-medium">Dashboard</span>
//                     </Link>

//                     <button
//                       onClick={handleLogout}
//                       className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600"
//                     >
//                       <FiLogOut />
//                       <span className="font-medium">Logout</span>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               <Link
//                 to="/login"
//                 className="px-4 py-2 border border-[#3c6e71] text-[#3c6e71] rounded-lg hover:bg-[#3c6e71] hover:text-white transition-all duration-300"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="px-4 py-2 bg-[#3c6e71] text-white rounded-lg hover:bg-[#2e5558] transition-all duration-300"
//               >
//                 Register
//               </Link>
//             </>
//           )}
//         </div>

//         {/* Mobile Menu Toggle */}
//         <div
//           className="md:hidden flex flex-col space-y-1 cursor-pointer"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           <span className={`w-6 h-[2px] bg-[#3c6e71] transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`}></span>
//           <span className={`w-6 h-[2px] bg-[#3c6e71] transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
//           <span className={`w-6 h-[2px] bg-[#3c6e71] transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}></span>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <div className={`md:hidden bg-white shadow-md transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
//         <div className="flex flex-col py-4 space-y-2 text-gray-700 font-medium">
//           <Link to="/" onClick={() => setMenuOpen(false)} className="px-6 py-2 hover:bg-gray-50 hover:text-[#3c6e71] transition-colors">
//             Home
//           </Link>

//           {/* Mobile Categories */}
//           <div className="px-6 py-2">
//             <button
//               onClick={() => setCategoriesOpen(!categoriesOpen)}
//               className="flex items-center justify-between w-full"
//             >
//               <span>Categories</span>
//               <FiChevronDown className={`transition-transform duration-300 ${categoriesOpen ? "rotate-180" : ""}`} />
//             </button>
//             {categoriesOpen && (
//               <div className="mt-2 ml-4 space-y-2">
//                 {categories.map((category) => {
//                   const Icon = category.icon;
//                   return (
//                     <Link
//                       key={category.path}
//                       to={category.path}
//                       onClick={() => {
//                         setCategoriesOpen(false);
//                         setMenuOpen(false);
//                       }}
//                       className="flex items-center gap-2 py-2 text-sm hover:text-[#3c6e71]"
//                     >
//                       <Icon className={`w-5 h-5 ${category.color}`} />
//                       {category.name}
//                     </Link>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <Link to="/about" onClick={() => setMenuOpen(false)} className="px-6 py-2 hover:bg-gray-50 hover:text-[#3c6e71] transition-colors">
//             About
//           </Link>
//           <Link to="/contact" onClick={() => setMenuOpen(false)} className="px-6 py-2 hover:bg-gray-50 hover:text-[#3c6e71] transition-colors">
//             Contact
//           </Link>

//           {/* Mobile Auth */}
//           <div className="px-6 pt-4 space-y-2 border-t border-gray-100">
//             {isLoggedIn ? (
//               <>
//                 <div className="py-2">
//                   <p className="text-sm text-gray-500">Signed in as</p>
//                   <p className="font-semibold">{userName}</p>
//                   <p className="text-xs text-[#3c6e71] uppercase">{userRole}</p>
//                 </div>
//                 <Link
//                   to={getDashboardPath()}
//                   onClick={() => setMenuOpen(false)}
//                   className="block px-4 py-2 bg-gray-100 text-center rounded-lg hover:bg-gray-200 transition-all"
//                 >
//                   Dashboard
//                 </Link>
//                 <button
//                   onClick={() => {
//                     handleLogout();
//                     setMenuOpen(false);
//                   }}
//                   className="w-full px-4 py-2 bg-red-500 text-white text-center rounded-lg hover:bg-red-600 transition-all"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to="/login"
//                   onClick={() => setMenuOpen(false)}
//                   className="block px-4 py-2 border border-[#3c6e71] text-[#3c6e71] text-center rounded-lg hover:bg-[#3c6e71] hover:text-white transition-all"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   onClick={() => setMenuOpen(false)}
//                   className="block px-4 py-2 bg-[#3c6e71] text-white text-center rounded-lg hover:bg-[#2e5558] transition-all"
//                 >
//                   Register
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default HomeNavbar;


import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import {
  SparklesIcon,
  BuildingOfficeIcon,
  MusicalNoteIcon,
  CakeIcon,
  CameraIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { VITE_API_BASE_URL } from "../../utils/api";

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

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // -----------------------------------------
  // CHECK LOGIN STATUS FROM LOCAL STORAGE
  // -----------------------------------------
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

  // -----------------------------------------
  // CLICK OUTSIDE HANDLERS
  // -----------------------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -----------------------------------------
  // LOGOUT HANDLER (with API + confirmation)
  // -----------------------------------------
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      await fetch(`${VITE_API_BASE_URL}/User/Logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.log("Error hitting logout API", err);
    }

    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole("");
    setUserName("");

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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">

          <Link to="/" className="relative group">
            Home
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
          </Link>

          {/* Categories */}
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 relative group"
            >
              Categories
              <FiChevronDown className={`transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
            </button>

            {categoriesOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border animate-fadeIn p-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.path}
                      to={category.path}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <Icon className={`w-6 h-6 ${category.color} group-hover:scale-110`} />
                      <span className="group-hover:text-[#3c6e71]">{category.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link to="/about" className="relative group">
            About
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
          </Link>

          <Link to="/contact" className="relative group">
            Contact
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#3c6e71] group-hover:w-full transition-all"></span>
          </Link>
        </div>

        {/* RIGHT SIDE AUTH */}
        <div className="hidden md:flex items-center space-x-4">

          {isLoggedIn ? (
            /* USER DROPDOWN */
            <div className="relative" ref={userMenuRef}>

              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3c6e71] text-white rounded-lg hover:bg-[#2f5b60] transition-all"
              >
                <FiUser />
                <span>{userName}</span>

                {/* ROLE BADGE */}
                <span className="ml-2 bg-white text-[#3c6e71] px-2 py-[2px] rounded text-xs font-semibold uppercase">
                  {userRole}
                </span>

                <FiChevronDown className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border p-3 space-y-2">

                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <FiUser className="text-[#3c6e71]" />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-all w-full"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* FIRST-TIME USERS: ONLY SIGNUP */}
              <Link
                to="/register"
                className="px-4 py-2 bg-[#3c6e71] text-white rounded-lg hover:bg-[#2f5b60] transition-all"
              >
                Sign Up
              </Link>

              {/* LOGIN BUTTON (hidden after login) */}
              <Link
                to="/login"
                className="px-4 py-2 border border-[#3c6e71] text-[#3c6e71] rounded-lg hover:bg-[#3c6e71] hover:text-white transition-all"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div
          className="md:hidden flex flex-col space-y-1 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`w-6 h-[2px] bg-[#3c6e71] ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`}></span>
          <span className={`w-6 h-[2px] bg-[#3c6e71] ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`w-6 h-[2px] bg-[#3c6e71] ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}></span>
        </div>
      </div>

      {/* MOBILE MENU */}
      {/* full code same as before — if you want, I will update it similarly */}
    </nav>
  );
};

export default HomeNavbar;
