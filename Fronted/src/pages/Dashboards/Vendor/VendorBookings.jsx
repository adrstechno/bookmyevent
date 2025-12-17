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
} from "react-icons/fi";
import bookingService, { BOOKING_STATUS } from "../../../services/bookingService";
import toast from "react-hot-toast";

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");

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
      // Don't redirect on error, just show message
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

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "pending") return booking.status === "pending_vendor_response";
    if (filter === "accepted") return ["accepted_by_vendor_pending_admin", "approved_by_admin_pending_otp", "otp_verification_in_progress"].includes(booking.status);
    if (filter === "confirmed") return ["booking_confirmed", "confirmed"].includes(booking.status);
    if (filter === "completed") return ["completed", "awaiting_review"].includes(booking.status);
    if (filter === "cancelled") return booking.status?.includes("cancelled") || booking.status?.includes("rejected");
    return true;
  });

  const StatusBadge = ({ status }) => {
    const config = BOOKING_STATUS[status] || BOOKING_STATUS.pending;
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

  const canAcceptReject = (status) => status === "pending_vendor_response";
  const canCancel = (status) => ["accepted_by_vendor_pending_admin", "approved_by_admin_pending_otp"].includes(status);

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
          { key: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending_vendor_response").length },
          { key: "accepted", label: "Accepted", count: bookings.filter(b => ["accepted_by_vendor_pending_admin", "approved_by_admin_pending_otp", "otp_verification_in_progress"].includes(b.status)).length },
          { key: "confirmed", label: "Confirmed", count: bookings.filter(b => ["booking_confirmed", "confirmed"].includes(b.status)).length },
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
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
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
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-l-4 border-[#3c6e71]"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">Booking #{booking.booking_id}</h3>
                      <StatusBadge status={booking.status} />
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
                    {canCancel(booking.status) && (
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
                      <p className="font-semibold text-gray-800">{booking.user_name || booking.customer_name || "Customer"}</p>
                      {booking.user_email && <p className="text-xs text-gray-500">{booking.user_email}</p>}
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
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
