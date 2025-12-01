// import { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   FiArrowLeft, 
//   FiMapPin, 
//   FiPhone, 
//   FiAward,
//   FiCalendar,
//   FiUsers
// } from "react-icons/fi";
// import HomeNavbar from "../components/mainpage/HomeNavbar";
// import Footer from "../components/mainpage/Footer";
// import { VITE_API_BASE_URL } from "../utils/api";

// const VendorsByService = () => {
//   const { serviceId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { serviceName, serviceDescription } = location.state || {};

//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const vendorsPerPage = 6;

//   useEffect(() => {
//     fetchVendors();
//   }, [serviceId]);

//   // Calculate pagination
//   const indexOfLastVendor = currentPage * vendorsPerPage;
//   const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
//   const currentVendors = vendors.slice(indexOfFirstVendor, indexOfLastVendor);
//   const totalPages = Math.ceil(vendors.length / vendorsPerPage);

//   // Reset to page 1 when vendors change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [vendors]);

//   const fetchVendors = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `${VITE_API_BASE_URL}/Vendor/getvendorsByServiceId?service_category_id=${serviceId}`,
//         {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch vendors");
//       }

//       const result = await response.json();
//       setVendors(result.vendors || []);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching vendors:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full bg-gradient-to-b from-gray-50 to-white flex flex-col min-h-screen">
//       <HomeNavbar />

//       {/* Animated Background Pattern */}
//       <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
//         <div className="absolute inset-0" style={{
//           backgroundImage: 'radial-gradient(circle, #284b63 1px, transparent 1px)',
//           backgroundSize: '50px 50px'
//         }}></div>
//       </div>

//       {/* Back Button */}
//       <motion.button
//         initial={{ opacity: 0, x: -50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
//         whileHover={{ scale: 1.1, rotate: -5 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => navigate("/")}
//         className="fixed top-24 left-6 z-50 bg-white hover:bg-[#3c6e71] text-[#3c6e71] hover:text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group border-2 border-[#3c6e71]"
//         title="Back to Home"
//       >
//         <FiArrowLeft className="text-2xl group-hover:scale-110 transition-transform" />
//       </motion.button>

//       {/* Header Section with Animated Gradient */}
//       <div className="relative bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-20 mt-16 overflow-hidden">
//         {/* Animated Background Shapes */}
//         <motion.div
//           animate={{
//             scale: [1, 1.2, 1],
//             rotate: [0, 180, 360],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute top-0 right-0 w-96 h-96 bg-[#f9a826] opacity-10 rounded-full blur-3xl"
//         />
//         <motion.div
//           animate={{
//             scale: [1.2, 1, 1.2],
//             rotate: [360, 180, 0],
//           }}
//           transition={{
//             duration: 15,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"
//         />

