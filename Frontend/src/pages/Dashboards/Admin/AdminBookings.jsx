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
  FiBriefcase,
  FiSearch,
} from "react-icons/fi";
import bookingService, { BOOKING_STATUS } from "../../../services/bookingService";
import toast from "react-hot-toast";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings();
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

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve this booking? OTP will be generated for the user.")) return;
    try {
      setActionLoading(bookingId);
      await bookingService.approveBooking(bookingId);
      toast.success("Booking approved! OTP has been sent to the user.");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Are you sure you want to reject this booking?")) return;
    try {
      setActionLoading(bookingId);
      await bookingService.adminRejectBooking(bookingId);
      toast.success("Booking rejected.");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings
    .filter((booking) => {
      if (filter === "all") return true;
      if (filter === "pending_approval") return booking.status === "pending" && booking.admin_approval === "pending";
      if (filter === "approved") return booking.status === "confirmed" && booking.admin_approval === "approved";
      if (filter === "completed") return ["completed", "awaiting_review"].includes(booking.status);
      if (filter === "cancelled") return booking.status?.includes("cancelled") || booking.status?.includes("rejected");
      return true;
    })
    .filter((booking) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        booking.booking_id?.toString().includes(search) ||
        booking.user_name?.toLowerCase().includes(search) ||
        booking.vendor_name?.toLowerCase().includes(search) ||
        booking.business_name?.toLowerCase().includes(search) ||
        booking.event_address?.toLowerCase().includes(search)
      );
    });
 console.log(bookings,"d")
  const StatusBadge = ({ status, adminApproval }) => {
    let config = BOOKING_STATUS[status] || BOOKING_STATUS.pending;
    
    // Custom status based on both status and admin_approval
    if (status === "pending") {
      config = { label: "Pending Vendor Response", color: "yellow", icon: "clock" };
    } else if (status === "confirmed" && adminApproval === "pending") {
      config = { label: "Awaiting Admin Approval", color: "blue", icon: "clock" };
    } else if (status === "confirmed" && adminApproval === "approved") {
      config = { label: "Approved - OTP Sent", color: "green", icon: "check" };
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

  const canApproveReject = (booking) => booking.status === "confirmed" && booking.admin_approval === "pending";

  const stats = {
    total: bookings.length,
    pendingApproval: bookings.filter(b => b.status === "confirmed" && b.admin_approval === "pending").length,
    approved: bookings.filter(b => b.status === "confirmed" && b.admin_approval === "approved").length,
    completed: bookings.filter(b => ["completed", "awaiting_review"].includes(b.status)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3c6e71] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading all bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#284b63]">Booking Management</h1>
        <p className="text-gray-500">Review and approve vendor-accepted bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#284b63]">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-3xl font-bold text-[#284b63]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingApproval}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking ID, customer, vendor, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c6e71]/50 focus:border-[#3c6e71]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "pending_approval", label: "Pending Approval" },
            { key: "approved", label: "Approved" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === tab.key
                  ? "bg-[#284b63] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={fetchBookings}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[#3c6e71] hover:bg-gray-100 border border-gray-200 flex items-center gap-1"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <FiCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
          <p className="text-gray-600">{searchTerm ? "No bookings match your search." : `No ${filter === "all" ? "" : filter} bookings.`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.booking_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                canApproveReject(booking) ? "border-l-4 border-yellow-500" : "border-l-4 border-gray-200"
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">Booking #{booking.booking_id}</h3>
                      <StatusBadge status={booking.status} adminApproval={booking.admin_approval} />
                    </div>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {canApproveReject(booking) && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(booking.booking_id)}
                        disabled={actionLoading === booking.booking_id}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {actionLoading === booking.booking_id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiCheck />
                        )}
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(booking.booking_id)}
                        disabled={actionLoading === booking.booking_id}
                        className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        <FiX /> Reject
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Customer */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiUser className="text-[#3c6e71] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.user_name || "Customer"}</p>
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiBriefcase className="text-[#3c6e71] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.vendor_name || booking.business_name || "Vendor"}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiCalendar className="text-[#3c6e71] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Event Date</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {new Date(booking.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiClock className="text-[#3c6e71] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Event Time</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.event_time}</p>
                    </div>
                  </div>

                  {/* Package */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiPackage className="text-[#3c6e71] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Package</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.package_name || `#${booking.package_id}`}</p>
                      {booking.amount && <p className="text-xs text-[#f9a826] font-semibold">₹{parseFloat(booking.amount).toLocaleString()}</p>}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2 lg:col-span-3">
                    <FiMapPin className="text-[#3c6e71] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Event Address</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.event_address}</p>
                    </div>
                  </div>
                </div>

                {/* Pending Approval Alert */}
                {canApproveReject(booking) && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
                    <FiAlertCircle className="text-yellow-600 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-800">Admin Approval Required</p>
                      <p className="text-sm text-yellow-600">Vendor has accepted this booking. Please review and approve to generate OTP for the customer.</p>
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

export default AdminBookings;
