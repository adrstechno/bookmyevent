import api from "./axiosConfig";

const reviewService = {
  // Submit review for a booking
  submitReview: async (bookingId, reviewData) => {
    const response = await api.post(`/reviews/bookings/${bookingId}`, reviewData);
    return response.data;
  },

  // Get vendor reviews
  getVendorReviews: async (vendorId, params = {}) => {
    const { page = 1, limit = 10, rating_filter, sort_by, sort_order } = params;
    const queryParams = new URLSearchParams({ page, limit });
    
    if (rating_filter) queryParams.append("rating_filter", rating_filter);
    if (sort_by) queryParams.append("sort_by", sort_by);
    if (sort_order) queryParams.append("sort_order", sort_order);

    const response = await api.get(`/reviews/vendor/${vendorId}?${queryParams}`);
    return response.data;
  },

  // Get vendor rating statistics
  getVendorRatingStats: async (vendorId) => {
    const response = await api.get(`/reviews/vendor/${vendorId}/rating/average`);
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Get recent reviews (public)
  getRecentReviews: async () => {
    const response = await api.get("/reviews/recent");
    return response.data;
  },

  // Get top vendors (public)
  getTopVendors: async () => {
    const response = await api.get("/reviews/top-vendors");
    return response.data;
  },
};

export default reviewService;
