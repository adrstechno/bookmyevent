// // // // import React, { useState } from "react";
// // // // import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
// // // // import ChangePassword from "../../../components/ChangePassword"; // adjust path as needed

// // // // const VendorSettings = () => {
// // // //   const [profile, setProfile] = useState({
// // // //     business_name: "ABC Event Planners",
// // // //     contact: "9876543210",
// // // //     address: "MG Road, Mumbai",
// // // //     city: "Mumbai",
// // // //     state: "Maharashtra",
// // // //     event_profiles_url: "https://instagram.com/abc_events",
// // // //   });

// // // //   const [profileImage, setProfileImage] = useState(null);
// // // //   const [preview, setPreview] = useState(null);
// // // //   const [showPasswordModal, setShowPasswordModal] = useState(false);

// // // //   const handleChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     setProfile((prev) => ({ ...prev, [name]: value }));
// // // //   };

// // // //   const handleImageChange = (e) => {
// // // //     const file = e.target.files[0];
// // // //     if (file) {
// // // //       setProfileImage(file);
// // // //       setPreview(URL.createObjectURL(file));
// // // //     }
// // // //   };

// // // //   const handleSubmit = (e) => {
// // // //     e.preventDefault();
// // // //     alert("Profile updated successfully!");
// // // //   };

// // // //   return (
// // // //     <div className="relative min-h-screen bg-[#f7f7f8] p-6">
// // // //       {/* Header */}
// // // //       <div className="bg-white shadow-md rounded-xl px-6 py-4 mb-6 flex justify-between items-center">
// // // //         <h1 className="text-xl md:text-2xl font-semibold text-[#284b63]">
// // // //           Account Settings
// // // //         </h1>
// // // //         <div className="flex items-center space-x-3">
// // // //           <UserCircleIcon className="h-8 w-8 text-[#3c6e71]" />
// // // //           <span className="font-medium text-gray-700">Vendor Profile</span>
// // // //         </div>
// // // //       </div>

// // // //       {/* Profile Section */}
// // // //       <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 max-w-5xl mx-auto border-t-4 border-[#3c6e71]">
// // // //         <h2 className="text-lg font-semibold text-gray-800 mb-6">
// // // //           Personal Information
// // // //         </h2>

// // // //         {/* Profile Picture */}
// // // //         <div className="flex items-center space-x-6 mb-6">
// // // //           <img
// // // //             src={preview || "https://via.placeholder.com/90"}
// // // //             alt="Profile"
// // // //             className="w-20 h-20 rounded-full object-cover border-2 border-[#3c6e71]"
// // // //           />
// // // //           <label className="cursor-pointer bg-[#3c6e71] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#284b63] transition">
// // // //             <div className="flex items-center space-x-2">
// // // //               <PhotoIcon className="h-5 w-5" />
// // // //               <span>Change Photo</span>
// // // //             </div>
// // // //             <input
// // // //               type="file"
// // // //               accept="image/*"
// // // //               className="hidden"
// // // //               onChange={handleImageChange}
// // // //             />
// // // //           </label>
// // // //         </div>

// // // //         {/* Profile Form */}
// // // //         <form
// // // //           onSubmit={handleSubmit}
// // // //           className="grid grid-cols-1 md:grid-cols-2 gap-6"
// // // //         >
// // // //           {/* Business Name */}
// // // //           <div>
// // // //             <label className="block text-gray-700 font-medium mb-1">
// // // //               Business Name
// // // //             </label>
// // // //             <input
// // // //               type="text"
// // // //               name="business_name"
// // // //               value={profile.business_name}
// // // //               onChange={handleChange}
// // // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // // //             />
// // // //           </div>

// // // //           {/* Contact */}
// // // //           <div>
// // // //             <label className="block text-gray-700 font-medium mb-1">
// // // //               Contact Number
// // // //             </label>
// // // //             <input
// // // //               type="text"
// // // //               name="contact"
// // // //               value={profile.contact}
// // // //               onChange={handleChange}
// // // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // // //             />
// // // //           </div>

// // // //           {/* Address */}
// // // //           <div className="md:col-span-2">
// // // //             <label className="block text-gray-700 font-medium mb-1">
// // // //               Address
// // // //             </label>
// // // //             <input
// // // //               type="text"
// // // //               name="address"
// // // //               value={profile.address}
// // // //               onChange={handleChange}
// // // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // // //             />
// // // //           </div>

