import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiAward,
  FiCheckCircle,
  FiGlobe,
  FiClock,
  FiPackage,
  FiImage,
  FiShoppingCart,
} from "react-icons/fi";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";
import { VITE_API_BASE_URL } from "../utils/api";

const VendorDetail = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState(null);
  const [packages, setPackages] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [eventImages, setEventImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchAllVendorData();
  }, [vendorId]);

  const fetchAllVendorData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor details from all vendors list
      const vendorsResponse = await fetch(
        `${VITE_API_BASE_URL}/Vendor/Getallvendors`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json();
        const foundVendor = vendorsData.find(v => v.vendor_id === parseInt(vendorId));
        
        if (foundVendor) {
          setVendor(foundVendor);
          
          // Fetch packages for this vendor
          fetchPackages(vendorId);
          
          // Fetch event images for this vendor
          fetchEventImages(vendorId);
        } else {
          throw new Error("Vendor not found");
        }
      } else {
        throw new Error("Failed to fetch vendor details");
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching vendor data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async (vId) => {
    try {
      const response = await fetch(
        `${VITE_API_BASE_URL}/Vendor/getAllVendorPackages?vendor_id=${vId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Packages data:", data);
        setPackages(data.packages || []);
      } else {
        console.error("Failed to fetch packages:", response.status);
        setPackages([]);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setPackages([]);
    }
  };

  const fetchEventImages = async (vId) => {
    try {
      // Since GetvendorEventImages requires authentication and only returns logged-in vendor's images,
      // we need to fetch from the Event_images table directly
      // For now, we'll try to get images from all vendors and filter by vendor_id
      
      // First, try the authenticated endpoint (in case user is logged in as this vendor)
      try {
        const response = await fetch(
          `${VITE_API_BASE_URL}/Vendor/GetvendorEventImages`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Event images data:", data);
          
          // Check if these images belong to the current vendor
          if (data.eventImages && data.eventImages.length > 0) {
            // Filter images for this specific vendor
            const vendorImages = data.eventImages.filter(
              img => img.vendor_id === parseInt(vId)
            );
            
            if (vendorImages.length > 0) {
              setEventImages(vendorImages);
              return;
            }
          }
        }
      } catch (authErr) {
        console.log("Authenticated endpoint not accessible:", authErr);
      }

      // If authenticated endpoint doesn't work, images won't be available
      // This is because the backend requires authentication
      console.log("Event images require vendor authentication");
      setEventImages([]);
      
    } catch (err) {
      console.error("Error fetching event images:", err);
      setEventImages([]);
    }
  };

  const handleBookNow = (pkg) => {
    setSelectedPackage(pkg);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <HomeNavbar />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mt-20"
        >
          <div className="w-16 h-16 border-4 border-[#284b63] border-t-[#f9a826] rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col">
        <HomeNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4 text-lg">Error: {error || "Vendor not found"}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-[#284b63] text-white rounded-lg hover:bg-[#3c6e71] transition-colors shadow-lg"
            >
              Go Back
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white flex flex-col min-h-screen relative">
      <HomeNavbar />

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #284b63 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="fixed top-24 left-6 z-50 bg-white hover:bg-[#3c6e71] text-[#3c6e71] hover:text-white p-4 rounded-full shadow-2xl transition-all duration-300 group border-2 border-[#3c6e71]"
      >
        <FiArrowLeft className="text-2xl group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* Hero Section with Background Image */}
      <div className="relative h-[500px] overflow-hidden mt-16">
        <motion.img
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
          src={vendor.profile_url || `/Vendor${(vendor.vendor_id % 4) + 1}.jpeg`}
          alt={vendor.business_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `/Vendor${(vendor.vendor_id % 4) + 1}.jpeg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-end gap-6"
            >
              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {vendor.business_name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  {vendor.is_verified === 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg"
                    >
                      <FiCheckCircle />
                      <span className="font-semibold">Verified</span>
                    </motion.div>
                  )}
                  {vendor.years_experience && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                      className="inline-flex items-center gap-2 bg-[#f9a826] text-white px-4 py-2 rounded-full shadow-lg"
                    >
                      <FiAward />
                      <span className="font-semibold">{vendor.years_experience}+ Years</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FiGlobe className="text-[#3c6e71]" />
                About Us
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {vendor.description || "Professional event services provider dedicated to making your special moments unforgettable."}
              </p>
            </motion.div>

            {/* Packages Section */}
            {packages.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FiPackage className="text-[#3c6e71]" />
                  Our Packages
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({packages.length} {packages.length === 1 ? 'package' : 'packages'})
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {packages.map((pkg, index) => (
                    <motion.div
                      key={pkg.package_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#f9a826] transition-all duration-300 shadow-md hover:shadow-xl"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{pkg.package_name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{pkg.package_desc}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-[#3c6e71]">
                          <span className="text-3xl font-bold">₹{parseFloat(pkg.amount).toLocaleString('en-IN')}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBookNow(pkg)}
                          className="px-6 py-2 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all shadow-md"
                        >
                          Book Now
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-12 border-2 border-dashed border-gray-300 text-center"
              >
                <FiPackage className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Packages Available</h3>
                <p className="text-gray-500">This vendor hasn't added any packages yet. Contact them directly for pricing!</p>
              </motion.div>
            )}

            {/* Event Images Gallery */}
            {eventImages.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FiImage className="text-[#3c6e71]" />
                  Event Gallery
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({eventImages.length} {eventImages.length === 1 ? 'photo' : 'photos'})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventImages.map((img, index) => (
                    <motion.div
                      key={img.image_id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative h-64 rounded-xl overflow-hidden shadow-lg group cursor-pointer"
                    >
                      <img
                        src={img.imageUrl}
                        alt={`${vendor.business_name} Event ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = `/Vendor${(vendor.vendor_id % 4) + 1}.jpeg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white font-semibold text-sm">
                          Event Photo {index + 1}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-12 border-2 border-dashed border-gray-300 text-center"
              >
                <FiImage className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Event Photos Yet</h3>
                <p className="text-gray-500">This vendor hasn't uploaded event photos yet. Check back soon!</p>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Info</h3>
              
              <div className="space-y-4">
                {vendor.contact && (
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                    <FiPhone className="w-5 h-5 text-[#3c6e71] flex-shrink-0" />
                    <span className="font-medium">{vendor.contact}</span>
                  </div>
                )}

                {vendor.city && (
                  <div className="flex items-start gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                    <FiMapPin className="w-5 h-5 text-[#3c6e71] flex-shrink-0 mt-1" />
                    <span className="font-medium">{vendor.address}, {vendor.city}, {vendor.state}</span>
                  </div>
                )}

                {vendor.years_experience && (
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-[#3c6e71] flex-shrink-0" />
                    <span className="font-medium">{vendor.years_experience} Years Experience</span>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(40, 75, 99, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => packages.length > 0 && handleBookNow(packages[0])}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-xl hover:from-[#3c6e71] hover:to-[#284b63] transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <FiShoppingCart />
                Book Now
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Booking</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Package</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPackage.package_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-700">{selectedPackage.package_desc}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-3xl font-bold text-[#3c6e71]">₹{selectedPackage.amount}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    alert("Booking functionality will be implemented soon!");
                    setShowBookingModal(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all shadow-lg"
                >
                  Confirm Booking
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default VendorDetail;
