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
    // Navigate to sub-services page
    navigate(`/sub-services/${service.category_id}`, {
      state: {
        serviceName: service.title,
        serviceDescription: service.description,
        serviceImage: service.image
      }
    });
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
    <section id="services-section" className="py-16 relative overflow-hidden bg-white">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-white" />
      
      {/* Subtle decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#f9a826]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#284b63]/5 rounded-full blur-3xl" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 13inch:grid-cols-4 14inch:grid-cols-4 15inch:grid-cols-4 xl:grid-cols-5 gap-6 relative z-10">
          {services.map((service, index) => (
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
              className="cursor-pointer group h-full"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-[#f9a826] h-full flex flex-col">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#284b63] transition-colors">
                    {service.title}
                  </h3>
                  
                  <div className="w-16 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mb-4" />
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {service.description}
                  </p>

                  {/* Explore Button */}
                  <button className="w-full bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3 shadow-md hover:shadow-lg mt-auto">
                    Explore Services
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
