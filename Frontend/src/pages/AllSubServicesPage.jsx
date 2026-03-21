import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { VITE_API_BASE_URL } from "../utils/api";
import { useApiCall } from "../hooks/useApiCall";
import { NoDataFound, ErrorDisplay, CardSkeleton } from "../components/common/StateComponents";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";

const AllSubServicesPage = () => {
  const navigate = useNavigate();
  const { data: allSubServices, isLoading, isError, isEmpty, error, execute } = useApiCall([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadCategoriesAndSubServices();
  }, []);

  const loadCategoriesAndSubServices = async () => {
    try {
      console.log("Fetching categories from:", `${VITE_API_BASE_URL}/service/GetAllServices`);
      
      // Load categories first
      const categoriesResponse = await fetch(`${VITE_API_BASE_URL}/service/GetAllServices`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Categories response status:", categoriesResponse.status);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log("Categories received:", categoriesData.length);
        const activeCategories = categoriesData.filter(s => s.is_active === 1);
        setCategories(activeCategories);

        // Load all sub-services
        const allSubServicesPromises = activeCategories.map(category =>
          fetch(`${VITE_API_BASE_URL}/service/GetSubservicesByServiceCategoryId/${category.category_id}`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }).then(res => res.json())
        );

        const allSubServicesData = await Promise.all(allSubServicesPromises);
        console.log("Sub-services data received:", allSubServicesData);
        
        // Flatten and add category info to each sub-service
        const flattenedSubServices = allSubServicesData.flatMap((subServices, index) =>
          subServices
            .filter(s => s.is_active === 1)
            .map(subService => ({
              ...subService,
              categoryName: activeCategories[index].category_name,
              categoryId: activeCategories[index].category_id,
              categoryImage: activeCategories[index].icon_url
            }))
        );

        console.log("Total sub-services:", flattenedSubServices.length);

        await execute(async () => ({ data: flattenedSubServices }), {
          emptyMessage: "No sub-services available",
          showEmptyToast: false
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleSubServiceClick = (subService) => {
    // Try different possible ID field names
    const subServiceId = subService.subservice_id || subService.id || subService.subservices_id;
    
    navigate(`/vendors/${subService.categoryId}/${subServiceId}`, {
      state: {
        serviceName: subService.categoryName,
        subServiceName: subService.subservice_name,
        subServiceDescription: subService.description
      }
    });
  };

  const filteredSubServices = selectedCategory === "all"
    ? allSubServices
    : allSubServices.filter(s => s.categoryId === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-20 mt-16">
        <div className="max-w-[1920px] mx-auto px-6">
          <button
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-2 text-white hover:text-[#f9a826] font-semibold transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse All Services
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mx-auto mb-4" />
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Explore our complete range of event services and find the perfect vendors
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
            }`}
          >
            All Services ({allSubServices.length})
          </button>
          {categories.map((category) => {
            const count = allSubServices.filter(s => s.categoryId === category.category_id).length;
            return (
              <button
                key={category.category_id}
                onClick={() => setSelectedCategory(category.category_id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === category.category_id
                    ? "bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                }`}
              >
                {category.category_name} ({count})
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && <CardSkeleton count={9} />}

        {/* Error State */}
        {isError && (
          <ErrorDisplay
            message="Failed to load services"
            description="We couldn't load the services. Please try again."
            onRetry={loadCategoriesAndSubServices}
          />
        )}

        {/* Empty State */}
        {isEmpty && !isLoading && (
          <NoDataFound
            message="No services available"
            description="We're working on adding new services. Check back soon!"
          />
        )}

        {/* Sub-Services Grid */}
        {!isLoading && !isEmpty && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredSubServices.map((subService, index) => (
              <motion.div
                key={`${subService.categoryId}-${subService.subservice_id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05
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
                    ) : subService.categoryImage ? (
                      <img
                        src={subService.categoryImage}
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
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-[#f9a826] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {subService.categoryName}
                    </div>
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
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AllSubServicesPage;