// // // //           {/* City */}
// // // //           <div>
// // // //             <label className="block text-gray-700 font-medium mb-1">City</label>
// // // //             <input
// // // //               type="text"
// // // //               name="city"
// // // //               value={profile.city}
// // // //               onChange={handleChange}
// // // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // // //             />
// // // //           </div>

// // // //           {/* State */}
// // // //           <div>
// // // //             <label className="block text-gray-700 font-medium mb-1">State</label>
// // // //             <input
// // // //               type="text"
// // // //               name="state"
// // // //               value={profile.state}
// // // //               onChange={handleChange}
// // // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // // //             />
// // // //           </div>

// // // //           {/* Social URL */}
// // // //           <div className="md:col-span-2">
// // // //             <label className="block text-gray-700 font-medium mb-1">
// // // //               Event Profile / Social URL
// // // //             </label>
// // // //             <input
// // // //               type="text"
// // // //               name="event_profiles_url"
// // // //               value={profile.event_profiles_url}
// // // //               onChange={handleChange}
// // // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // // //             />
// // // //           </div>

// // // //           {/* Buttons */}
// // // //           <div className="md:col-span-2 flex justify-between mt-6">
// // // //             <button
// // // //               type="button"
// // // //               onClick={() => setShowPasswordModal(true)}
// // // //               className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition"
// // // //             >
// // // //               Change Password
// // // //             </button>

// // // //             <button
// // // //               type="submit"
// // // //               className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition"
// // // //             >
// // // //               Save Changes
// // // //             </button>
// // // //           </div>
// // // //         </form>
// // // //       </div>

// // // //       {/* 🔹 Change Password Modal */}
// // // //       <ChangePassword
// // // //         visible={showPasswordModal}
// // // //         onClose={() => setShowPasswordModal(false)}
// // // //       />
// // // //     </div>
// // // //   );
// // // // };

// // // // export default VendorSettings;


// // // import React, { useState } from "react";
// // // import axios from "axios";
// // // import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
// // // import ChangePassword from "../../../components/ChangePassword"; // already integrated
// // // import { toast } from "react-hot-toast"; // optional for better UX notifications
// // // import { VITE_API_BASE_URL } from "../../../utils/api";

// // // const VendorSettings = () => {
// // //   const [profile, setProfile] = useState({
// // //     business_name: "",
// // //     service_category_id: "",
// // //     description: "",
// // //     years_experience: "",
// // //     contact: "",
// // //     address: "",
// // //     city: "",
// // //     state: "",
// // //     event_profiles_url: "",
// // //   });

// // //   const [profileImage, setProfileImage] = useState(null);
// // //   const [preview, setPreview] = useState(null);
// // //   const [showPasswordModal, setShowPasswordModal] = useState(false);
// // //   const [loading, setLoading] = useState(false);

// // //   // ✅ Handle input change
// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setProfile((prev) => ({ ...prev, [name]: value }));
// // //   };

// // //   // ✅ Handle image preview
// // //   const handleImageChange = (e) => {
// // //     const file = e.target.files[0];
// // //     if (file) {
// // //       setProfileImage(file);
// // //       setPreview(URL.createObjectURL(file));
// // //     }
// // //   };

// // //   // ✅ Handle form submission (with file upload)
// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);

// // //     try {
// // //       const formData = new FormData();
// // //       formData.append("business_name", profile.business_name);
// // //       formData.append("service_category_id", profile.service_category_id);
// // //       formData.append("description", profile.description);
// // //       formData.append("years_experience", profile.years_experience);
// // //       formData.append("contact", profile.contact);
// // //       formData.append("address", profile.address);
// // //       formData.append("city", profile.city);
// // //       formData.append("state", profile.state);
// // //       formData.append("event_profiles_url", profile.event_profiles_url);

// // //       if (profileImage) {
// // //         formData.append("profilePicture", profileImage);
// // //       }

// // //       const res = await axios.post(
// // //         `${VITE_API_BASE_URL}/Vendor/updateVendorProfile`,
// // //         formData,
// // //         {
// // //           headers: {
// // //             "Content-Type": "multipart/form-data",
// // //           },
// // //           withCredentials: true, // if backend uses cookies for auth
// // //         }
// // //       );

