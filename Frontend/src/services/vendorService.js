import axios from 'axios';
import { VITE_API_BASE_URL } from '../utils/api';

const vendorService = {
  // Get vendor KPIs
  getVendorKPIs: async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/Vendor/GetVendorKPIs`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor KPIs:', error);
      throw error;
    }
  },

  // Get vendor recent activities
  getVendorRecentActivities: async (limit = 5) => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/Vendor/GetVendorRecentActivities?limit=${limit}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor activities:', error);
      throw error;
    }
  },

  // Get vendor profile
  getVendorProfile: async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/Vendor/GetVendorProfile`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }
  }
};

export default vendorService;