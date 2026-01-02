import axios from "axios";
import { VITE_API_BASE_URL } from "./api";

/**
 * Vendor Profile Utilities
 * Handles vendor profile CRUD operations and status checks
 */

// Configure axios defaults
axios.defaults.withCredentials = true;

/**
 * Check if vendor profile exists for the current user
 * @returns {Promise<{exists: boolean, profile: object|null}>}
 */
export const checkVendorProfile = async () => {
  try {
    const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`);
    return {
      exists: true,
      profile: res.data.vendor || res.data
    };
  } catch (error) {
    if (error.response?.status === 404 && error.response?.data?.message === "Vendor not found") {
      return {
        exists: false,
        profile: null
      };
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Create a new vendor profile
 * @param {FormData} profileData - Form data including profile picture
 * @returns {Promise<object>} API response
 */
export const createVendorProfile = async (profileData) => {
  const res = await axios.post(
    `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
    profileData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Update existing vendor profile
 * @param {FormData} profileData - Form data including profile picture
 * @returns {Promise<object>} API response
 */
export const updateVendorProfile = async (profileData) => {
  const res = await axios.post(
    `${VITE_API_BASE_URL}/Vendor/updateVendorProfile`,
    profileData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Get vendor event images
 * @returns {Promise<Array>} Array of event images
 */
export const getVendorEventImages = async () => {
  const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/GetvendorEventImages`);
  return res.data.eventImages || [];
};

/**
 * Handle vendor profile operations with proper error handling
 * @param {FormData} profileData 
 * @param {boolean} isNewProfile 
 * @returns {Promise<{success: boolean, message: string, data?: object}>}
 */
export const saveVendorProfile = async (profileData, isNewProfile = false) => {
  try {
    let result;
    if (isNewProfile) {
      result = await createVendorProfile(profileData);
    } else {
      result = await updateVendorProfile(profileData);
    }
    
    return {
      success: true,
      message: result.message || (isNewProfile ? "Profile created successfully!" : "Profile updated successfully!"),
      data: result
    };
  } catch (error) {
    let message = "An error occurred";
    
    if (error.response?.status === 401) {
      message = "Unauthorized. Please log in again.";
    } else if (error.response?.status === 400) {
      message = error.response.data.message || "Please upload a profile picture.";
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else {
      const action = isNewProfile ? "create" : "update";
      message = `Failed to ${action} profile. Please try again.`;
    }
    
    return {
      success: false,
      message,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Validate vendor profile data
 * @param {object} profile - Profile data object
 * @param {boolean} isNewProfile - Whether this is a new profile
 * @param {File|null} profileImage - Profile image file
 * @returns {object} Validation errors object
 */
export const validateVendorProfile = (profile, isNewProfile = false, profileImage = null) => {
  const errors = {};

  if (!profile.business_name?.trim()) {
    errors.business_name = "Business name is required.";
  }
  
  if (!profile.service_category_id) {
    errors.service_category_id = "Select a service category.";
  }
  
  if (!profile.description?.trim()) {
    errors.description = "Description is required.";
  }
  
  if (!profile.years_experience?.trim() || 
      isNaN(profile.years_experience) || 
      profile.years_experience <= 0) {
    errors.years_experience = "Enter valid years of experience.";
  }
  
  if (!/^[0-9]{10}$/.test(profile.contact)) {
    errors.contact = "Enter a valid 10-digit contact number.";
  }
  
  if (!profile.address?.trim()) {
    errors.address = "Address is required.";
  }
  
  if (!profile.city?.trim()) {
    errors.city = "City is required.";
  }
  
  if (!profile.state?.trim()) {
    errors.state = "State is required.";
  }
  
  if (profile.event_profiles_url && 
      !/^https?:\/\/.+/.test(profile.event_profiles_url)) {
    errors.event_profiles_url = "Enter a valid URL (starting with http or https).";
  }

  // For new profiles, require profile picture
  if (isNewProfile && !profileImage) {
    errors.profileImage = "Profile picture is required for new profiles.";
  }

  return errors;
};