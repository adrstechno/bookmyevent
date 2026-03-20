import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { VITE_API_BASE_URL } from "../utils/api";
import { useApiCall } from "../hooks/useApiCall";
import { NoDataFound, ErrorDisplay, CardSkeleton } from "../components/common/StateComponents";

const SubServicesPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceName, serviceDescription, serviceImage } = location.state || {};
  
  const { data: subServices, isLoading, isError, isEmpty, error, execute } = useApiCall([]);

  useEffect(() => {
    loadSubServices();
  }, [categoryId]);

  const loadSubServices = async () => {
    try {
      await execute(async () => {
        const response = await fetch(
          `${VITE_API_BASE_URL}/service/GetSubservicesByServiceCategoryId/${categoryId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sub-services");
        }

        const data = await response.json();
        return { data: data.filter(s => s.is_active === 1) };
      }, {
        emptyMessage: "No sub-services available for this category",
        showEmptyToast: false
      });
    } catch (err) {
      console.error("Error fetching sub-services:", err);
    }
  };

  const handleSubServiceClick = (subService) => {
    // Try different possible ID field names
    const subServiceId = subService.subservice_id || subService.id || subService.subservices_id;
    
    // Navigate to vendors page with both category and sub-service
    navigate(`/vendors/${categoryId}/${subServiceId}`, {
      state: {
        serviceName: serviceName,
        subServiceName: subService.subservice_name,
        subServiceDescription: subService.description
      }
    });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="h-12 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
          <CardSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-[1920px] mx-auto px-6">
          <ErrorDisplay
            message="Failed to load sub-services"
            description="We couldn't load the sub-services. Please try again."
            onRetry={loadSubServices}
          />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-[1920px] mx-auto px-6">
          <button
            onClick={handleBackClick}
            className="mb-8 flex items-center gap-2 text-[#284b63] hover:text-[#3c6e71] font-semibold"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Categories
          </button>
          <NoDataFound
            message="No sub-services available"
            description="This category doesn't have any sub-services yet."
            actionButton={
              <button
                onClick={() => navigate("/")}
                className="bg-[#284b63] hover:bg-[#3c6e71] text-white px-6 py-3 rounded-lg transition duration-200"
              >
                Back to Home
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div 
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: serviceImage ? `url(${serviceImage})` : 'url(https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&h=1080&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#284b63]/95 to-[#3c6e71]/95" />
        <div className="relative max-w-[1920px] mx-auto px-6">
          <button
            onClick={handleBackClick}
            className="mb-6 flex items-center gap-2 text-white hover:text-[#f9a826] font-semibold transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Categories
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {serviceName || "Sub Services"}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mb-4" />
            <p className="text-white/90 text-lg max-w-3xl">
              {serviceDescription || "Choose a specific service to find the best vendors"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Sub-Services Grid */}
      <div className="max-w-[1920px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {subServices.map((subService, index) => (
            <motion.div
              key={subService.sub_service_id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1
              }}
              onClick={() => handleSubServiceClick(subService)}
              className="cursor-pointer group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-[#f9a826]">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden bg-gray-200">
                  {subService.icon_url ? (
                    <img
                      src={subService.icon_url}
                      alt={subService.subservice_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : serviceImage ? (
                    <img
                      src={serviceImage}
                      alt={subService.subservice_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#284b63] to-[#3c6e71] flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {subService.subservice_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#284b63] transition-colors">
                    {subService.subservice_name}
                  </h3>
                  
                  <div className="w-16 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mb-4" />
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {subService.description || "Explore vendors offering this service"}
                  </p>

                  {/* Explore Button */}
                  <button className="w-full bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3 shadow-md hover:shadow-lg">
                    View Vendors
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
    </div>
  );
};

export default SubServicesPage;
