import api from "./axiosConfig";

const otpService = {
  // Generate OTP for booking
  generateOTP: async (bookingId) => {
    const response = await api.post("/otp/generate", { booking_id: bookingId });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (bookingId, otpCode) => {
    const response = await api.post("/otp/verify", {
      booking_id: bookingId,
      otp_code: otpCode,
    });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (bookingId) => {
    const response = await api.post("/otp/resend", { booking_id: bookingId });
    return response.data;
  },

  // Get OTP status
  getOTPStatus: async (bookingId) => {
    const response = await api.get(`/otp/${bookingId}/status`);
    return response.data;
  },

  // Get remaining attempts
  getRemainingAttempts: async (bookingId) => {
    const response = await api.get(`/otp/${bookingId}/attempts`);
    return response.data;
  },
};

export default otpService;
