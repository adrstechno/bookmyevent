import axios from 'axios';
import { VITE_API_BASE_URL } from '../utils/api';

const adminService = {
  // Get admin dashboard KPIs
  getAdminKPIs: async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/admin/dashboard/kpis`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin KPIs:', error);
      throw error;
    }
  },

  // Get admin recent activities
  getAdminRecentActivities: async (limit = 10) => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/admin/dashboard/activities?limit=${limit}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin activities:', error);
      throw error;
    }
  },

  // Get admin analytics data
  getAdminAnalytics: async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/admin/dashboard/analytics`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      throw error;
    }
  }
};

export default adminService;