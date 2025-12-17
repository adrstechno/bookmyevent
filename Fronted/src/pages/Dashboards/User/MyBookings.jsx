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
} from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import bookingService, { BOOKING_STATUS } from "../../../services/bookingService";
import OTPVerificationModal from "../../../components/OTPVerificationModal";
import ReviewModal from "../../../components/ReviewModal";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedBookingForOTP, setSelectedBookingForOTP] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

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

  const handleVerifyOTP = (booking) => {
    setSelectedBookingForOTP(booking);
    setShowOTPModal(true);
  };

  const handleWriteReview = (booking) => {
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  const handleOTPSuccess = () => {
    setShowOTPModal(false);
    setSelectedBookingForOTP(null);
    fetchBookings();
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedBookingForReview(null);
    fetchBookings();
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "pending") return ["pending_vendor_response", "accepted_by_vendor_pending_admin", "pending"].includes(booking.status);
    if (filter === "confirmed") return ["booking_confirmed", "confirmed"].includes(booking.status);
    if (filter === "otp") return ["approved_by_admin_pending_otp", "otp_verification_in_progress"].includes(booking.status);
    if (filter === "completed") return ["completed", "awaiting_review"].includes(booking.status);
    if (filter === "cancelled") return booking.status?.includes("cancelled") || booking.status?.includes("rejected");
    return true;
  });

  const StatusBadge = ({ status }) => {
    const config = BOOKING_STATUS[status] || BOOKING_STATUS.pending;
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
        {config.icon === "key" && <FiShield />}
        {config.icon === "shield" && <FiShield />}
        {config.icon === "star" && <FiStar />}
        {config.icon === "x" && <FiX />}
        {config.label}
      </span>
    );
  };

  const canCancel = (status) => ["pending_vendor_response", "accepted_by_vendor_pending_admin", "pending"].includes(status);
  const needsOTPVerification = (status) => ["approved_by_admin_pending_otp", "otp_verification_in_progress"].includes(status);
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
            { key: "all", label: "All Bookings" },
            { key: "pending", label: "Pending" },
            { key: "otp", label: "OTP Required" },
            { key: "confirmed", label: "Confirmed" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === tab.key ? "bg-[#3c6e71] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
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
              <motion.div key={booking.booking_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking #{booking.booking_id}</h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {needsOTPVerification(booking.status) && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleVerifyOTP(booking)} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md">
                          <FiShield /> Verify OTP
                        </motion.button>
                      )}
                      {canWriteReview(booking.status) && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleWriteReview(booking)} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md">
                          <FiStar /> Write Review
                        </motion.button>
                      )}
                      {canCancel(booking.status) && (
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
                  {needsOTPVerification(booking.status) && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-3">
                        <FiAlertCircle className="text-purple-600 text-xl flex-shrink-0" />
                        <div><p className="font-semibold text-purple-800">OTP Verification Required</p><p className="text-sm text-purple-600">Your booking has been approved! Please verify with OTP to confirm.</p></div>
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

      <OTPVerificationModal isOpen={showOTPModal} onClose={() => { setShowOTPModal(false); setSelectedBookingForOTP(null); }} bookingId={selectedBookingForOTP?.booking_id} onSuccess={handleOTPSuccess} />
      <ReviewModal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setSelectedBookingForReview(null); }} bookingId={selectedBookingForReview?.booking_id} vendorName={selectedBookingForReview?.vendor_name || selectedBookingForReview?.business_name} onSuccess={handleReviewSuccess} />
    </div>
  );
};

export default MyBookings;