//         <div className="max-w-7xl mx-auto px-6 relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-center text-white"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
//               className="inline-block mb-4"
//             >
//               <FiUsers className="text-6xl text-[#f9a826]" />
//             </motion.div>
//             <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
//               {serviceName || "Service Vendors"}
//             </h1>
//             <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
//               {serviceDescription || "Find the best vendors for your event"}
//             </p>
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: "100px" }}
//               transition={{ delay: 0.5, duration: 0.8 }}
//               className="h-1 bg-[#f9a826] mx-auto mt-6 rounded-full"
//             />
//           </motion.div>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="max-w-7xl mx-auto px-6 py-16 flex-grow relative z-10">
//         <AnimatePresence mode="wait">
//           {loading ? (
//             <motion.div
//               key="loading"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="text-center py-20"
//             >
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                 className="inline-block"
//               >
//                 <div className="w-16 h-16 border-4 border-[#284b63] border-t-[#f9a826] rounded-full"></div>
//               </motion.div>
//               <motion.p
//                 animate={{ opacity: [0.5, 1, 0.5] }}
//                 transition={{ duration: 1.5, repeat: Infinity }}
//                 className="mt-6 text-gray-600 text-lg font-semibold"
//               >
//                 Loading amazing vendors...
//               </motion.p>
//             </motion.div>
//           ) : error ? (
//             <motion.div
//               key="error"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0 }}
//               className="text-center py-20"
//             >
//               <motion.div
//                 animate={{ y: [0, -10, 0] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//                 className="text-6xl mb-4"
//               >
//                 😕
//               </motion.div>
//               <p className="text-red-600 mb-4 text-lg">Error loading vendors: {error}</p>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={fetchVendors}
//                 className="px-8 py-3 bg-[#284b63] text-white rounded-lg hover:bg-[#3c6e71] transition-colors shadow-lg"
//               >
//                 Retry
//               </motion.button>
//             </motion.div>
//           ) : vendors.length === 0 ? (
//             <motion.div
//               key="empty"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="text-center py-20"
//             >
//               <motion.div
//                 animate={{ rotate: [0, 10, -10, 0] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//                 className="text-6xl mb-4"
//               >
//                 🔍
//               </motion.div>
//               <p className="text-gray-600 text-xl mb-2">
//                 No vendors found for this service yet.
//               </p>
//               <p className="text-gray-500 mb-6">
//                 Check back soon or explore other services!
//               </p>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => navigate("/")}
//                 className="px-8 py-3 bg-[#284b63] text-white rounded-lg hover:bg-[#3c6e71] transition-colors shadow-lg"
//               >
//                 Back to Home
//               </motion.button>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="vendors"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               {/* Vendors Count */}
//               <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-center mb-12"
//               >
//                 <h2 className="text-3xl font-bold text-gray-800 mb-2">
//                   Found <span className="text-[#f9a826]">{vendors.length}</span> Amazing Vendors
//                 </h2>
//                 <p className="text-gray-600">Choose the perfect match for your event</p>
//               </motion.div>

//               <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
//                 {currentVendors.map((vendor, index) => (
//                   <motion.div
//                     key={vendor.vendor_id || index}
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ 
//                       duration: 0.5, 
//                       delay: index * 0.1
//                     }}
//                     whileHover={{ y: -8 }}
//                     onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
//                     className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group relative"
//                   >
//                     {/* Verified Badge */}
//                     {vendor.is_verified === 1 && (
//                       <div className="absolute top-4 right-4 z-20 bg-green-500 text-white p-2 rounded-full shadow-lg">
//                         <FiAward className="w-5 h-5" />
//                       </div>
//                     )}

//                     {/* Vendor Image */}
//                     <div className="relative h-64 overflow-hidden">
//                       <img
//                         src={vendor.profile_url || `/Vendor${(index % 4) + 1}.jpeg`}
//                         alt={vendor.business_name}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         onError={(e) => {
//                           e.currentTarget.src = `/Vendor${(index % 4) + 1}.jpeg`;
//                         }}
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      
//                       {/* Vendor Name Overlay */}
//                       <div className="absolute bottom-4 left-4 right-4">
//                         <h3 className="text-2xl font-bold text-white drop-shadow-lg">
//                           {vendor.business_name}
//                         </h3>
//                       </div>
//                     </div>

//                     {/* Vendor Info */}
//                     <div className="p-6">
//                       {/* Experience */}
//                       {vendor.years_experience && (
//                         <div className="flex items-center gap-2 mb-3 text-[#f9a826] font-semibold">
//                           <FiCalendar className="w-4 h-4" />
//                           <span className="text-sm">{vendor.years_experience} Years Experience</span>
//                         </div>
//                       )}

//                       {/* Description */}
//                       {vendor.description && (
//                         <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                           {vendor.description}
//                         </p>
//                       )}

//                       {/* Location */}
//                       {vendor.city && (
//                         <div className="flex items-center gap-2 text-gray-700 mb-2">
//                           <FiMapPin className="w-4 h-4 text-[#3c6e71]" />
//                           <span className="text-sm font-medium">
//                             {vendor.city}, {vendor.state}
//                           </span>
//                         </div>
//                       )}

