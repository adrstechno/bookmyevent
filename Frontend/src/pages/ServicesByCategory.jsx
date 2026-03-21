import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiGrid } from "react-icons/fi";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";
import { VITE_API_BASE_URL } from "../utils/api";
import { useApiCall } from "../hooks/useApiCall";
import { LoadingSpinner, NoDataFound, ErrorDisplay, CardSkeleton } from "../components/common/StateComponents";
import { ERROR_TYPES } from "../utils/errorHandler";

const ServicesByCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryName } = location.state || {};

  const {
    data: subServices,
    isLoading,
    isEmpty,
    isError,
    error,
    execute: fetchSubServices
  } = useApiCall([]);

  useEffect(() => {
    if (categoryId) {
      loadSubServices();
    }
  }, [categoryId]);

  const loadSubServices = async () => {
    await fetchSubServices(
      () => fetch(
        `${VITE_API_BASE_URL}/Subservice/GetSubservicesByCategory?category_id=${categoryId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then(res => {
        if (!res.ok) throw new Error("Failed to fetch sub-services");
        return res.json().then(data => ({ data: data.subservices || [] }));
      }),
      {
        emptyMessage: `No services found in this category`,
        showEmptyToast: false
      }
    );
  };

  const handleServiceClick = (subService) => {
    navigate(`/vendors/${categoryId}/${subService.subservice_id}`, {
      state: {
        serviceName: categoryName,
        subServiceName: subService.subservice_name,
        subServiceDescription: subService.description
      }
    });
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white flex flex-col min-h-screen">
      <HomeNavbar />

      {/* BACK BUTTON */}
      <motion.button
        onClick={() => navigate("/")}
        className="fixed top-20 sm:top-24 left-4 sm:left-6 z-50 bg-white border-2 border-[#3c6e71] text-[#3c6e71] hover:bg-[#3c6e71] hover:text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft className="text-lg sm:text-2xl" />
      </motion.button>

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-12 sm:py-16 lg:py-20 mt-16">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 text-center text-white">
          <FiGrid className="text-4xl sm:text-5xl lg:text-6xl text-[#f9a826] mx-auto mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
            {categoryName || "Services"}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl mt-2 sm:mt-4 max-w-2xl mx-auto">
            Choose the perfect service for your event
          </p>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-grow">
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
                message={error?.message || "Failed to load services"}
                description="Please check your connection and try again"
                onRetry={loadSubServices}
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
                message="No services found in this category"
                description="Check back soon or explore other categories!"
                icon={<div className="text-6xl">🔍</div>}
                actionButton={
                  <button
                    onClick={() => navigate("/")}
                    className="bg-[#3c6e71] hover:bg-[#284b63] text-white px-6 py-3 rounded-lg transition duration-200"
                  >
                    Explore Other Categories
                  </button>
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Services Count */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Found <span className="text-[#f9a826]">{subServices.length}</span> Services
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Click on any service to find vendors
                </p>
              </motion.div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {subServices.map((service, index) => (
                  <motion.div
                    key={service.subservice_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05
                    }}
                    onClick={() => handleServiceClick(service)}
                    className="cursor-pointer group h-full"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-[#f9a826] h-full flex flex-col">
                      {/* Image Section */}
                      <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0">
                        {service.icon_url ? (
                          <img
                            src={service.icon_url}
                            alt={service.subservice_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#284b63] to-[#3c6e71] flex items-center justify-center">
                            <FiGrid className="text-4xl sm:text-5xl text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>

                      {/* Content Section */}
                      <div className="p-4 sm:p-5 flex flex-col flex-grow">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-[#284b63] transition-colors line-clamp-2">
                          {service.subservice_name}
                        </h3>
                        
                        <div className="w-12 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mb-3" />
                        
                        {service.description && (
                          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                            {service.description}
                          </p>
                        )}

                        {/* View Vendors Button */}
                        <button className="w-full bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white py-2 sm:py-2.5 px-4 rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3 shadow-md hover:shadow-lg mt-auto text-sm">
                          View Vendors
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default ServicesByCategory;
