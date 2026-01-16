import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { VITE_API_BASE_URL } from "../utils/api";
import {
  ArrowLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [service, setService] = useState(null);
  const [subservices, setSubservices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchServiceAndSubservices();
  }, [serviceId]);

  const fetchServiceAndSubservices = async () => {
    try {
      setLoading(true);
      
      // Fetch main service details
      const serviceResponse = await axios.get(
        `${VITE_API_BASE_URL}/Service/GetServiceById/${serviceId}`
      );
      setService(serviceResponse.data);

      // Fetch subservices for this service
      const subservicesResponse = await axios.get(
        `${VITE_API_BASE_URL}/Service/GetSubservicesByServiceCategoryId/${serviceId}`
      );
      setSubservices(subservicesResponse.data || []);
    } catch (error) {
      console.error("Error fetching service details:", error);
      toast.error("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubserviceClick = (subservice) => {
    // Navigate to vendors filtered by this subservice
    navigate(`/vendors/${serviceId}`, {
      state: {
        serviceName: service?.category_name,
        subserviceId: subservice.subservice_id,
        subserviceName: subservice.subservice_name
      }
    });
  };

  const filteredSubservices = subservices.filter(
    (sub) =>
      sub.is_active === 1 &&
      (sub.subservice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <>
        <HomeNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#284b63] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <HomeNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Not Found</h2>
            <button
              onClick={() => navigate("/home")}
              className="bg-[#284b63] text-white px-6 py-3 rounded-lg hover:bg-[#3c6e71] transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <HomeNavbar />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Services
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              <div className="flex-shrink-0">
                <img
                  src={service.icon_url}
                  alt={service.category_name}
                  className="w-32 h-32 object-cover rounded-2xl border-4 border-white/20 shadow-2xl"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {service.category_name}
                </h1>
                <p className="text-xl text-white/90 max-w-3xl">
                  {service.description}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subservices Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#284b63] mb-4">
                Choose Your Specific Service
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Select from our specialized services to find the perfect vendors for your needs
              </p>

              {/* Search Bar */}
              <div className="max-w-md mx-auto relative">
                <input
                  type="text"
                  placeholder="Search subservices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3c6e71] focus:outline-none shadow-sm"
                />
                <svg
                  className="absolute left-4 top-3.5 h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Subservices Grid */}
          {filteredSubservices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? "No matching subservices found" : "No subservices available yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "We're working on adding more specialized services"}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSubservices.map((subservice, index) => (
                <motion.div
                  key={subservice.subservice_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleSubserviceClick(subservice)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#284b63] to-[#3c6e71]">
                    <img
                      src={subservice.icon_url}
                      alt={subservice.subservice_name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#3c6e71] transition-colors">
                      {subservice.subservice_name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {subservice.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#284b63] font-semibold text-sm group-hover:text-[#f9a826] transition-colors">
                        View Vendors →
                      </span>
                      <div className="w-10 h-10 rounded-full bg-[#284b63]/10 group-hover:bg-[#f9a826]/20 flex items-center justify-center transition-colors">
                        <svg
                          className="w-5 h-5 text-[#284b63] group-hover:text-[#f9a826] transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Vendors Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate(`/vendors/${serviceId}`, {
                state: { serviceName: service.category_name }
              })}
              className="bg-[#284b63] hover:bg-[#3c6e71] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All {service.category_name} Vendors
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
}