// // //       if (res.status === 200) {
// // //         toast.success("Profile updated successfully!");
// // //       }
// // //     } catch (error) {
// // //       console.error("Error updating profile:", error);
// // //       toast.error("Failed to update profile. Please try again.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="relative min-h-screen bg-[#f7f7f8] p-6">
// // //       {/* Header */}
// // //       <div className="bg-white shadow-md rounded-xl px-6 py-4 mb-6 flex justify-between items-center">
// // //         <h1 className="text-xl md:text-2xl font-semibold text-[#284b63]">
// // //           Account Settings
// // //         </h1>
// // //         <div className="flex items-center space-x-3">
// // //           <UserCircleIcon className="h-8 w-8 text-[#3c6e71]" />
// // //           <span className="font-medium text-gray-700">Vendor Profile</span>
// // //         </div>
// // //       </div>

// // //       {/* Profile Section */}
// // //       <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 max-w-5xl mx-auto border-t-4 border-[#3c6e71]">
// // //         <h2 className="text-lg font-semibold text-gray-800 mb-6">
// // //           Personal Information
// // //         </h2>

// // //         {/* Profile Picture */}
// // //         <div className="flex items-center space-x-6 mb-6">
// // //           <img
// // //             src={preview || "https://via.placeholder.com/90"}
// // //             alt="Profile"
// // //             className="w-20 h-20 rounded-full object-cover border-2 border-[#3c6e71]"
// // //           />
// // //           <label className="cursor-pointer bg-[#3c6e71] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#284b63] transition">
// // //             <div className="flex items-center space-x-2">
// // //               <PhotoIcon className="h-5 w-5" />
// // //               <span>Change Photo</span>
// // //             </div>
// // //             <input
// // //               type="file"
// // //               accept="image/*"
// // //               className="hidden"
// // //               onChange={handleImageChange}
// // //             />
// // //           </label>
// // //         </div>

// // //         {/* Profile Form */}
// // //         <form
// // //           onSubmit={handleSubmit}
// // //           className="grid grid-cols-1 md:grid-cols-2 gap-6"
// // //         >
// // //           {/* Business Name */}
// // //           <div>
// // //             <label className="block text-gray-700 font-medium mb-1">
// // //               Business Name
// // //             </label>
// // //             <input
// // //               type="text"
// // //               name="business_name"
// // //               value={profile.business_name}
// // //               onChange={handleChange}
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* Service Category ID */}
// // //           <div>
// // //             <label className="block text-gray-700 font-medium mb-1">
// // //               Service Category ID
// // //             </label>
// // //             <input
// // //               type="text"
// // //               name="service_category_id"
// // //               value={profile.service_category_id}
// // //               onChange={handleChange}
// // //               placeholder="e.g. 1"
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* Description */}
// // //           <div className="md:col-span-2">
// // //             <label className="block text-gray-700 font-medium mb-1">
// // //               Description
// // //             </label>
// // //             <textarea
// // //               name="description"
// // //               value={profile.description}
// // //               onChange={handleChange}
// // //               rows="3"
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             ></textarea>
// // //           </div>

// // //           {/* Years of Experience */}
// // //           <div>
// // //             <label className="block text-gray-700 font-medium mb-1">
// // //               Years of Experience
// // //             </label>
// // //             <input
// // //               type="number"
// // //               name="years_experience"
// // //               value={profile.years_experience}
// // //               onChange={handleChange}
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* Contact */}
// // //           <div>
// // //             <label className="block text-gray-700 font-medium mb-1">
// // //               Contact Number
// // //             </label>
// // //             <input
// // //               type="text"
// // //               name="contact"
// // //               value={profile.contact}
// // //               onChange={handleChange}
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* Address */}
// // //           <div className="md:col-span-2">
// // //             <label className="block text-gray-700 font-medium mb-1">
// // //               Address
// // //             </label>
// // //             <input
// // //               type="text"
// // //               name="address"
// // //               value={profile.address}
// // //               onChange={handleChange}
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* City */}
// // //           <div>
// // //             <label className="block text-gray-700 font-medium mb-1">City</label>
// // //             <input
// // //               type="text"
// // //               name="city"
// // //               value={profile.city}
// // //               onChange={handleChange}
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* State */}
// // //           <div>
// // //             <label className="block text-gray-700 font-medium mb-1">State</label>
// // //             <input
// // //               type="text"
// // //               name="state"
// // //               value={profile.state}
// // //               onChange={handleChange}
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* Social URL */}
// // //           <div className="md:col-span-2">
// // //             <label className="block text-gray-700 font-medium mb-1">
// // //               Event Profile / Social URL
// // //             </label>
// // //             <input
// // //               type="text"
// // //               name="event_profiles_url"
// // //               value={profile.event_profiles_url}
// // //               onChange={handleChange}
// // //               className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
// // //             />
// // //           </div>

