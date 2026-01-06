import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPackage,
  FiUser,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
  FiKey,
  FiShield,
} from "react-icons/fi";
import bookingService, { BOOKING_STATUS } from "../../../services/bookingService";
import otpService from "../../../services/otpService";
import toast from "react-hot-toast";

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  
  // OTP Modal State
  const [otpModal, setOtpModal] = useState({ open: false, booking: null });
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getVendorBookings();
      setBookings(response.data?.bookings || response.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      const message = error.response?.data?.message || error.response?.data?.error || "Failed to load bookings";
      toast.error(message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    if (!window.confirm("Accept this booking request?")) return;
    try {
      setActionLoading(bookingId);
      await bookingService.acceptBooking(bookingId);
      toast.success("Booking accepted! Awaiting admin approval.");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Are you sure you want to reject this booking?")) return;
    try {
      setActionLoading(bookingId);
      await bookingService.rejectBooking(bookingId);
      toast.success("Booking rejected.");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      setActionLoading(bookingId);
      await bookingService.cancelBooking(bookingId);
      toast.success("Booking cancelled.");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  // Open OTP verification modal
  const openOTPModal = async (booking) => {
    setOtpModal({ open: true, booking });
    setOtpCode("");
    setOtpError("");
    setAttemptsRemaining(3);
    
    // Check OTP status
    try {
      const response = await otpService.getRemainingAttempts(booking.booking_id);
      if (response.data) {
        setAttemptsRemaining(response.data.attempts_remaining || 3);
      }
    } catch (error) {
      console.log("Could not fetch OTP status");
    }
  };

  // Close OTP modal
  const closeOTPModal = () => {
    setOtpModal({ open: false, booking: null });
    setOtpCode("");
    setOtpError("");
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      
      const response = await otpService.verifyOTP(otpModal.booking.booking_id, otpCode);
      
      if (response.success) {
        toast.success("OTP verified successfully! Booking confirmed.");
        closeOTPModal();
        fetchBookings();
      } else {
        setOtpError(response.message || "Invalid OTP");
        if (response.data?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(response.data.attemptsRemaining);
        }
      }
    } catch (error) {
      const errorData = error.response?.data;
      setOtpError(errorData?.message || "Failed to verify OTP");
      if (errorData?.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(errorData.data.attemptsRemaining);
      }
      if (errorData?.data?.isLocked) {
        setOtpError("Too many failed attempts. OTP is locked for 15 minutes.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setOtpLoading(true);
      await otpService.resendOTP(otpModal.booking.booking_id);
      toast.success("New OTP sent to customer!");
      setOtpCode("");
      setOtpError("");
      setAttemptsRemaining(3);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "pending") return booking.status === "pending_vendor_response" || booking.status === "pending";
    if (filter === "accepted") return ["accepted_by_vendor_pending_admin", "confirmed"].includes(booking.status) && booking.admin_approval === "pending";
    if (filter === "approved") return booking.status === "confirmed" && booking.admin_approval === "approved";
    if (filter === "completed") return ["completed", "awaiting_review"].includes(booking.status);
    if (filter === "cancelled") return booking.status?.includes("cancelled") || booking.status?.includes("rejected");
    return true;
  });

  const StatusBadge = ({ status, adminApproval }) => {
    // Custom status display based on both status and admin_approval
    let config = BOOKING_STATUS[status] || BOOKING_STATUS.pending;
    
    if (status === "confirmed" && adminApproval === "pending") {
      config = { label: "Awaiting Admin Approval", color: "blue", icon: "clock" };
    } else if (status === "confirmed" && adminApproval === "approved") {
      config = { label: "OTP Verification Required", color: "purple", icon: "key" };
    }
    
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      green: "bg-green-100 text-green-800",
      teal: "bg-teal-100 text-teal-800",
      gray: "bg-gray-100 text-gray-800",
      red: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${colorClasses[config.color]}`}>
        {config.label}
      </span>
    );
  };

  // Vendor can accept/reject when status is pending
  const canAcceptReject = (status) => status === "pending_vendor_response" || status === "pending";
  // Vendor can verify OTP when admin has approved
  const canVerifyOTP = (booking) => booking.status === "confirmed" && booking.admin_approval === "approved";
  // Vendor can cancel after accepting but before completion
  const canCancel = (status, adminApproval) => 
    (status === "confirmed" && adminApproval === "pending") || 
    (status === "pending");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3c6e71] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#284b63]">Booking Requests</h1>
        <p className="text-gray-500">Manage incoming booking requests from customers</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All", count: bookings.length },
          { key: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending_vendor_response" || b.status === "pending").length },
          { key: "accepted", label: "Awaiting Admin", count: bookings.filter(b => b.status === "confirmed" && b.admin_approval === "pending").length },
          { key: "approved", label: "OTP Required", count: bookings.filter(b => b.status === "confirmed" && b.admin_approval === "approved").length },
          { key: "completed", label: "Completed", count: bookings.filter(b => ["completed", "awaiting_review"].includes(b.status)).length },
          { key: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status?.includes("cancelled") || b.status?.includes("rejected")).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              filter === tab.key
                ? "bg-[#3c6e71] text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? "bg-white/20" : "bg-gray-100"}`}>
              {tab.count}
            </span>
          </button>
        ))}
        <button
          onClick={fetchBookings}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[#3c6e71] hover:bg-gray-100 border border-gray-200 flex items-center gap-1 ml-auto"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center px-10 md:px-0 py-20 bg-white  rounded-2xl shadow-lg">
          <FiCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
          <p className="text-gray-600">{filter === "all" ? "You don't have any booking requests yet." : `No ${filter} bookings.`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.booking_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                canVerifyOTP(booking) ? "border-l-4 border-purple-500" : "border-l-4 border-[#3c6e71]"
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">Booking #{booking.booking_id}</h3>
                      <StatusBadge status={booking.status} adminApproval={booking.admin_approval} />
                    </div>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {canAcceptReject(booking.status) && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAccept(booking.booking_id)}
                          disabled={actionLoading === booking.booking_id}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {actionLoading === booking.booking_id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiCheck />
                          )}
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(booking.booking_id)}
                          disabled={actionLoading === booking.booking_id}
                          className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <FiX /> Reject
                        </motion.button>
                      </>
                    )}
                    
                    {/* OTP Verification Button */}
                    {canVerifyOTP(booking) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openOTPModal(booking)}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <FiKey /> Verify OTP
                      </motion.button>
                    )}
                    
                    {canCancel(booking.status, booking.admin_approval) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancel(booking.booking_id)}
                        disabled={actionLoading === booking.booking_id}
                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-100"
                      >
                        <FiX /> Cancel
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Customer & Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Customer */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                      <FiUser className="text-[#3c6e71]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-semibold text-gray-800">
                        {booking.first_name && booking.last_name 
                          ? `${booking.first_name} ${booking.last_name}` 
                          : booking.user_name || "Customer"}
                      </p>
                      {booking.email && <p className="text-xs text-gray-500">{booking.email}</p>}
                      {booking.phone && <p className="text-xs text-gray-500">{booking.phone}</p>}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                      <FiCalendar className="text-[#3c6e71]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Event Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(booking.event_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                      <FiClock className="text-[#3c6e71]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Event Time</p>
                      <p className="font-semibold text-gray-800">{booking.event_time}</p>
                    </div>
                  </div>

                  {/* Package */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                      <FiPackage className="text-[#3c6e71]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Package</p>
                      <p className="font-semibold text-gray-800">{booking.package_name || `Package #${booking.package_id}`}</p>
                      {booking.amount && <p className="text-sm text-[#f9a826] font-semibold">₹{parseFloat(booking.amount).toLocaleString()}</p>}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="w-10 h-10 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                      <FiMapPin className="text-[#3c6e71]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Event Address</p>
                      <p className="font-semibold text-gray-800">{booking.event_address}</p>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                {booking.special_requirement && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Special Requirements</p>
                    <p className="text-gray-700">{booking.special_requirement}</p>
                  </div>
                )}

                {/* Pending Action Alert */}
                {canAcceptReject(booking.status) && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
                    <FiAlertCircle className="text-yellow-600 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-800">Action Required</p>
                      <p className="text-sm text-yellow-600">Please accept or reject this booking request.</p>
                    </div>
                  </div>
                )}

                {/* OTP Verification Alert */}
                {canVerifyOTP(booking) && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-3">
                    <FiShield className="text-purple-600 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-purple-800">OTP Verification Required</p>
                      <p className="text-sm text-purple-600">Admin has approved this booking. Ask the customer for their OTP to complete the booking.</p>
                    </div>
                  </div>
                )}

                {/* Awaiting Admin Approval Alert */}
                {booking.status === "confirmed" && booking.admin_approval === "pending" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3">
                    <FiClock className="text-blue-600 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-800">Awaiting Admin Approval</p>
                      <p className="text-sm text-blue-600">You have accepted this booking. Waiting for admin to approve.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-purple-600 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
              <p className="text-gray-500 mt-2">
                Enter the 6-digit OTP provided by the customer to confirm booking #{otpModal.booking?.booking_id}
              </p>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-semibold text-gray-800">
                {otpModal.booking?.first_name && otpModal.booking?.last_name 
                  ? `${otpModal.booking.first_name} ${otpModal.booking.last_name}` 
                  : "Customer"}
              </p>
              <p className="text-sm text-gray-500 mt-2">Event Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(otpModal.booking?.event_date).toLocaleDateString("en-US", { 
                  weekday: "long", month: "long", day: "numeric", year: "numeric" 
                })}
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtpCode(value);
                  setOtpError("");
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-2">{otpError}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Attempts remaining: <span className={attemptsRemaining <= 1 ? "text-red-500 font-semibold" : ""}>{attemptsRemaining}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeOTPModal}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={otpLoading || otpCode.length !== 6}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheck /> Verify
                  </>
                )}
              </button>
            </div>

            {/* Resend OTP */}
            <div className="mt-4 text-center">
              <button
                onClick={handleResendOTP}
                disabled={otpLoading}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Resend OTP to customer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
