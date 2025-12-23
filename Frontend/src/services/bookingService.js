import api from "./axiosConfig";

// Booking status labels for UI
// Note: The actual status depends on both 'status' and 'admin_approval' fields
// status: pending, confirmed, completed, cancelled
// admin_approval: pending, approved, rejected
export const BOOKING_STATUS = {
  // Legacy status values (for backward compatibility)
  pending_vendor_response: { label: "Pending Vendor Response", color: "yellow", icon: "clock" },
  accepted_by_vendor_pending_admin: { label: "Awaiting Admin Approval", color: "blue", icon: "clock" },
  approved_by_admin_pending_otp: { label: "Approved - OTP Required", color: "purple", icon: "key" },
  otp_verification_in_progress: { label: "OTP Verification In Progress", color: "orange", icon: "shield" },
  booking_confirmed: { label: "Booking Confirmed", color: "green", icon: "check" },
  
  // Current status values
  pending: { label: "Pending Vendor Response", color: "yellow", icon: "clock" },
  confirmed: { label: "Confirmed", color: "green", icon: "check" },
  awaiting_review: { label: "Awaiting Review", color: "teal", icon: "star" },
  completed: { label: "Completed", color: "gray", icon: "check-circle" },
  cancelled: { label: "Cancelled", color: "red", icon: "x" },
  cancelled_by_user: { label: "Cancelled by User", color: "red", icon: "x" },
  cancelled_by_vendor: { label: "Cancelled by Vendor", color: "red", icon: "x" },
  rejected_by_admin: { label: "Rejected by Admin", color: "red", icon: "x" },
};

const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post("/Booking/InsertBooking", bookingData);
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async () => {
    const response = await api.get("/Booking/GetBookingsByUserId");
    return response.data;
  },

  // Get vendor's bookings
  getVendorBookings: async () => {
    const response = await api.get("/Booking/GetBookingsByVendorId");
    return response.data;
  },

  // Get all bookings (admin only) - uses enhanced route
  getAllBookings: async () => {
    const response = await api.get("/bookings/admin/all-bookings");
    return response.data;
  },

  // Vendor: Accept booking - uses enhanced route
  acceptBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/accept`);
    return response.data;
  },

  // Vendor: Reject booking - uses enhanced route
  rejectBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/reject`);
    return response.data;
  },

  // Admin: Approve booking - uses enhanced route
  approveBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/approve`);
    return response.data;
  },

  // Admin: Reject booking - uses enhanced route
  adminRejectBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/admin-reject`);
    return response.data;
  },

  // Cancel booking (user/vendor) - uses enhanced route
  cancelBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },
};

export default bookingService;
