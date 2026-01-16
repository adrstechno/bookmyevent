
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiAward,
  FiCalendar,
  FiUsers,
  FiX
} from "react-icons/fi";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { VITE_API_BASE_URL } from "../utils/api";
import { useApiCall } from "../hooks/useApiCall";
import { LoadingSpinner, NoDataFound, ErrorDisplay, CardSkeleton } from "../components/common/StateComponents";
import { ERROR_TYPES } from "../utils/errorHandler";

const VendorsByService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceName, serviceDescription, subserviceId, subserviceName } = location.state || {};

  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterType, setFilterType] = useState("category");
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 6;

  // Use the custom hook for API calls
  const {
    data: vendors,
    error,
    execute: fetchVendors,
    isLoading,
    isEmpty,
    isError
  } = useApiCall([]);

  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = vendors?.slice(indexOfFirstVendor, indexOfLastVendor) || [];
  const totalPages = Math.ceil((vendors?.length || 0) / vendorsPerPage);

  useEffect(() => {
    if (filterType === "category" && !selectedDate) {
      fetchVendorsByCategory();
    } else if (filterType === "all" && !selectedDate) {
      fetchAllVendors();
    }
  }, [filterType, serviceId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [vendors]);

  // -------- FETCH CATEGORY VENDORS --------
  const fetchVendorsByCategory = async () => {
    await fetchVendors(
      () => fetch(
        `${VITE_API_BASE_URL}/Vendor/getvendorsByServiceId?service_category_id=${serviceId}`,
        { method: "GET", credentials: "include" }
      ).then(res => {
        if (!res.ok) throw new Error("Failed to fetch vendors");
        return res.json().then(data => ({ data: data.vendors || [] }));
      }),
      {
        emptyMessage: `No vendors found for this service category`,
        showEmptyToast: false
      }
    );
  };

  // -------- FETCH ALL VENDORS --------
  const fetchAllVendors = async () => {
    await fetchVendors(
      () => fetch(`${VITE_API_BASE_URL}/Vendor/Getallvendors`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch vendors");
          return res.json().then(data => ({ data: data || [] }));
        }),
      {
        emptyMessage: "No vendors available at the moment",
        showEmptyToast: false
      }
    );
  };

  // -------- FETCH FREE VENDORS BY DATE --------
  const fetchFreeVendorsByDate = async (dateObj) => {
    const formattedDate = dateObj.toISOString().split("T")[0];

    await fetchVendors(
      () => fetch(
        `${VITE_API_BASE_URL}/Vendor/getFreeVendorsByDay?date=${formattedDate}&service_id=${serviceId}`
      ).then(res => {
        if (!res.ok) throw new Error("Failed to fetch available vendors");
        return res.json().then(data => ({ data: data.vendors || [] }));
      }),
      {
        emptyMessage: `No vendors available on ${dateObj.toLocaleDateString()}`,
        showEmptyToast: false
      }
    );

    setShowCalendar(false);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchFreeVendorsByDate(date);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate(null);
    if (filterType === "category") {
      fetchVendorsByCategory();
    } else {
      fetchAllVendors();
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
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 bg-green-500 text-white p-1.5 sm:p-2 rounded-full shadow-lg">
          <FiAward className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}

      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
        <img
          src={vendor.profile_url || `/Vendor${(index % 4) + 1}.jpeg`}
          alt={vendor.business_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
            {vendor.business_name}
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {vendor.years_experience && (
          <div className="flex items-center gap-2 mb-2 sm:mb-3 text-[#f9a826] font-semibold">
            <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">
              {vendor.years_experience} Years Experience
            </span>
          </div>
        )}

        {vendor.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
            {vendor.description}
          </p>
        )}

        {vendor.city && (
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#3c6e71] flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              {vendor.city}, {vendor.state}
            </span>
          </div>
        )}

        {vendor.contact && (
          <div className="flex items-center gap-2 text-gray-700 mb-3 sm:mb-4">
            <FiPhone className="w-3 h-3 sm:w-4 sm:h-4 text-[#3c6e71] flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{vendor.contact}</span>
          </div>
        )}

        <button className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-sm sm:text-base">
          <span className="hidden sm:inline">View Details & Book</span>
          <span className="sm:hidden">View & Book</span>
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
        className="fixed top-20 sm:top-24 left-4 sm:left-6 z-50 bg-white border-2 border-[#3c6e71] text-[#3c6e71] hover:bg-[#3c6e71] hover:text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300"
      >
        <FiArrowLeft className="text-lg sm:text-2xl" />
      </motion.button>

      {/* CALENDAR MODAL */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCalendar(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl relative w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#284b63]">Select a Date</h3>
                <p className="text-sm text-gray-600 mt-1">Find available vendors for your event</p>
              </div>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl sm:text-2xl" />
              </button>
            </div>

            {/* Calendar Container */}
            <div className="p-4 sm:p-6">
              <div className="modern-datepicker-wrapper">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  inline
                  minDate={new Date()}
                  calendarClassName="modern-calendar"
                  dayClassName={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    
                    if (checkDate < today) {
                      return "past-date";
                    }
                    if (checkDate.getTime() === today.getTime()) {
                      return "today-date";
                    }
                    return "future-date";
                  }}
                />
              </div>

              {selectedDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    Selected: {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    setShowCalendar(false);
                  }}
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedDate) {
                      handleDateSelect(selectedDate);
                    }
                  }}
                  disabled={!selectedDate}
                  className={`flex-1 py-2.5 px-4 rounded-lg transition-colors font-medium ${
                    selectedDate
                      ? 'bg-[#284b63] text-white hover:bg-[#3c6e71]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Find Vendors
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-12 sm:py-16 lg:py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white">
          <FiUsers className="text-4xl sm:text-5xl lg:text-6xl text-[#f9a826] mx-auto mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
            {serviceName || "Service Vendors"}
          </h1>
          {subserviceName && (
            <div className="mt-3 sm:mt-4">
              <span className="inline-block bg-[#f9a826] text-white px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold shadow-lg">
                {subserviceName}
              </span>
            </div>
          )}
          <p className="text-base sm:text-lg lg:text-xl mt-2 sm:mt-4 max-w-2xl mx-auto">
            {serviceDescription || "Find the best vendors for your event"}
          </p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex justify-center items-center gap-3 sm:gap-4 mt-10 flex-wrap px-4 max-w-4xl mx-auto">
        <button
          onClick={() => {
            setFilterType("category");
            clearDateFilter();
          }}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md transition-all text-sm sm:text-base ${filterType === "category" && !selectedDate
            ? "bg-[#284b63] text-white"
            : "bg-white text-[#284b63] hover:bg-gray-100"
            }`}
        >
          By Category
        </button>

        <button
          onClick={() => {
            setFilterType("all");
            clearDateFilter();
          }}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md transition-all text-sm sm:text-base ${filterType === "all" && !selectedDate
            ? "bg-[#284b63] text-white"
            : "bg-white text-[#284b63] hover:bg-gray-100"
            }`}
        >
          Show All Vendors
        </button>

        <button
          onClick={() => setShowCalendar(true)}
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md bg-[#f9a826] text-white hover:bg-[#e09620] transition-all flex items-center gap-2 text-sm sm:text-base"
        >
          <FiCalendar className="text-base sm:text-lg" />
          <span className="hidden xs:inline">Choose Date</span>
          <span className="xs:hidden">Date</span>
        </button>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm sm:text-base"
          >
            <FiCalendar className="text-sm sm:text-base" />
            <span className="hidden sm:inline">{selectedDate.toLocaleDateString()}</span>
            <span className="sm:hidden">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <button
              onClick={clearDateFilter}
              className="ml-1 sm:ml-2 hover:bg-green-200 rounded-full p-1 transition-colors"
            >
              <FiX className="text-sm sm:text-base" />
            </button>
          </motion.div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 flex-grow">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardSkeleton count={6} />
            </motion.div>
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ErrorDisplay
                message={error?.message || "Failed to load vendors"}
                description="Please check your connection and try again"
                onRetry={() => {
                  if (selectedDate) {
                    fetchFreeVendorsByDate(selectedDate);
                  } else if (filterType === "category") {
                    fetchVendorsByCategory();
                  } else {
                    fetchAllVendors();
                  }
                }}
                type={error?.type === ERROR_TYPES.NETWORK ? "network" : "error"}
              />
            </motion.div>
          ) : isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <NoDataFound
                message={selectedDate
                  ? `No vendors available on ${selectedDate.toLocaleDateString()}`
                  : "No vendors found for this service"
                }
                description={selectedDate
                  ? "Try selecting a different date or browse all vendors"
                  : "Check back soon or explore other services!"
                }
                icon={<div className="text-6xl">🔍</div>}
                actionButton={
                  selectedDate ? (
                    <button
                      onClick={clearDateFilter}
                      className="bg-[#3c6e71] hover:bg-[#284b63] text-white px-6 py-3 rounded-lg transition duration-200"
                    >
                      Clear Date Filter
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/")}
                      className="bg-[#3c6e71] hover:bg-[#284b63] text-white px-6 py-3 rounded-lg transition duration-200"
                    >
                      Explore Other Services
                    </button>
                  )
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="vendors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Vendors Count */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Found <span className="text-[#f9a826]">{vendors.length}</span> {selectedDate ? "Available" : "Amazing"} Vendors
                </h2>
                <p className="text-gray-600">
                  {selectedDate
                    ? `Free on ${selectedDate.toLocaleDateString()}`
                    : "Choose the perfect match for your event"}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {currentVendors.map((v, i) => renderVendorCard(v, i))}
              </div>

              {/* Pagination */}
              {vendors.length > vendorsPerPage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center items-center gap-2 mt-12 px-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-[#284b63] hover:bg-[#284b63] hover:text-white shadow-md'
                      }`}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </motion.button>

                  <div className="flex gap-1 sm:gap-2 max-w-xs overflow-x-auto">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show fewer pages on mobile - use CSS approach instead of window.innerWidth
                        const isMobile = totalPages > 5; // Assume mobile if many pages
                        if (isMobile) {
                          return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                        }
                        return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis for gaps
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-2 py-2 text-gray-400 text-sm sm:text-base">...</span>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${currentPage === page
                                ? 'bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                                }`}
                            >
                              {page}
                            </motion.button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-[#284b63] hover:bg-[#284b63] hover:text-white shadow-md'
                      }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default VendorsByService;
