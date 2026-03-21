import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { VITE_API_BASE_URL } from "../../utils/api";
import { useApiCall } from "../../hooks/useApiCall";
import { NoDataFound, ErrorDisplay, CardSkeleton } from "../common/StateComponents";

const SubServicesSection = () => {
  const navigate = useNavigate();
  const { data: subServices, isLoading, isError, isEmpty, error, execute } = useApiCall([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadSubServices(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/service/GetAllServices`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const activeCategories = data.filter(s => s.is_active === 1);
        setCategories(activeCategories);
        
        // Auto-select first category
        if (activeCategories.length > 0) {
          setSelectedCategory(activeCategories[0].category_id);
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const loadSubServices = async (categoryId) => {
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
    const subServiceId = subService.subservice_id || subService.id || subService.subservices_id;
    
    const category = categories.find(c => c.category_id === selectedCategory);
    navigate(`/vendors/${selectedCategory}/${subServiceId}`, {
      state: {
        serviceName: category?.category_name,
        subServiceName: subService.subservice_name,
        subServiceDescription: subService.description
      }
    });
  };

  if (categories.length === 0) {
    return null; // Don't show section if no categories
  }

  return (
    <section className="py-16 relative overflow-hidden bg-gray-50">
      {/* Clean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#3c6e71]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#f9a826]/5 rounded-full blur-3xl" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#284b63] mb-6">
              Popular Services
            </h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "120px" }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-1.5 bg-gradient-to-r from-[#f9a826] to-[#f7b733] mx-auto mb-6 rounded-full"
            />
            <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Browse our most popular services and find the perfect vendors for your event
            </p>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => setSelectedCategory(category.category_id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedCategory === category.category_id
                  ? "bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              {category.category_name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && <CardSkeleton count={6} />}

        {/* Error State */}
        {isError && (
          <ErrorDisplay
            message="Failed to load services"
            description="We couldn't load the services. Please try again."
            onRetry={() => loadSubServices(selectedCategory)}
          />
        )}

        {/* Empty State */}
        {isEmpty && !isLoading && (
          <NoDataFound
            message="No services available"
            description="This category doesn't have any services yet."
          />
        )}

        {/* Sub-Services Grid */}
        {!isLoading && !isEmpty && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {subServices.slice(0, 6).map((subService, index) => {
              const subServiceId = subService.subservice_id || subService.id || subService.subservices_id;
              return (
              <motion.div
                key={subServiceId || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }}
                onClick={() => handleSubServiceClick(subService)}
                className="cursor-pointer group h-full"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-[#f9a826] h-full flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden bg-gray-200 flex-shrink-0">
                    {subService.icon_url ? (
                      <img
                        src={subService.icon_url}
                        alt={subService.subservice_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#284b63] transition-colors line-clamp-1">
                      {subService.subservice_name}
                    </h3>
                    
                    <div className="w-16 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mb-4" />
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                      {subService.description || "Explore vendors offering this service"}
                    </p>

                    {/* View Button */}
                    <button className="w-full bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3 shadow-md hover:shadow-lg mt-auto">
                      View Vendors
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>
        )}

        {/* View All Button */}
        {!isEmpty && subServices.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                const category = categories.find(c => c.category_id === selectedCategory);
                navigate(`/sub-services/${selectedCategory}`, {
                  state: {
                    serviceName: category?.category_name,
                    serviceImage: category?.icon_url
                  }
                });
              }}
              className="inline-flex items-center gap-2 bg-white text-[#284b63] border-2 border-[#284b63] px-8 py-4 rounded-xl font-semibold hover:bg-[#284b63] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubServicesSection;
