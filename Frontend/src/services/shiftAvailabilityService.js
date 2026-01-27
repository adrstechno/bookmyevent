import axios from 'axios';
import { VITE_API_BASE_URL } from '../utils/api';

const shiftAvailabilityService = {
  // Get available shifts for a vendor on a specific date
  getAvailableShifts: async (vendorId, eventDate) => {
    try {
      const response = await axios.get(
        `${VITE_API_BASE_URL}/shift-availability/available-shifts`,
        {
          params: { vendor_id: vendorId, event_date: eventDate },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching available shifts:', error);
      throw error;
    }
  },

  // Check if a specific shift is available
  checkShiftAvailability: async (vendorId, eventDate, shiftId) => {
    try {
      const response = await axios.get(
        `${VITE_API_BASE_URL}/shift-availability/check-shift`,
        {
          params: { vendor_id: vendorId, event_date: eventDate, shift_id: shiftId },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking shift availability:', error);
      throw error;
    }
  },

  // Get vendor availability calendar
  getVendorCalendar: async (vendorId, month, year) => {
    try {
      const response = await axios.get(
        `${VITE_API_BASE_URL}/shift-availability/calendar`,
        {
          params: { vendor_id: vendorId, month, year },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor calendar:', error);
      throw error;
    }
  },
};

export default shiftAvailabilityService;
