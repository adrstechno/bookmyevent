import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../../utils/api";

export default function MainServices() {
  const [activeTab, setActiveTab] = useState("services");
  const [services, setServices] = useState([]);
  const [subservices, setSubservices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSubserviceForm, setShowSubserviceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Subservice form state
  const [subserviceForm, setSubserviceForm] = useState({
    service_category_ids: [],
    subservice_name: "",
    description: "",
    icon_url: null,
    is_active: true,
  });
  const [iconPreview, setIconPreview] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchSubservices(selectedServiceId);
    }
  }, [selectedServiceId]);

  // Fetch all services
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`);
      setServices(response.data || []);
      if (response.data && response.data.length > 0 && !selectedServiceId) {
        setSelectedServiceId(response.data[0].category_id);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    }
  };

  // Fetch subservices by service category ID
  const fetchSubservices = async (serviceCategoryId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${VITE_API_BASE_URL}/Service/GetSubservicesByServiceCategoryId/${serviceCategoryId}`
      );
      setSubservices(response.data || []);
    } catch (error) {
      console.error("Error fetching subservices:", error);
      toast.error("Failed to load subservices");
    } finally {
      setLoading(false);
    }
  };

  // Handle subservice form input change
  const handleSubserviceChange = (e) => {
    const { name, value } = e.target;
    setSubserviceForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category selection (multi-select)
  const handleCategoryToggle = (categoryId) => {
    setSubserviceForm((prev) => {
      const ids = prev.service_category_ids.includes(categoryId)
        ? prev.service_category_ids.filter((id) => id !== categoryId)
        : [...prev.service_category_ids, categoryId];
      return { ...prev, service_category_ids: ids };
    });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubserviceForm((prev) => ({ ...prev, icon_url: file }));
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Toggle active status
  const handleToggle = () => {
    setSubserviceForm((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  // Reset subservice form
  const resetSubserviceForm = () => {
    setSubserviceForm({
      service_category_ids: [],
      subservice_name: "",
      description: "",
      icon_url: null,
      is_active: true,
    });
    setIconPreview(null);
    setShowSubserviceForm(false);
  };

  // Submit subservice form
  const handleSubserviceSubmit = async (e) => {
    e.preventDefault();

    if (subserviceForm.service_category_ids.length === 0) {
      toast.error("Please select at least one service category!");
      return;
    }

    if (!subserviceForm.subservice_name || !subserviceForm.description) {
      toast.error("Please fill all required fields!");
      return;
    }

    if (!subserviceForm.icon_url) {
      toast.error("Please upload a subservice icon!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Send as JSON string array - backend expects this format
      formData.append("service_category_ids", JSON.stringify(subserviceForm.service_category_ids));
      formData.append("subservice_name", subserviceForm.subservice_name);
      formData.append("description", subserviceForm.description);
      formData.append("icon_url", subserviceForm.icon_url);
      formData.append("is_active", subserviceForm.is_active ? 1 : 0);

      console.log('📤 Sending subservice data:');
      console.log('- service_category_ids:', subserviceForm.service_category_ids);
      console.log('- subservice_name:', subserviceForm.subservice_name);
      console.log('- description:', subserviceForm.description);
      console.log('- is_active:', subserviceForm.is_active ? 1 : 0);

      await axios.post(`${VITE_API_BASE_URL}/Service/CreateSubservice`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Subservice created successfully!");
      resetSubserviceForm();
      if (selectedServiceId) {
        fetchSubservices(selectedServiceId);
      }
    } catch (error) {
      console.error("Error creating subservice:", error);
      toast.error(error.response?.data?.error || "Failed to create subservice");
    } finally {
      setLoading(false);
    }
  };

  // Filter subservices based on search
  const filteredSubservices = subservices.filter(
    (sub) =>
      sub.subservice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-[#f9fafb] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-[#3c6e71]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Service & Subservice Management
                </h1>
                <p className="text-gray-600">Manage your services and their subservices</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("services")}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === "services"
                    ? "text-[#3c6e71] border-b-2 border-[#3c6e71]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Services Overview
              </button>
              <button
                onClick={() => setActiveTab("subservices")}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === "subservices"
                    ? "text-[#3c6e71] border-b-2 border-[#3c6e71]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Subservices
              </button>
            </div>
          </div>

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#3c6e71]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">All Services</h2>
                <button
                  onClick={fetchServices}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div
                    key={service.category_id}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedServiceId(service.category_id);
                      setActiveTab("subservices");
                    }}
                  >
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={service.icon_url}
                        alt={service.category_name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {service.category_name}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {service.description}
                      </p>
                      <span
                        className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                          service.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subservices Tab */}
          {activeTab === "subservices" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subservice Form */}
              {showSubserviceForm && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#3c6e71]">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Create Subservice
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Add a new subservice to selected categories
                      </p>
                    </div>

                    <form onSubmit={handleSubserviceSubmit} className="space-y-5">
                      {/* Service Categories Selection */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Select Service Categories *
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                          {services.map((service) => (
                            <label
                              key={service.category_id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={subserviceForm.service_category_ids.includes(
                                  service.category_id
                                )}
                                onChange={() => handleCategoryToggle(service.category_id)}
                                className="w-4 h-4 text-[#3c6e71] focus:ring-[#3c6e71] rounded"
                              />
                              <img
                                src={service.icon_url}
                                alt={service.category_name}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {service.category_name}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {subserviceForm.service_category_ids.length} categories
                        </p>
                      </div>

                      {/* Subservice Name */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Subservice Name *
                        </label>
                        <input
                          type="text"
                          name="subservice_name"
                          value={subserviceForm.subservice_name}
                          onChange={handleSubserviceChange}
                          placeholder="Enter subservice name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={subserviceForm.description}
                          onChange={handleSubserviceChange}
                          rows="3"
                          placeholder="Describe the subservice..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                          required
                        ></textarea>
                      </div>

                      {/* Upload Icon */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Subservice Icon *
                        </label>
                        <label className="flex items-center justify-center w-full cursor-pointer border-2 border-dashed border-[#3c6e71] rounded-xl py-4 hover:bg-[#f0f4f5] transition">
                          <div className="flex flex-col items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="#3c6e71"
                              className="w-10 h-10 mb-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span className="text-[#3c6e71] font-medium">
                              {subserviceForm.icon_url ? "Change Icon" : "Upload Icon"}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>

                        {iconPreview && (
                          <div className="flex justify-center mt-4">
                            <img
                              src={iconPreview}
                              alt="Preview"
                              className="w-24 h-24 object-cover rounded-lg border border-gray-300 shadow-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Toggle */}
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={handleToggle}
                          className={`w-14 h-8 rounded-full transition-all ${
                            subserviceForm.is_active ? "bg-[#3c6e71]" : "bg-gray-300"
                          } relative`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                              subserviceForm.is_active ? "translate-x-6" : ""
                            }`}
                          ></span>
                        </button>
                        <span className="font-medium text-gray-700">
                          {subserviceForm.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`flex-1 py-2.5 rounded-lg text-white font-semibold shadow-md transition ${
                            loading
                              ? "bg-[#3c6e71] opacity-70 cursor-not-allowed"
                              : "bg-[#3c6e71] hover:bg-[#284b63]"
                          }`}
                        >
                          {loading ? "Creating..." : "Create Subservice"}
                        </button>
                        <button
                          type="button"
                          onClick={resetSubserviceForm}
                          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Subservices List */}
              <div className={showSubserviceForm ? "lg:col-span-2" : "lg:col-span-3"}>
                <div className="bg-white rounded-2xl shadow-lg border-t-4 border-[#3c6e71]">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Subservices</h3>
                        <p className="text-gray-600 text-sm">
                          {selectedServiceId
                            ? `Showing subservices for: ${
                                services.find((s) => s.category_id === selectedServiceId)
                                  ?.category_name || "Selected Service"
                              }`
                            : "Select a service to view subservices"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowSubserviceForm(!showSubserviceForm)}
                          className="bg-[#3c6e71] hover:bg-[#284b63] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          {showSubserviceForm ? "Hide Form" : "Add Subservice"}
                        </button>
                      </div>
                    </div>

                    {/* Service Selector */}
                    <div className="mt-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Filter by Service Category
                      </label>
                      <select
                        value={selectedServiceId || ""}
                        onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                        className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                      >
                        <option value="">All Services</option>
                        {services.map((service) => (
                          <option key={service.category_id} value={service.category_id}>
                            {service.category_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search */}
                    <div className="mt-4 relative">
                      <input
                        type="text"
                        placeholder="Search subservices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6e71] focus:outline-none w-full md:w-64"
                      />
                      <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Subservices Grid */}
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading subservices...</p>
                      </div>
                    ) : filteredSubservices.length === 0 ? (
                      <div className="text-center py-12">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No subservices found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm
                            ? "Try adjusting your search terms"
                            : selectedServiceId
                            ? "No subservices for this service yet"
                            : "Select a service to view its subservices"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredSubservices.map((subservice) => (
                          <div
                            key={subservice.subservice_id}
                            className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-center mb-4">
                              <img
                                src={subservice.icon_url}
                                alt={subservice.subservice_name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                              />
                            </div>
                            <div className="text-center">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                {subservice.subservice_name}
                              </h4>
                              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                {subservice.description}
                              </p>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  subservice.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {subservice.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