// // //           {/* Buttons */}
// // //           <div className="md:col-span-2 flex justify-between mt-6">
// // //             <button
// // //               type="button"
// // //               onClick={() => setShowPasswordModal(true)}
// // //               className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition"
// // //             >
// // //               Change Password
// // //             </button>

// // //             <button
// // //               type="submit"
// // //               disabled={loading}
// // //               className={`${
// // //                 loading ? "opacity-70 cursor-not-allowed" : ""
// // //               } bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-6 rounded-lg shadow-md transition`}
// // //             >
// // //               {loading ? "Saving..." : "Save Changes"}
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>

// // //       {/* Change Password Modal */}
// // //       <ChangePassword
// // //         visible={showPasswordModal}
// // //         onClose={() => setShowPasswordModal(false)}
// // //       />
// // //     </div>
// // //   );
// // // };

// // // export default VendorSettings;

// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
// // import ChangePassword from "../../../components/ChangePassword";
// // import { toast } from "react-hot-toast";

// // const VendorSettings = () => {
// //   const [profile, setProfile] = useState({
// //     business_name: "",
// //     service_category_id: "",
// //     description: "",
// //     years_experience: "",
// //     contact: "",
// //     address: "",
// //     city: "",
// //     state: "",
// //     event_profiles_url: "",
// //   });

// //   const [categories, setCategories] = useState([]);
// //   const [errors, setErrors] = useState({});
// //   const [profileImage, setProfileImage] = useState(null);
// //   const [preview, setPreview] = useState(null);
// //   const [showPasswordModal, setShowPasswordModal] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   // ✅ Fetch service categories from backend
// //   useEffect(() => {
// //     const fetchCategories = async () => {
// //       try {
// //         const res = await axios.get("http://localhost:3232/Vendor/getServiceCategories");
// //         setCategories(res.data || []);
// //       } catch (err) {
// //         console.error("Error fetching categories:", err);
// //       }
// //     };
// //     fetchCategories();
// //   }, []);

// //   // ✅ Handle input change
// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setProfile((prev) => ({ ...prev, [name]: value }));
// //     setErrors((prev) => ({ ...prev, [name]: "" }));
// //   };

// //   // ✅ Handle image preview
// //   const handleImageChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       setProfileImage(file);
// //       setPreview(URL.createObjectURL(file));
// //     }
// //   };

// //   // ✅ Validation
// //   const validate = () => {
// //     const newErrors = {};

// //     if (!profile.business_name.trim())
// //       newErrors.business_name = "Business name is required.";

// //     if (!profile.service_category_id)
// //       newErrors.service_category_id = "Select a service category.";

// //     if (!profile.description.trim())
// //       newErrors.description = "Description is required.";

// //     if (
// //       !profile.years_experience.trim() ||
// //       isNaN(profile.years_experience) ||
// //       profile.years_experience <= 0
// //     )
// //       newErrors.years_experience = "Enter valid years of experience.";

// //     if (!/^[0-9]{10}$/.test(profile.contact))
// //       newErrors.contact = "Enter a valid 10-digit contact number.";

// //     if (!profile.address.trim()) newErrors.address = "Address is required.";
// //     if (!profile.city.trim()) newErrors.city = "City is required.";
// //     if (!profile.state.trim()) newErrors.state = "State is required.";

