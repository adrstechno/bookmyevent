import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../../utils/api";

const AddServices = () => {
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
    serviceIcon: null,
    is_active: true,
  });

  const [services, setServices] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // ✅ Fetch all services
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`);
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    }
  };

  // ✅ Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((p) => ({ ...p, is_active: !p.is_active }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((p) => ({ ...p, serviceIcon: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      category_name: "",
      description: "",
      serviceIcon: null,
      is_active: true,
    });
    setPreview(null);
    setEditingService(null);
    setShowForm(false);
  };

  // ✅ Handle edit service
  const handleEdit = (service) => {
    setFormData({
      category_name: service.category_name,
      description: service.description,
      serviceIcon: null,
      is_active: service.is_active === 1,
    });
    setPreview(service.icon_url);
    setEditingService(service);
    setShowForm(true);
  };

  // ✅ Submit form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name || !formData.description) {
      toast.error("Please fill all required fields!");
      return;
    }

    if (!editingService && !formData.serviceIcon) {
      toast.error("Please upload a service icon!");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("category_name", formData.category_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("is_active", formData.is_active ? 1 : 0);

      if (formData.serviceIcon) {
        formDataToSend.append("serviceIcon", formData.serviceIcon);
      }

      let response;
      if (editingService) {
        // Update existing service
        response = await axios.put(
          `${VITE_API_BASE_URL}/Service/UpdateService/${editingService.category_id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Service updated successfully!");
      } else {
        // Create new service
        response = await axios.post(
          `${VITE_API_BASE_URL}/Service/InsertService`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Service added successfully!");
      }

      resetForm();
      fetchServices();
    } catch (err) {
      console.error("❌ Error saving service:", err);
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete service
  const handleDelete = async (serviceId) => {
    try {
      await axios.delete(`${VITE_API_BASE_URL}/Service/DeleteService/${serviceId}`);
      toast.success("Service deleted successfully!");
      setDeleteConfirm(null);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  // ✅ Filter services based on search
  const filteredServices = services.filter(service =>
    service.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Management</h1>
                <p className="text-gray-600">Manage your service categories and details</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-[#3c6e71] hover:bg-[#284b63] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showForm ? 'Hide Form' : 'Add Service'}
                </button>
                <button
                  onClick={fetchServices}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            {showForm && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#3c6e71]">
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="#3c6e71"
                        className="w-12 h-12"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {editingService ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {editingService ? 'Update service details' : 'Define your service category and details'} 🛠️
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category Name */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        name="category_name"
                        value={formData.category_name}
                        onChange={handleChange}
                        placeholder="Enter category name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe your service..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                        required
                      ></textarea>
                    </div>

                    {/* Upload Icon */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Service Icon {!editingService && <span className="text-red-500">*</span>}
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
                            {formData.serviceIcon ? "Change Icon" : editingService ? "Upload New Icon (Optional)" : "Upload Service Icon"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {preview && (
                        <div className="flex justify-center mt-4">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-300 shadow-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center space-x-3 mt-4">
                      <button
                        type="button"
                        onClick={handleToggle}
                        className={`w-14 h-8 rounded-full transition-all ${formData.is_active ? "bg-[#3c6e71]" : "bg-gray-300"
                          } relative`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-all ${formData.is_active ? "translate-x-6" : ""
                            }`}
                        ></span>
                      </button>
                      <span className="font-medium text-gray-700">
                        {formData.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 py-2.5 rounded-lg text-white font-semibold shadow-md transition ${loading
                          ? "bg-[#3c6e71] opacity-70 cursor-not-allowed"
                          : "bg-[#3c6e71] hover:bg-[#284b63]"
                          }`}
                      >
                        {loading ? "Saving..." : editingService ? "Update Service" : "Add Service"}
                      </button>

                      {editingService && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Services List Section */}
            <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
              <div className="bg-white rounded-2xl shadow-lg border-t-4 border-[#3c6e71]">
                {/* Search and Stats */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">All Services</h3>
                      <p className="text-gray-600 text-sm">Total: {services.length} services</p>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search services..."
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="p-6">
                  {filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by creating a new service"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredServices.map((service) => (
                        <div
                          key={service.category_id}
                          className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          {/* Service Icon */}
                          <div className="flex items-center justify-center mb-4">
                            <img
                              src={service.icon_url}
                              alt={service.category_name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                              }}
                            />
                          </div>

                          {/* Service Info */}
                          <div className="text-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                              {service.category_name}
                            </h4>
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {service.description}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="flex justify-center mb-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${service.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {service.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(service)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>

                          {/* Created Date */}
                          <div className="mt-3 text-center">
                            <p className="text-xs text-gray-500">
                              Created: {new Date(service.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Service</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete "{deleteConfirm.category_name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.category_id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddServices;
