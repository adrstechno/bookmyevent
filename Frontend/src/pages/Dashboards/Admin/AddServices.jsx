import React, { useEffect, useState } from "react";
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

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchServices = async () => {
    try {
      setFetching(true);
      const res = await axios.get(
        `${VITE_API_BASE_URL}/Service/getAllServices`
      );
      setServices(res.data || []);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  /* ===== handlers (unchanged) ===== */
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name || !formData.description || !formData.serviceIcon) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("category_name", formData.category_name);
      fd.append("description", formData.description);
      fd.append("serviceIcon", formData.serviceIcon);
      fd.append("is_active", formData.is_active ? 1 : 0);

      await axios.post(
        `${VITE_API_BASE_URL}/Service/InsertService`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Service added successfully!");
      setFormData({
        category_name: "",
        description: "",
        serviceIcon: null,
        is_active: true,
      });
      setPreview(null);
      fetchServices();
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-[#f9fafb] py-12 px-4">
        {/* ================= ADD SERVICE CARD ================= */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border-t-4 border-[#3c6e71] p-8 md:p-10">
          <h2 className="text-3xl font-semibold text-center text-[#284b63]">
            Add New Service
          </h2>
          <p className="text-center text-gray-500 text-sm mt-2 mb-10">
            Create and manage service categories professionally
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Category Name */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">
                Category Name
              </label>
              <input
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                placeholder="e.g. DJ Shows"
                className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
              />
            </div>

            {/* Status Toggle */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">
                Service Status
              </label>
              <div className="flex items-center gap-4 mt-1">
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`w-14 h-8 rounded-full transition relative ${
                    formData.is_active ? "bg-[#3c6e71]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition ${
                      formData.is_active ? "translate-x-6" : ""
                    }`}
                  />
                </button>
                <span className="font-medium text-gray-600">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Brief description of the service"
                className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#3c6e71] focus:outline-none resize-none"
              />
            </div>

            {/* Upload Icon */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="font-medium text-gray-700">
                Service Icon
              </label>

              <label className="border-2 border-dashed border-[#3c6e71] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f0f4f5] transition">
                <span className="text-[#3c6e71] font-medium">
                  {formData.serviceIcon ? "Change Icon" : "Upload Service Icon"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {preview && (
                <div className="flex justify-center mt-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl border shadow-sm object-cover"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-3 rounded-xl text-white font-semibold shadow-lg transition ${
                  loading
                    ? "bg-[#3c6e71] opacity-70 cursor-not-allowed"
                    : "bg-[#3c6e71] hover:bg-[#284b63]"
                }`}
              >
                {loading ? "Saving..." : "Add Service"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= SERVICES LIST ================= */}
        <div className="max-w-7xl mx-auto mt-16">
          <h3 className="text-2xl font-semibold text-[#284b63] text-center mb-10">
            All Services
          </h3>

          {fetching ? (
            <p className="text-center text-gray-500">Loading services...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((s) => (
                <div
                  key={s.category_id}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition border-t-4 border-[#3c6e71]"
                >
                  <img
                    src={s.icon_url}
                    alt={s.category_name}
                    className="w-20 h-20 mx-auto rounded-xl border object-cover"
                  />
                  <h4 className="text-lg font-semibold text-center mt-4">
                    {s.category_name}
                  </h4>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {s.description}
                  </p>
                  <div className="mt-4 text-center">
                    <span
                      className={`px-4 py-1 text-sm rounded-full ${
                        s.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddServices;
