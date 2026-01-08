import React, { useState, useEffect } from "react";
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
import { LoadingSpinner, NoDataFound, ErrorDisplay, CardSkeleton } from "../common/StateComponents";
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
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 6;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${VITE_API_BASE_URL}/service/GetAllServices`, {
        method: "GET",
        credentials: "include", // This sends cookies with the request
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

      setServices(transformedServices.filter(s => s.is_active === 1));
      setError(null);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.message);
    } finally {
      setLoading(false);
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
    <section id="services-section" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
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
            backgroundImage: 'radial-gradient(circle, #284b63 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-5xl font-bold text-[#284b63] mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Explore Event Categories
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-1 bg-[#f9a826] mx-auto mb-4 rounded-full"
          />
          <motion.p
            className="text-gray-600 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Choose your event type and find the best vendors to make it happen.
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
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
            className="cursor-pointer"
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
                <div className="w-full h-[420px] flex flex-col justify-between p-4">
                  <div className="flex flex-col items-center justify-center flex-1 min-h-0">
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/20 max-w-full">
                      <service.icon className="w-12 h-12 text-[#f9a826] drop-shadow-2xl mb-2 mx-auto" />
                      <h3 className="text-xl font-bold text-white drop-shadow-2xl text-center line-clamp-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                        {service.title}
                      </h3>
                    </div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-gray-200 flex-shrink-0">
                    <p className="text-gray-800 text-xs leading-relaxed mb-2 text-center font-medium line-clamp-3">
                      {service.description}
                    </p>
                    <div className="text-center">
                      <span className="inline-block text-[#284b63] text-sm font-bold hover:text-[#f9a826] transition-colors">
                        Explore Vendors →
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
        <div className="max-w-7xl mx-auto px-6 mt-12 flex items-center justify-center gap-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#284b63] text-white hover:bg-[#3c6e71]"
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
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentPage === page
                  ? "bg-[#284b63] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#284b63] text-white hover:bg-[#3c6e71]"
              }`}
          >
            Next
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;
