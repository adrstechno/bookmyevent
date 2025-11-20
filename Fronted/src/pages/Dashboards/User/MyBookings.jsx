import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPackage,
  FiEdit3,
  FiTrash2,
  FiX,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { MdOutlineAttachMoney } from "react-icons/md";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    event_address: "",
    event_date: "",
    event_time: "",
    special_requirement: "",
    status: "",
    admin_approval: "",
  });

  // Fetch user bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${VITE_API_BASE_URL}/Booking/GetBookingsByUserId`,
        { withCredentials: true }
      );

      console.log("Bookings response:", res.data);
      setBookings(res.data?.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error.response?.data?.error || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Open edit modal
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      event_address: booking.event_address || "",
      event_date: booking.event_date?.split("T")[0] || "",
      event_time: booking.event_time || "",
      special_requirement: booking.special_requirement || "",
      status: booking.status || "pending",
      admin_approval: booking.admin_approval || "pending",
    });
    setShowEditModal(true);
  };

  // Update booking
  const handleUpdate = async () => {
    if (!editForm.event_address) return toast.error("Event address is required");
    if (!editForm.event_date) return toast.error("Event date is required");
    if (!editForm.event_time) return toast.error("Event time is required");

    try {
      await axios.post(
        `${VITE_API_BASE_URL}/Booking/UpdateBooking`,
        {
          booking_id: selectedBooking.booking_id,
          ...editForm,
        },
        { withCredentials: true }
      );

      toast.success("Booking updated successfully!");
      setShowEditModal(false);
      fetchBookings();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update booking");
    }
  };

  // Delete booking
  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.get(
        `${VITE_API_BASE_URL}/Booking/DeleteBooking`,
        {
          params: { id: bookingId },
          withCredentials: true,
        }
      );

      toast.success("Booking cancelled successfully!");
      fetchBookings();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to cancel booking");
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FiClock, label: "Pending" },
      confirmed: { color: "bg-green-100 text-green-800", icon: FiCheck, label: "Confirmed" },
      cancelled: { color: "bg-red-100 text-red-800", icon: FiX, label: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800", icon: FiCheck, label: "Completed" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="text-base" />
        {config.label}
      </span>
    );
  };

  // Approval badge component
  const ApprovalBadge = ({ approval }) => {
    const approvalConfig = {
      pending: { color: "bg-orange-100 text-orange-800", icon: FiAlertCircle, label: "Pending Approval" },
      approved: { color: "bg-green-100 text-green-800", icon: FiCheck, label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", icon: FiX, label: "Rejected" },
    };

    const config = approvalConfig[approval] || approvalConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="text-base" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3c6e71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3c6e71] to-[#284b63] text-white shadow-lg py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-200 text-lg">Manage all your event bookings in one place</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <FiCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Yet</h2>
              <p className="text-gray-600 mb-6">Start exploring vendors and book your first event!</p>
              <button
                onClick={() => window.location.href = "/"}
                className="px-8 py-3 bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white rounded-lg font-semibold hover:scale-105 transition-all"
              >
                Browse Vendors
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.booking_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Booking #{booking.booking_id}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={booking.status} />
                        <ApprovalBadge approval={booking.admin_approval} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(booking)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-110"
                        title="Edit Booking"
                      >
                        <FiEdit3 className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleDelete(booking.booking_id)}
                        className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-110"
                        title="Cancel Booking"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="text-[#3c6e71] text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Event Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(booking.event_date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiClock className="text-[#3c6e71] text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Event Time</p>
                        <p className="font-semibold text-gray-800">{booking.event_time}</p>
                      </div>
                    </div>

                    {/* Package */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiPackage className="text-[#3c6e71] text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Package ID</p>
                        <p className="font-semibold text-gray-800">#{booking.package_id}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 md:col-span-2">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiMapPin className="text-[#3c6e71] text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Event Address</p>
                        <p className="font-semibold text-gray-800">{booking.event_address}</p>
                      </div>
                    </div>

                    {/* Vendor */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MdOutlineAttachMoney className="text-[#3c6e71] text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Vendor ID</p>
                        <p className="font-semibold text-gray-800">#{booking.vendor_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  {booking.special_requirement && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Special Requirements</p>
                      <p className="text-gray-700">{booking.special_requirement}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] p-6 text-white flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-2xl font-bold">Edit Booking</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-all"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Event Address */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FiMapPin className="text-[#3c6e71]" />
                    Event Address *
                  </label>
                  <textarea
                    value={editForm.event_address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, event_address: e.target.value })
                    }
                    placeholder="Enter complete event address"
                    rows="3"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none resize-none"
                  />
                </div>

                {/* Event Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <FiCalendar className="text-[#3c6e71]" />
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={editForm.event_date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, event_date: e.target.value })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <FiClock className="text-[#3c6e71]" />
                      Event Time *
                    </label>
                    <input
                      type="time"
                      value={editForm.event_time}
                      onChange={(e) =>
                        setEditForm({ ...editForm, event_time: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none"
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    value={editForm.special_requirement}
                    onChange={(e) =>
                      setEditForm({ ...editForm, special_requirement: e.target.value })
                    }
                    placeholder="Any special requests..."
                    rows="3"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 flex gap-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] hover:from-[#2f5b60] hover:to-[#3c6e71] text-white font-semibold rounded-lg shadow-lg transition-all hover:scale-105"
                >
                  Update Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;