//                       {/* Contact */}
//                       {vendor.contact && (
//                         <div className="flex items-center gap-2 text-gray-700 mb-4">
//                           <FiPhone className="w-4 h-4 text-[#3c6e71]" />
//                           <span className="text-sm font-medium">{vendor.contact}</span>
//                         </div>
//                       )}

//                       {/* View Details Button */}
//                       <button className="w-full py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 font-semibold shadow-md hover:shadow-lg">
//                         View Details & Book
//                       </button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Pagination */}
//               {vendors.length > vendorsPerPage && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="flex justify-center items-center gap-2 mt-12"
//                 >
//                   {/* Previous Button */}
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
//                       currentPage === 1
//                         ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                         : 'bg-white text-[#284b63] hover:bg-[#284b63] hover:text-white shadow-md'
//                     }`}
//                   >
//                     Previous
//                   </motion.button>

//                   {/* Page Numbers */}
//                   <div className="flex gap-2">
//                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                       <motion.button
//                         key={page}
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => setCurrentPage(page)}
//                         className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
//                           currentPage === page
//                             ? 'bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white shadow-lg'
//                             : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
//                         }`}
//                       >
//                         {page}
//                       </motion.button>
//                     ))}
//                   </div>

//                   {/* Next Button */}
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
//                       currentPage === totalPages
//                         ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                         : 'bg-white text-[#284b63] hover:bg-[#284b63] hover:text-white shadow-md'
//                     }`}
//                   >
//                     Next
//                   </motion.button>
//                 </motion.div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default VendorsByService;


import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiAward,
  FiCalendar,
  FiUsers
} from "react-icons/fi";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../style/Calendar.css";
import { VITE_API_BASE_URL } from "../utils/api";

