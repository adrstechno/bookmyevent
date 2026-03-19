import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FiMapPin, FiPhone, FiAward } from "react-icons/fi";
import { VITE_API_BASE_URL } from "../utils/api";
import { useApiCall } from "../hooks/useApiCall";
import { NoDataFound, ErrorDisplay, CardSkeleton } from "../components/common/StateComponents";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";

const AllVendorsPage = () => {
  const navigate = useNavigate();
  const { data: vendors, isLoading, isError, isEmpty, error, execute } = useApiCall([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      await execute(async () => {
        console.log("Fetching vendors from:", `${VITE_API_BASE_URL}/Vendor/Getallvendors`);
        
        const response = await fetch(`${VITE_API_BASE_URL}/Vendor/Getallvendors`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch vendors: ${response.status}`);
        }

        const data = await response.json();
        console.log("Vendors data received:", data);
        console.log("Number of vendors:", data?.length);
        
        // Extract unique cities
        const uniqueCities = [...new Set(data.map(v => v.city).filter(Boolean))];
        setCities(uniqueCities);

        return { data: data || [] };
      }, {
        emptyMessage: "No vendors available",
        showEmptyToast: false
      });
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "all" || vendor.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-20 mt-16">
        <div className="max-w-7xl mx-auto px-6">
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
              Find Your Perfect Vendor
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full mx-auto mb-4" />
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Browse through our verified vendors and book with confidence
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search vendors by name or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#f9a826] focus:outline-none transition-colors text-lg"
            />
          </div>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#f9a826] focus:outline-none transition-colors text-lg bg-white"
          >
            <option value="all">All Cities ({vendors.length})</option>
            {cities.map((city) => {
              const count = vendors.filter(v => v.city === city).length;
              return (
                <option key={city} value={city}>
                  {city} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </div>

        {/* Loading State */}
        {isLoading && <CardSkeleton count={9} />}

        {/* Error State */}
        {isError && (
          <ErrorDisplay
            message="Failed to load vendors"
            description="We couldn't load the vendors. Please try again."
            onRetry={loadVendors}
          />
        )}

        {/* Empty State */}
        {isEmpty && !isLoading && (
          <NoDataFound
            message="No vendors available"
            description="We're working on adding new vendors. Check back soon!"
          />
        )}

        {/* No Results */}
        {!isLoading && !isEmpty && filteredVendors.length === 0 && (
          <NoDataFound
            message="No vendors found"
            description="Try adjusting your search or filters"
          />
        )}

        {/* Vendors Grid */}
        {!isLoading && filteredVendors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.vendor_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05
                }}
                onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
                className="cursor-pointer group"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-[#f9a826] relative">
                  {/* Verified Badge */}
                  {vendor.is_verified === 1 && (
                    <div className="absolute top-4 right-4 z-10 bg-green-500 text-white p-2 rounded-full shadow-lg">
                      <FiAward className="w-5 h-5" />
                    </div>
                  )}

                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden bg-gray-200">
                    <img
                      src={vendor.profile_url || `/Vendor${(index % 4) + 1}.jpeg`}
                      alt={vendor.business_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-[#284b63] transition-colors line-clamp-1">
                      {vendor.business_name}
                    </h3>

                    {vendor.city && vendor.state && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <FiMapPin className="w-4 h-4 text-[#3c6e71]" />
                        <span className="text-sm">
                          {vendor.city}, {vendor.state}
                        </span>
                      </div>
                    )}

                    {vendor.contact && (
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <FiPhone className="w-4 h-4 text-[#3c6e71]" />
                        <span className="text-sm">{vendor.contact}</span>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
                      {vendor.description || "Professional event services"}
                    </p>

                    {/* View Button */}
                    <button className="w-full bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3 shadow-md hover:shadow-lg">
                      View Details & Book
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

export default AllVendorsPage;
