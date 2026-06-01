import api from "./axiosConfig";

const subscriptionService = {
  // Create subscription order
  createSubscriptionOrder: async () => {
    const response = await api.post("/subscription/create-order");
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post("/subscription/verify-payment", paymentData);
    return response.data;
  },

  // Get subscription status
  getSubscriptionStatus: async () => {
    const response = await api.get("/subscription/status");
    return response.data;
  },

  // Get computed subscription/trial analytics for vendor dashboard
  getEnhancedSubscriptionStatus: async () => {
    const response = await api.get("/subscription/enhanced-status");
    return response.data;
  },

  // Get all subscriptions (Admin only)
  getAllSubscriptions: async () => {
    const response = await api.get("/subscription/all");
    return response.data;
  },
};

export default subscriptionService;