const VendorsByService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceName, serviceDescription } = location.state || {};

  const [vendors, setVendors] = useState([]);
  const [freeVendors, setFreeVendors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filterType = category | all | calendar
  const [filterType, setFilterType] = useState("category");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 6;

  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = vendors.slice(indexOfFirstVendor, indexOfLastVendor);
  const totalPages = Math.ceil(vendors.length / vendorsPerPage);

  useEffect(() => {
    if (filterType === "category") fetchVendorsByCategory();
    if (filterType === "all") fetchAllVendors();
  }, [filterType, serviceId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [vendors]);

  // -------- FETCH CATEGORY VENDORS --------
  const fetchVendorsByCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${VITE_API_BASE_URL}/Vendor/getvendorsByServiceId?service_category_id=${serviceId}`,
        { method: "GET", credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch vendors");

      const result = await response.json();
      setVendors(result.vendors || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------- FETCH ALL VENDORS --------
  const fetchAllVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${VITE_API_BASE_URL}/Vendor/getAllVendors`);
      const result = await response.json();

      setVendors(result.vendors || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch all vendors");
    } finally {
      setLoading(false);
    }
  };

  // -------- FETCH FREE VENDORS BY DATE --------
  const fetchFreeVendorsByDate = async (dateObj) => {
    try {
      setLoading(true);
      const formattedDate = dateObj.toISOString().split("T")[0];

      const response = await fetch(
        `${VITE_API_BASE_URL}/Vendor/getFreeVendorsByDay?date=${formattedDate}`
      );
      const result = await response.json();

      setFreeVendors(result.vendors || []);
      setError(null);
    } catch (err) {
      setError("Failed to load free vendors");
    } finally {
      setLoading(false);
    }
  };

  // -------- Render Vendor Card --------
  const renderVendorCard = (vendor, index) => (
    <motion.div
      key={vendor.vendor_id || index}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group relative"
    >
      {vendor.is_verified === 1 && (
        <div className="absolute top-4 right-4 z-20 bg-green-500 text-white p-2 rounded-full shadow-lg">
          <FiAward className="w-5 h-5" />
        </div>
      )}

      <div className="relative h-64 overflow-hidden">
        <img
          src={vendor.profile_url || `/Vendor${(index % 4) + 1}.jpeg`}
          alt={vendor.business_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {vendor.business_name}
          </h3>
        </div>
      </div>

      <div className="p-6">
        {vendor.years_experience && (
          <div className="flex items-center gap-2 mb-3 text-[#f9a826] font-semibold">
            <FiCalendar className="w-4 h-4" />
            <span className="text-sm">
              {vendor.years_experience} Years Experience
            </span>
          </div>
        )}

        {vendor.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {vendor.description}
          </p>
        )}

        {vendor.city && (
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <FiMapPin className="w-4 h-4 text-[#3c6e71]" />
            <span className="text-sm font-medium">
              {vendor.city}, {vendor.state}
            </span>
          </div>
        )}

        {vendor.contact && (
          <div className="flex items-center gap-2 text-gray-700 mb-4">
            <FiPhone className="w-4 h-4 text-[#3c6e71]" />
            <span className="text-sm font-medium">{vendor.contact}</span>
          </div>
        )}

        <button className="w-full py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 font-semibold shadow-md hover:shadow-lg">
          View Details & Book
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white flex flex-col min-h-screen">
      <HomeNavbar />

      {/* BACK BUTTON */}
      <motion.button
        onClick={() => navigate("/")}
        className="fixed top-24 left-6 z-50 bg-white border-2 border-[#3c6e71] text-[#3c6e71] hover:bg-[#3c6e71] hover:text-white p-4 rounded-full shadow-2xl"
      >
        <FiArrowLeft className="text-2xl" />
      </motion.button>

      {/* CALENDAR VISIBLE ONLY IN FILTER */}
      {filterType === "calendar" && (
        <div className="fixed top-28 right-6 z-50">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl shadow-2xl backdrop-blur-xl bg-white/70 p-3"
          >
            <Calendar
              onChange={(date) => {
                setSelectedDate(date);
                fetchFreeVendorsByDate(date);
              }}
              value={selectedDate}
              className="event-calendar rounded-2xl"
            />
          </motion.div>
        </div>
      )}

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-20 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-white">
          <FiUsers className="text-6xl text-[#f9a826] mx-auto mb-4" />
          <h1 className="text-5xl font-bold">
            {serviceName || "Service Vendors"}
          </h1>
          <p className="text-xl mt-4">
            {serviceDescription || "Find the best vendors for your event"}
          </p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => setFilterType("category")}
          className={`px-6 py-3 rounded-xl font-semibold shadow-md ${
            filterType === "category"
              ? "bg-[#284b63] text-white"
              : "bg-white text-[#284b63]"
          }`}
        >
          By Category
        </button>

        <button
          onClick={() => setFilterType("all")}
          className={`px-6 py-3 rounded-xl font-semibold shadow-md ${
            filterType === "all"
              ? "bg-[#284b63] text-white"
              : "bg-white text-[#284b63]"
          }`}
        >
          Show All Vendors
        </button>

        <button
          onClick={() => setFilterType("calendar")}
          className={`px-6 py-3 rounded-xl font-semibold shadow-md ${
            filterType === "calendar"
              ? "bg-[#284b63] text-white"
              : "bg-white text-[#284b63]"
          }`}
        >
          By Calendar
        </button>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 flex-grow">
        {loading ? (
          <div className="text-center py-20">Loading vendors...</div>
        ) : filterType === "calendar" ? (
          freeVendors.length === 0 ? (
            <p className="text-center text-lg text-gray-600">
              No free vendors on selected date.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {freeVendors.map((v, i) => renderVendorCard(v, i))}
            </div>
          )
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentVendors.map((v, i) => renderVendorCard(v, i))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VendorsByService;
