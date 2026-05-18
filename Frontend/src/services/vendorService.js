import api from './axiosConfig';

const vendorService = {
  // Get vendor KPIs
  getVendorKPIs: async () => {
    try {
      const response = await api.get('/Vendor/GetVendorKPIs');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor KPIs:', error);
      throw error;
    }
  },

  // Get vendor recent activities
  getVendorRecentActivities: async (limit = 5) => {
    try {
      const response = await api.get(`/Vendor/GetVendorRecentActivities?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor activities:', error);
      throw error;
    }
  },

  // Get vendor profile
  getVendorProfile: async () => {
    try {
      const response = await api.get('/Vendor/GetVendorProfile');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }
  }
};

export default vendorService;