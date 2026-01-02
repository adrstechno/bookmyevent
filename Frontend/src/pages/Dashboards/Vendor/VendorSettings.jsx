import React, { useEffect, useState } from "react";
import axios from "axios";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import ChangePassword from "../../../components/ChangePassword";
import toast from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../../utils/api";

const VendorSettings = () => {
  const [profile, setProfile] = useState({
    business_name: "",
    service_category_id: "",
    description: "",
    years_experience: "",
    contact: "",
    address: "",
    city: "",
    state: "",
    event_profiles_url: "",
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // ✅ Fetch all service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`, {
          withCredentials: true,
        });
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({
            id: item.category_id || item.service_category_id,
            name: item.category_name || item.service_name,
          }));
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to load service categories.");
      }
    };
    
    fetchCategories().catch(console.error);
  }, []);

  // ✅ Fetch vendor profile or determine if new profile needed
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`, {
          withCredentials: true,
        });

        if (res.status === 200 && res.data) {
          const vendor = res.data.vendor || res.data;
          setIsNewProfile(false);
          
          setProfile({
            business_name: vendor.business_name || "",
            service_category_id: vendor.service_category_id || "",
            description: vendor.description || "",
            years_experience: vendor.years_experience?.toString() || "",
            contact: vendor.contact || "",
            address: vendor.address || "",
            city: vendor.city || "",
            state: vendor.state || "",
            event_profiles_url: vendor.event_profiles_url || "",
          });

          // Set profile image preview
          if (vendor.profile_url) {
            setPreview(vendor.profile_url);
          }
        }
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
        
        // If 404, it means vendor profile doesn't exist - show create form
        if (err.response?.status === 404 && err.response?.data?.message === "Vendor not found") {
          setIsNewProfile(true);
          toast("Please complete your vendor profile setup.", {
            icon: "ℹ️",
            duration: 4000,
          });
        } else if (err.response?.status === 401) {
          toast.error("Please log in again.");
          // Optionally redirect to login
        } else {
          toast.error("Failed to load profile details.");
        }
      }
    };

    fetchVendorProfile().catch(console.error);
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Image preview handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Form validation
  const validate = () => {
    const newErrors = {};

    if (!profile.business_name.trim())
      newErrors.business_name = "Business name is required.";
    if (!profile.service_category_id)
      newErrors.service_category_id = "Select a service category.";
    if (!profile.description.trim())
      newErrors.description = "Description is required.";
    if (
      !profile.years_experience.trim() ||
      isNaN(profile.years_experience) ||
      profile.years_experience <= 0
    )
      newErrors.years_experience = "Enter valid years of experience.";
    if (!/^[0-9]{10}$/.test(profile.contact))
      newErrors.contact = "Enter a valid 10-digit contact number.";
    if (!profile.address.trim()) newErrors.address = "Address is required.";
    if (!profile.city.trim()) newErrors.city = "City is required.";
    if (!profile.state.trim()) newErrors.state = "State is required.";
    if (
      profile.event_profiles_url &&
      !/^https?:\/\/.+/.test(profile.event_profiles_url)
    )
      newErrors.event_profiles_url =
        "Enter a valid URL (starting with http or https).";

    // For new profiles, require profile picture
    if (isNewProfile && !profileImage) {
      newErrors.profileImage = "Profile picture is required for new profiles.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit vendor profile (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      }

      let res;
      if (isNewProfile) {
        // Create new vendor profile
        res = await axios.post(
          `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      } else {
        // Update existing vendor profile
        res = await axios.post(
          `${VITE_API_BASE_URL}/Vendor/updateVendorProfile`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      }

      if (res.status === 200 || res.status === 201) {
        const message = isNewProfile 
          ? "Vendor profile created successfully!" 
          : "Profile updated successfully!";
        toast.success(res.data?.message || message);
        
        // If it was a new profile, update state
        if (isNewProfile) {
          setIsNewProfile(false);
        }
        
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Please upload a profile picture.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const action = isNewProfile ? "create" : "update";
        toast.error(`Failed to ${action} profile. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f9fafb] p-6">
      {/* Header */}
      <div className="bg-[#3c6e71] text-white shadow-lg rounded-xl px-6 py-4 mb-8 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">
          {isNewProfile ? "Complete Vendor Profile" : "Vendor Settings"}
        </h1>
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="h-8 w-8 text-white" />
          <span className="font-medium">Welcome, Vendor</span>
        </div>
      </div>

      {/* Status Banner for New Profile */}
      {isNewProfile && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 max-w-5xl mx-auto rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Profile Setup Required:</strong> Please complete your vendor profile to access all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-5xl mx-auto border-t-4 border-[#3c6e71]">
        <h2 className="text-xl font-semibold text-gray-800 mb-8 border-b pb-3">
          {isNewProfile ? "Create Your Vendor Profile" : "Update Profile Details"}
        </h2>

        {/* Profile Picture */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-6">
            <img
              src={preview || "https://via.placeholder.com/90"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#3c6e71] shadow-md"
            />
            <label className="cursor-pointer bg-[#3c6e71] text-white px-5 py-2 rounded-lg shadow-md hover:bg-[#284b63] transition">
              <div className="flex items-center space-x-2">
                <PhotoIcon className="h-5 w-5" />
                <span>{isNewProfile ? "Upload Photo" : "Change Photo"}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          {isNewProfile && (
            <p className="text-sm text-gray-600 mt-2 md:mt-0">
              Profile picture is required for new profiles
            </p>
          )}
        </div>

        {/* Profile Image Error */}
        {errors.profileImage && (
          <div className="mb-4">
            <p className="text-red-500 text-sm">{errors.profileImage}</p>
          </div>
        )}

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Business Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="business_name"
              value={profile.business_name}
              onChange={handleChange}
              placeholder="Enter business name"
              className={`w-full border ${
                errors.business_name ? "border-red-500" : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.business_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.business_name}
              </p>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Service Category
            </label>
            <select
              name="service_category_id"
              value={profile.service_category_id}
              onChange={handleChange}
              className={`w-full border ${
                errors.service_category_id
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            >
              <option value="">-- Select Service Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.service_category_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.service_category_id}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={profile.description}
              onChange={handleChange}
              rows="3"
              placeholder="Briefly describe your services"
              className={`w-full border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              name="years_experience"
              value={profile.years_experience}
              onChange={handleChange}
              placeholder="e.g. 5"
              className={`w-full border ${
                errors.years_experience ? "border-red-500" : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.years_experience && (
              <p className="text-red-500 text-sm mt-1">
                {errors.years_experience}
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contact"
              maxLength={10}
              value={profile.contact}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className={`w-full border ${
                errors.contact ? "border-red-500" : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              placeholder="Full address"
              className={`w-full border ${
                errors.address ? "border-red-500" : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={handleChange}
              placeholder="City name"
              className={`w-full border ${
                errors.city ? "border-red-500" : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={profile.state}
              onChange={handleChange}
              placeholder="State name"
              className={`w-full border ${
                errors.state ? "border-red-500" : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          {/* Social URL */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Event Profile / Social URL
            </label>
            <input
              type="text"
              name="event_profiles_url"
              value={profile.event_profiles_url}
              onChange={handleChange}
              placeholder="https://instagram.com/yourpage"
              className={`w-full border ${
                errors.event_profiles_url
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.event_profiles_url && (
              <p className="text-red-500 text-sm mt-1">
                {errors.event_profiles_url}
              </p>
            )}
          </div>

          {/* Buttons */}
         <div className="md:col-span-2 flex justify-around gap-3 mt-8">
  {!isNewProfile && (
    <button
      type="button"
      onClick={() => setShowPasswordModal(true)}
      className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition"
    >
      Change Password
    </button>
  )}
  
  {isNewProfile && <div></div>} {/* Spacer for new profiles */}

  <button
    type="submit"
    disabled={loading}
    className={`${
      loading ? "opacity-70 cursor-not-allowed" : ""
    } bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition`}
  >
    {loading 
      ? (isNewProfile ? "Creating Profile..." : "Saving Changes...") 
      : (isNewProfile ? "Create Profile" : "Save Changes")
    }
  </button>
</div>

        </form>
      </div>

      {/* Change Password Modal - Only for existing profiles */}
      {!isNewProfile && (
        <ChangePassword
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default VendorSettings;
