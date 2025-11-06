import React, { useState } from "react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import ChangePassword from "../../../components/ChangePassword"; // adjust path as needed

const VendorSettings = () => {
  const [profile, setProfile] = useState({
    business_name: "ABC Event Planners",
    contact: "9876543210",
    address: "MG Road, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    event_profiles_url: "https://instagram.com/abc_events",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  return (
    <div className="relative min-h-screen bg-[#f7f7f8] p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl px-6 py-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold text-[#284b63]">
          Account Settings
        </h1>
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="h-8 w-8 text-[#3c6e71]" />
          <span className="font-medium text-gray-700">Vendor Profile</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 max-w-5xl mx-auto border-t-4 border-[#3c6e71]">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Personal Information
        </h2>

        {/* Profile Picture */}
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={preview || "https://via.placeholder.com/90"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-[#3c6e71]"
          />
          <label className="cursor-pointer bg-[#3c6e71] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#284b63] transition">
            <div className="flex items-center space-x-2">
              <PhotoIcon className="h-5 w-5" />
              <span>Change Photo</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

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
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contact"
              value={profile.contact}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
            />
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
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={profile.state}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
            />
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
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition"
            >
              Change Password
            </button>

            <button
              type="submit"
              className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* 🔹 Change Password Modal */}
      <ChangePassword
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default VendorSettings;