// //     if (
// //       profile.event_profiles_url &&
// //       !/^https?:\/\/.+/.test(profile.event_profiles_url)
// //     )
// //       newErrors.event_profiles_url = "Enter a valid URL (starting with http or https).";

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   // ✅ Handle submit with API call
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!validate()) {
// //       toast.error("Please fix the highlighted errors.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const formData = new FormData();
// //       Object.entries(profile).forEach(([key, value]) => {
// //         formData.append(key, value);
// //       });

// //       if (profileImage) formData.append("profilePicture", profileImage);

// //       const res = await axios.post(
// //         "http://localhost:3232/Vendor/updateVendorProfile",
// //         formData,
// //         {
// //           headers: { "Content-Type": "multipart/form-data" },
// //           withCredentials: true,
// //         }
// //       );

// //       if (res.status === 200) toast.success("Profile updated successfully!");
// //     } catch (error) {
// //       console.error("Error updating profile:", error);
// //       toast.error("Failed to update profile. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="relative min-h-screen bg-[#f9fafb] p-6">
// //       {/* Header */}
// //       <div className="bg-[#3c6e71] text-white shadow-lg rounded-xl px-6 py-4 mb-8 flex justify-between items-center">
// //         <h1 className="text-xl md:text-2xl font-semibold">Vendor Settings</h1>
// //         <div className="flex items-center space-x-3">
// //           <UserCircleIcon className="h-8 w-8 text-white" />
// //           <span className="font-medium">Welcome, Vendor</span>
// //         </div>
// //       </div>

// //       {/* Profile Card */}
// //       <div className="bg-white shadow-xl rounded-2xl p-8 max-w-5xl mx-auto border-t-4 border-[#3c6e71]">
// //         <h2 className="text-xl font-semibold text-gray-800 mb-8 border-b pb-3">
// //           Update Profile Details
// //         </h2>

// //         {/* Profile Picture */}
// //         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
// //           <div className="flex items-center space-x-6">
// //             <img
// //               src={preview || "https://via.placeholder.com/90"}
// //               alt="Profile"
// //               className="w-24 h-24 rounded-full object-cover border-4 border-[#3c6e71] shadow-md"
// //             />
// //             <label className="cursor-pointer bg-[#3c6e71] text-white px-5 py-2 rounded-lg shadow-md hover:bg-[#284b63] transition">
// //               <div className="flex items-center space-x-2">
// //                 <PhotoIcon className="h-5 w-5" />
// //                 <span>Change Photo</span>
// //               </div>
// //               <input
// //                 type="file"
// //                 accept="image/*"
// //                 className="hidden"
// //                 onChange={handleImageChange}
// //               />
// //             </label>
// //           </div>
// //         </div>

// //         {/* Profile Form */}
// //         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //           {/* Business Name */}
// //           <div>
// //             <label className="block text-gray-700 font-medium mb-1">Business Name</label>
// //             <input
// //               type="text"
// //               name="business_name"
// //               value={profile.business_name}
// //               onChange={handleChange}
// //               placeholder="Enter business name"
// //               className={`w-full border ${
// //                 errors.business_name ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             />
// //             {errors.business_name && (
// //               <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>
// //             )}
// //           </div>

// //           {/* Category Dropdown */}
// //           <div>
// //             <label className="block text-gray-700 font-medium mb-1">Service Category</label>
// //             <select
// //               name="service_category_id"
// //               value={profile.service_category_id}
// //               onChange={handleChange}
// //               className={`w-full border ${
// //                 errors.service_category_id ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             >
// //               <option value="">-- Select Service Category --</option>
// //               {categories.map((cat) => (
// //                 <option key={cat.category_id} value={cat.category_id}>
// //                   {cat.category_name}
// //                 </option>
// //               ))}
// //             </select>
// //             {errors.service_category_id && (
// //               <p className="text-red-500 text-sm mt-1">{errors.service_category_id}</p>
// //             )}
// //           </div>

// //           {/* Description */}
// //           <div className="md:col-span-2">
// //             <label className="block text-gray-700 font-medium mb-1">Description</label>
// //             <textarea
// //               name="description"
// //               value={profile.description}
// //               onChange={handleChange}
// //               rows="3"
// //               placeholder="Briefly describe your services"
// //               className={`w-full border ${
// //                 errors.description ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             ></textarea>
// //             {errors.description && (
// //               <p className="text-red-500 text-sm mt-1">{errors.description}</p>
// //             )}
// //           </div>

// //           {/* Years of Experience */}
// //           <div>
// //             <label className="block text-gray-700 font-medium mb-1">
// //               Years of Experience
// //             </label>
// //             <input
// //               type="number"
// //               name="years_experience"
// //               value={profile.years_experience}
// //               onChange={handleChange}
// //               placeholder="e.g. 5"
// //               className={`w-full border ${
// //                 errors.years_experience ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             />
// //             {errors.years_experience && (
// //               <p className="text-red-500 text-sm mt-1">{errors.years_experience}</p>
// //             )}
// //           </div>

// //           {/* Contact */}
// //           <div>
// //             <label className="block text-gray-700 font-medium mb-1">Contact Number</label>
// //             <input
// //               type="text"
// //               name="contact"
// //               value={profile.contact}
// //               onChange={handleChange}
// //               placeholder="10-digit mobile number"
// //               className={`w-full border ${
// //                 errors.contact ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             />
// //             {errors.contact && (
// //               <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
// //             )}
// //           </div>

// //           {/* Address */}
// //           <div className="md:col-span-2">
// //             <label className="block text-gray-700 font-medium mb-1">Address</label>
// //             <input
// //               type="text"
// //               name="address"
// //               value={profile.address}
// //               onChange={handleChange}
// //               placeholder="Full address"
// //               className={`w-full border ${
// //                 errors.address ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             />
// //             {errors.address && (
// //               <p className="text-red-500 text-sm mt-1">{errors.address}</p>
// //             )}
// //           </div>

// //           {/* City */}
// //           <div>
// //             <label className="block text-gray-700 font-medium mb-1">City</label>
// //             <input
// //               type="text"
// //               name="city"
// //               value={profile.city}
// //               onChange={handleChange}
// //               placeholder="City name"
// //               className={`w-full border ${
// //                 errors.city ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             />
// //             {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
// //           </div>

// //           {/* State */}
// //           <div>
// //             <label className="block text-gray-700 font-medium mb-1">State</label>
// //             <input
// //               type="text"
// //               name="state"
// //               value={profile.state}
// //               onChange={handleChange}
// //               placeholder="State name"
// //               className={`w-full border ${
// //                 errors.state ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             />
// //             {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
// //           </div>

// //           {/* Social URL */}
// //           <div className="md:col-span-2">
// //             <label className="block text-gray-700 font-medium mb-1">
// //               Event Profile / Social URL
// //             </label>
// //             <input
// //               type="text"
// //               name="event_profiles_url"
// //               value={profile.event_profiles_url}
// //               onChange={handleChange}
// //               placeholder="https://instagram.com/yourpage"
// //               className={`w-full border ${
// //                 errors.event_profiles_url ? "border-red-500" : "border-gray-300"
// //               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
// //             />
// //             {errors.event_profiles_url && (
// //               <p className="text-red-500 text-sm mt-1">{errors.event_profiles_url}</p>
// //             )}
// //           </div>

// //           {/* Buttons */}
// //           <div className="md:col-span-2 flex justify-between mt-8">
// //             <button
// //               type="button"
// //               onClick={() => setShowPasswordModal(true)}
// //               className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition"
// //             >
// //               Change Password
// //             </button>

// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className={`${
// //                 loading ? "opacity-70 cursor-not-allowed" : ""
// //               } bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition`}
// //             >
// //               {loading ? "Saving..." : "Save Changes"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>

// //       {/* Change Password Modal */}
// //       <ChangePassword
// //         visible={showPasswordModal}
// //         onClose={() => setShowPasswordModal(false)}
// //       />
// //     </div>
// //   );
// // };

// // export default VendorSettings;
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
// import ChangePassword from "../../../components/ChangePassword";
// import { toast } from "react-hot-toast";
// import { VITE_API_BASE_URL } from "../../../utils/api";

// const VendorSettings = () => {
//   const [profile, setProfile] = useState({
//     business_name: "",
//     service_category_id: "",
//     description: "",
//     years_experience: "",
//     contact: "",
//     address: "",
//     city: "",
//     state: "",
//     event_profiles_url: "",
//   });

//   const [categories, setCategories] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [profileImage, setProfileImage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch service categories only
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`, {
//           withCredentials: true,
//         });
//         setCategories(res.data || []);
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//         toast.error("Failed to load service categories.");
//       }
//     };
//     fetchCategories();
//   }, []);

//   // ✅ Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfile((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   // ✅ Image preview handler
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImage(file);
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   // ✅ Form validation
//   const validate = () => {
//     const newErrors = {};

//     if (!profile.business_name.trim())
//       newErrors.business_name = "Business name is required.";
//     if (!profile.service_category_id)
//       newErrors.service_category_id = "Select a service category.";
//     if (!profile.description.trim())
//       newErrors.description = "Description is required.";
//     if (
//       !profile.years_experience.trim() ||
//       isNaN(profile.years_experience) ||
//       profile.years_experience <= 0
//     )
//       newErrors.years_experience = "Enter valid years of experience.";
//     if (!/^[0-9]{10}$/.test(profile.contact))
//       newErrors.contact = "Enter a valid 10-digit contact number.";
//     if (!profile.address.trim()) newErrors.address = "Address is required.";
//     if (!profile.city.trim()) newErrors.city = "City is required.";
//     if (!profile.state.trim()) newErrors.state = "State is required.";
//     if (
//       profile.event_profiles_url &&
//       !/^https?:\/\/.+/.test(profile.event_profiles_url)
//     )
//       newErrors.event_profiles_url =
//         "Enter a valid URL (starting with http or https).";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ✅ Submit updated vendor profile (cookie-auth)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) {
//       toast.error("Please fix the highlighted errors.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       Object.entries(profile).forEach(([key, value]) => {
//         formData.append(key, value);
//       });
//       if (profileImage) formData.append("profilePicture", profileImage);

//       const res = await axios.post(
//         `${VITE_API_BASE_URL}/Vendor/updateVendorProfile`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           withCredentials: true,
//         }
//       );

//       if (res.status === 200) {

//         toast.success(res.data?.message || "Profile updated successfully!");
//         setTimeout(() => {
//           window.location.reload();
//         }, 1200);
//       } else {
//         toast.error("Unexpected server response.");
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       if (error.response?.status === 401) {
//         toast.error("Unauthorized. Please log in again.");
//       } else if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error("Failed to update profile. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-[#f9fafb] p-6">
//       {/* Header */}
//       <div className="bg-[#3c6e71] text-white shadow-lg rounded-xl px-6 py-4 mb-8 flex justify-between items-center">
//         <h1 className="text-xl md:text-2xl font-semibold">Vendor Settings</h1>
//         <div className="flex items-center space-x-3">
//           <UserCircleIcon className="h-8 w-8 text-white" />
//           <span className="font-medium">Welcome, Vendor</span>
//         </div>
//       </div>

//       {/* Profile Card */}
//       <div className="bg-white shadow-xl rounded-2xl p-8 max-w-5xl mx-auto border-t-4 border-[#3c6e71]">
//         <h2 className="text-xl font-semibold text-gray-800 mb-8 border-b pb-3">
//           Update Profile Details
//         </h2>

//         {/* Profile Picture */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
//           <div className="flex items-center space-x-6">
//             <img
//               src={preview || "https://via.placeholder.com/90"}
//               alt="Profile"
//               className="w-24 h-24 rounded-full object-cover border-4 border-[#3c6e71] shadow-md"
//             />
//             <label className="cursor-pointer bg-[#3c6e71] text-white px-5 py-2 rounded-lg shadow-md hover:bg-[#284b63] transition">
//               <div className="flex items-center space-x-2">
//                 <PhotoIcon className="h-5 w-5" />
//                 <span>Change Photo</span>
//               </div>
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleImageChange}
//               />
//             </label>
//           </div>
//         </div>

//         {/* Profile Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="grid grid-cols-1 md:grid-cols-2 gap-6"
//         >
//           {/* Business Name */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">
//               Business Name
//             </label>
//             <input
//               type="text"
//               name="business_name"
//               value={profile.business_name}
//               onChange={handleChange}
//               placeholder="Enter business name"
//               className={`w-full border ${
//                 errors.business_name ? "border-red-500" : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.business_name && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.business_name}
//               </p>
//             )}
//           </div>

//           {/* Category Dropdown */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">
//               Service Category
//             </label>
//             <select
//               name="service_category_id"
//               value={profile.service_category_id}
//               onChange={handleChange}
//               className={`w-full border ${
//                 errors.service_category_id
//                   ? "border-red-500"
//                   : "border-gray-300"
//               } rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             >
//               <option value="">-- Select Service Category --</option>
//               {categories.map((cat) => (
//                 <option
//                   key={cat.category_id || cat.service_id}
//                   value={cat.category_id || cat.service_id}
//                 >
//                   {cat.category_name || cat.service_name}
//                 </option>
//               ))}
//             </select>
//             {errors.service_category_id && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.service_category_id}
//               </p>
//             )}
//           </div>

//           {/* Description */}
//           <div className="md:col-span-2">
//             <label className="block text-gray-700 font-medium mb-1">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={profile.description}
//               onChange={handleChange}
//               rows="3"
//               placeholder="Briefly describe your services"
//               className={`w-full border ${
//                 errors.description ? "border-red-500" : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             ></textarea>
//             {errors.description && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.description}
//               </p>
//             )}
//           </div>

//           {/* Years of Experience */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">
//               Years of Experience
//             </label>
//             <input
//               type="number"
//               name="years_experience"
//               value={profile.years_experience}
//               onChange={handleChange}
//               placeholder="e.g. 5"
//               className={`w-full border ${
//                 errors.years_experience ? "border-red-500" : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.years_experience && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.years_experience}
//               </p>
//             )}
//           </div>

//           {/* Contact */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">
//               Contact Number
//             </label>
//             <input
//               type="text"
//               name="contact"
//               value={profile.contact}
//               onChange={handleChange}
//               placeholder="10-digit mobile number"
//               className={`w-full border ${
//                 errors.contact ? "border-red-500" : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.contact && (
//               <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
//             )}
//           </div>

//           {/* Address */}
//           <div className="md:col-span-2">
//             <label className="block text-gray-700 font-medium mb-1">
//               Address
//             </label>
//             <input
//               type="text"
//               name="address"
//               value={profile.address}
//               onChange={handleChange}
//               placeholder="Full address"
//               className={`w-full border ${
//                 errors.address ? "border-red-500" : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.address && (
//               <p className="text-red-500 text-sm mt-1">{errors.address}</p>
//             )}
//           </div>

//           {/* City */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">City</label>
//             <input
//               type="text"
//               name="city"
//               value={profile.city}
//               onChange={handleChange}
//               placeholder="City name"
//               className={`w-full border ${
//                 errors.city ? "border-red-500" : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.city && (
//               <p className="text-red-500 text-sm mt-1">{errors.city}</p>
//             )}
//           </div>

//           {/* State */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">State</label>
//             <input
//               type="text"
//               name="state"
//               value={profile.state}
//               onChange={handleChange}
//               placeholder="State name"
//               className={`w-full border ${
//                 errors.state ? "border-red-500" : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.state && (
//               <p className="text-red-500 text-sm mt-1">{errors.state}</p>
//             )}
//           </div>

//           {/* Social URL */}
//           <div className="md:col-span-2">
//             <label className="block text-gray-700 font-medium mb-1">
//               Event Profile / Social URL
//             </label>
//             <input
//               type="text"
//               name="event_profiles_url"
//               value={profile.event_profiles_url}
//               onChange={handleChange}
//               placeholder="https://instagram.com/yourpage"
//               className={`w-full border ${
//                 errors.event_profiles_url
//                   ? "border-red-500"
//                   : "border-gray-300"
//               } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.event_profiles_url && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.event_profiles_url}
//               </p>
//             )}
//           </div>

//           {/* Buttons */}
//           <div className="md:col-span-2 flex justify-between mt-8">
//             <button
//               type="button"
//               onClick={() => setShowPasswordModal(true)}
//               className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition"
//             >
//               Change Password
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className={`${
//                 loading ? "opacity-70 cursor-not-allowed" : ""
//               } bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition`}
//             >
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Change Password Modal */}
//       <ChangePassword
//         visible={showPasswordModal}
//         onClose={() => setShowPasswordModal(false)}
//       />
//     </div>
//   );
// };

// export default VendorSettings;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import ChangePassword from "../../../components/ChangePassword";
import { toast } from "react-hot-toast";
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

  // ✅ Fetch all service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`, {
          withCredentials: true,
        });
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to load service categories.");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch vendor details by ID (using cookie/session)
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`, {
          withCredentials: true,
        });

        if (res.status === 200 && res.data) {
          const vendor = res.data.vendor || res.data; // handle both structures
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

          // ✅ Set profile image preview
          if (vendor.profile_url) {
            setPreview(`${vendor.profile_url}`);
          }
        }
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
        toast.error("Failed to load profile details.");
      }
    };

    fetchVendorProfile();
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit updated vendor profile
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
      if (profileImage) formData.append("profilePicture", profileImage);

      const res = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/updateVendorProfile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        toast.success(res.data?.message || "Profile updated successfully!");
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f9fafb] p-6">
      {/* Header */}
      <div className="bg-[#3c6e71] text-white shadow-lg rounded-xl px-6 py-4 mb-8 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">Vendor Settings</h1>
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="h-8 w-8 text-white" />
          <span className="font-medium">Welcome, Vendor</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-5xl mx-auto border-t-4 border-[#3c6e71]">
        <h2 className="text-xl font-semibold text-gray-800 mb-8 border-b pb-3">
          Update Profile Details
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
                <option
                  key={cat.category_id || cat.service_id}
                  value={cat.category_id || cat.service_id}
                >
                  {cat.category_name || cat.service_name}
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
          <div className="md:col-span-2 flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition"
            >
              Change Password
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? "opacity-70 cursor-not-allowed" : ""
              } bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      <ChangePassword
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default VendorSettings;
