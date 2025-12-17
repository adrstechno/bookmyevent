import api from "./axiosConfig";

const notificationService = {
  // Get user notifications with pagination and filters
  getNotifications: async (params = {}) => {
    const { page = 1, limit = 20, type, status, dateFrom, dateTo } = params;
    const queryParams = new URLSearchParams({ page, limit });
    
    if (type) queryParams.append("type", type);
    if (status) queryParams.append("status", status);
    if (dateFrom) queryParams.append("dateFrom", dateFrom);
    if (dateTo) queryParams.append("dateTo", dateTo);

    const response = await api.get(`/notification/?${queryParams}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get("/notification/count/unread");
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notification/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put("/notification/mark-all-read");
    return response.data;
  },

  // Archive notification
  archiveNotification: async (notificationId) => {
    const response = await api.put(`/notification/${notificationId}/archive`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notification/${notificationId}`);
    return response.data;
  },
};

export default notificationService;
