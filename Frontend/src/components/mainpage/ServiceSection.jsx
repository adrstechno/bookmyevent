import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  SparklesIcon,
  BuildingOfficeIcon,
  MusicalNoteIcon,
  CakeIcon,
  CameraIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { VITE_API_BASE_URL } from "../../utils/api";
import TiltedCard from "./TiltedCard";
import { useApiCall } from "../../hooks/useApiCall";
import { NoDataFound, ErrorDisplay, CardSkeleton } from "../common/StateComponents";
import { ERROR_TYPES } from "../../utils/errorHandler";

const defaultIcons = [
  SparklesIcon,
  BuildingOfficeIcon,
  MusicalNoteIcon,
  CakeIcon,
  CameraIcon,
  GlobeAltIcon,
];

const ServicesSection = () => {
  const navigate = useNavigate();
  const { data: services, isLoading, isError, isEmpty, error, execute } = useApiCall([]);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 6;

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      await execute(async () => {
        const response = await fetch(`${VITE_API_BASE_URL}/service/GetAllServices`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();

        // Transform API data to match component structure
        const transformedServices = data.map((service, index) => ({
          category_id: service.category_id,
          title: service.category_name,
          slug: service.category_name.toLowerCase().replace(/\s+/g, "-"),
          description: service.description,
          icon: defaultIcons[index % defaultIcons.length],
          color: getColorGradient(index),
          image: service.icon_url,
          is_active: service.is_active,
        }));

        return { data: transformedServices.filter(s => s.is_active === 1) };
      }, {
        emptyMessage: "No services available at the moment",
        showEmptyToast: false
      });
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const getColorGradient = (index) => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-indigo-500",
      "from-yellow-500 to-orange-500",
      "from-fuchsia-500 to-pink-500",
      "from-green-500 to-emerald-500",
    ];
    return gradients[index % gradients.length];
  };

  const handleServiceClick = (service) => {
    // Navigate to vendors page with service ID
    navigate(`/vendors/${service.category_id}`, {
      state: {
        serviceName: service.title,
        serviceDescription: service.description
      }
    });
  };

  // Pagination logic
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services?.slice(indexOfFirstService, indexOfLastService) || [];
  const totalPages = Math.ceil((services?.length || 0) / servicesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          <CardSkeleton count={6} />
        </div>
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ErrorDisplay
            message="Failed to load services"
            description="We couldn't load the event categories. Please try again."
            onRetry={loadServices}
            type={error?.type === ERROR_TYPES.NETWORK ? "network" : "error"}
          />
        </div>
      </section>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <NoDataFound
            message="No services available"
            description="We're working on adding new event categories. Check back soon!"
            icon={<div className="text-6xl">🎉</div>}
            actionButton={
              <button
                onClick={loadServices}
                className="bg-[#284b63] hover:bg-[#3c6e71] text-white px-6 py-3 rounded-lg transition duration-200"
              >
                Refresh
              </button>
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section id="services-section" className="py-24 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&h=1080&fit=crop&crop=center')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95" />
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #284b63 2px, transparent 2px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#f9a826]/20 to-[#f7b733]/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-[#3c6e71]/20 to-[#284b63]/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#284b63] mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Explore Our Categories
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "120px" }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-1.5 bg-gradient-to-r from-[#f9a826] to-[#f7b733] mx-auto mb-6 rounded-full"
            />
            <motion.p
              className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Choose your event type and find the best vendors to make it happen.
            </motion.p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {currentServices.map((service, index) => (
            <motion.div
              key={service.category_id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1
              }}
              onClick={() => handleServiceClick(service)}
              className="cursor-pointer group"
            >
              <TiltedCard
                imageSrc={service.image}
                altText={service.title}
                captionText={service.title}
                containerHeight="420px"
                containerWidth="100%"
                imageHeight="420px"
                imageWidth="100%"
                scaleOnHover={1.05}
                rotateAmplitude={8}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                  <div className="w-full h-[420px] flex flex-col justify-between p-6">
                    <div className="flex flex-col items-center justify-center flex-1 min-h-0">
                      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-full max-w-sm transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#f9a826] to-[#f7b733] rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                          <service.icon className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2 line-clamp-2">
                          {service.title}
                        </h3>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mx-auto mb-4" />
                      </div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200 flex-shrink-0">
                      <p className="text-gray-700 text-sm leading-relaxed mb-4 text-center line-clamp-3">
                        {service.description}
                      </p>
                      <div className="text-center">
                        <span className="inline-flex items-center gap-2 text-[#284b63] text-sm font-bold hover:text-[#f9a826] transition-colors group-hover:gap-3 duration-300">
                          Explore Vendors 
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                }
              />
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#284b63] text-white hover:bg-[#3c6e71] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${currentPage === page
                    ? "bg-[#284b63] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#284b63] text-white hover:bg-[#3c6e71] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
            >
              Next
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
