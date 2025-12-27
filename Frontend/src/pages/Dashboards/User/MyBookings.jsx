import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPackage,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiShield,
  FiStar,
  FiUser,
  FiRefreshCw,
  FiKey,
  FiCopy,
} from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import bookingService, { BOOKING_STATUS } from "../../../services/bookingService";
import otpService from "../../../services/otpService";
import ReviewModal from "../../../components/ReviewModal";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  
  // OTP display state
  const [otpData, setOtpData] = useState({}); // { bookingId: { otp, expiresAt, status } }
  const [loadingOTP, setLoadingOTP] = useState({});

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings();
      setBookings(response.data?.bookings || response.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      // Don't redirect on error, just show message
      const message = error.response?.data?.message || error.response?.data?.error || "Failed to load bookings";
      toast.error(message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully!");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleWriteReview = (booking) => {
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedBookingForReview(null);
    fetchBookings();
  };

  // Fetch OTP status for approved bookings
  const fetchOTPStatus = async (bookingId) => {
    try {
      setLoadingOTP(prev => ({ ...prev, [bookingId]: true }));
      const response = await otpService.getOTPStatus(bookingId);
      if (response.success && response.data) {
        setOtpData(prev => ({
          ...prev,
          [bookingId]: response.data.otp_status
        }));
      }
    } catch (error) {
      console.log("Could not fetch OTP status for booking", bookingId);
    } finally {
      setLoadingOTP(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Copy OTP to clipboard
  const copyOTP = (otp) => {
    navigator.clipboard.writeText(otp);
    toast.success("OTP copied to clipboard!");
  };

  // Check if booking needs OTP display (admin approved, waiting for vendor verification)
  const needsOTPDisplay = (booking) => {
    return booking.status === "confirmed" && booking.admin_approval === "approved";
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "pending") return booking.status === "pending" || (booking.status === "confirmed" && booking.admin_approval === "pending");
    if (filter === "otp") return booking.status === "confirmed" && booking.admin_approval === "approved";
    if (filter === "completed") return ["completed", "awaiting_review"].includes(booking.status);
    if (filter === "cancelled") return booking.status?.includes("cancelled") || booking.status?.includes("rejected");
    return true;
  });

  const StatusBadge = ({ status, adminApproval }) => {
    let config = BOOKING_STATUS[status] || BOOKING_STATUS.pending;
    
    // Custom status based on both status and admin_approval
    if (status === "pending") {
      config = { label: "Pending Vendor Response", color: "yellow", icon: "clock" };
    } else if (status === "confirmed" && adminApproval === "pending") {
      config = { label: "Awaiting Admin Approval", color: "blue", icon: "clock" };
    } else if (status === "confirmed" && adminApproval === "approved") {
      config = { label: "Share OTP with Vendor", color: "purple", icon: "key" };
    }
    
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      green: "bg-green-100 text-green-800 border-green-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${colorClasses[config.color]}`}>
        {config.icon === "clock" && <FiClock />}
        {config.icon === "check" && <FiCheck />}
        {config.icon === "key" && <FiKey />}
        {config.icon === "shield" && <FiShield />}
        {config.icon === "star" && <FiStar />}
        {config.icon === "x" && <FiX />}
        {config.label}
      </span>
    );
  };

  const canCancel = (booking) => booking.status === "pending" || (booking.status === "confirmed" && booking.admin_approval === "pending");
  const canWriteReview = (status) => status === "awaiting_review";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3c6e71] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-[#3c6e71] to-[#284b63] text-white shadow-lg py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-200 text-lg">Track and manage all your event bookings</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All Bookings", count: bookings.length },
            { key: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending" || (b.status === "confirmed" && b.admin_approval === "pending")).length },
            { key: "otp", label: "Share OTP", count: bookings.filter(b => b.status === "confirmed" && b.admin_approval === "approved").length },
            { key: "completed", label: "Completed", count: bookings.filter(b => ["completed", "awaiting_review"].includes(b.status)).length },
            { key: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status?.includes("cancelled") || b.status?.includes("rejected")).length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                filter === tab.key ? "bg-[#3c6e71] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? "bg-white/20" : "bg-gray-100"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <button onClick={fetchBookings} className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-[#3c6e71] hover:bg-gray-100 border border-gray-200 flex items-center gap-1">
            <FiRefreshCw className="text-sm" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        {filteredBookings.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <FiCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
              <p className="text-gray-600 mb-6">{filter === "all" ? "Start exploring vendors and book your first event!" : `No ${filter} bookings found.`}</p>
              <button onClick={() => (window.location.href = "/")} className="px-8 py-3 bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white rounded-lg font-semibold hover:scale-105 transition-all">
                Browse Vendors
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking, index) => (
              <motion.div key={booking.booking_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 ${needsOTPDisplay(booking) ? "border-l-4 border-l-purple-500" : ""}`}>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking #{booking.booking_id}</h3>
                      <StatusBadge status={booking.status} adminApproval={booking.admin_approval} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canWriteReview(booking.status) && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleWriteReview(booking)} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md">
                          <FiStar /> Write Review
                        </motion.button>
                      )}
                      {canCancel(booking) && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleCancel(booking.booking_id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-100">
                          <MdOutlineCancel /> Cancel
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {booking.vendor_name && (
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center"><FiUser className="text-[#3c6e71] text-xl" /></div>
                        <div><p className="text-sm text-gray-500 mb-1">Vendor</p><p className="font-semibold text-gray-800">{booking.vendor_name || booking.business_name}</p></div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center"><FiCalendar className="text-[#3c6e71] text-xl" /></div>
                      <div><p className="text-sm text-gray-500 mb-1">Event Date</p><p className="font-semibold text-gray-800">{new Date(booking.event_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center"><FiClock className="text-[#3c6e71] text-xl" /></div>
                      <div><p className="text-sm text-gray-500 mb-1">Event Time</p><p className="font-semibold text-gray-800">{booking.event_time}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center"><FiPackage className="text-[#3c6e71] text-xl" /></div>
                      <div><p className="text-sm text-gray-500 mb-1">Package</p><p className="font-semibold text-gray-800">{booking.package_name || `Package #${booking.package_id}`}</p></div>
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center"><FiMapPin className="text-[#3c6e71] text-xl" /></div>
                      <div><p className="text-sm text-gray-500 mb-1">Event Address</p><p className="font-semibold text-gray-800">{booking.event_address}</p></div>
                    </div>
                  </div>
                  {booking.special_requirement && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Special Requirements</p>
                      <p className="text-gray-700">{booking.special_requirement}</p>
                    </div>
                  )}
                  
                  {/* OTP Display Section - Show when admin has approved */}
                  {needsOTPDisplay(booking) && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiKey className="text-purple-600 text-2xl" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-purple-800 text-lg mb-1">Your OTP Code</p>
                          <p className="text-sm text-purple-600 mb-3">
                            Share this code with the vendor to complete your booking. Check your notifications for the OTP.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-xs text-gray-500 mb-2">Your OTP has been sent to your registered email/phone</p>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-purple-700">
                                Check your <span className="font-semibold">Notifications</span> for the OTP code
                              </p>
                              <button
                                onClick={() => window.location.href = '/notifications'}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                              >
                                <FiShield /> View OTP
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-purple-500 mt-2">
                            ⚠️ Do not share this OTP with anyone except the vendor at the time of service
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Pending Status Alerts */}
                  {booking.status === "pending" && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <FiClock className="text-yellow-600 text-xl flex-shrink-0" />
                        <div><p className="font-semibold text-yellow-800">Waiting for Vendor</p><p className="text-sm text-yellow-600">The vendor will review and respond to your booking request.</p></div>
                      </div>
                    </div>
                  )}
                  
                  {booking.status === "confirmed" && booking.admin_approval === "pending" && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <FiClock className="text-blue-600 text-xl flex-shrink-0" />
                        <div><p className="font-semibold text-blue-800">Vendor Accepted - Awaiting Admin Approval</p><p className="text-sm text-blue-600">The vendor has accepted your booking. Waiting for admin approval.</p></div>
                      </div>
                    </div>
                  )}
                  
                  {canWriteReview(booking.status) && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <FiStar className="text-yellow-600 text-xl flex-shrink-0" />
                        <div><p className="font-semibold text-yellow-800">Share Your Experience</p><p className="text-sm text-yellow-600">Your event is complete! Please leave a review for the vendor.</p></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ReviewModal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setSelectedBookingForReview(null); }} bookingId={selectedBookingForReview?.booking_id} vendorName={selectedBookingForReview?.vendor_name || selectedBookingForReview?.business_name} onSuccess={handleReviewSuccess} />
    </div>
  );
};

export default MyBookings;
