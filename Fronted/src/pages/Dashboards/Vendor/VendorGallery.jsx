import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { VITE_API_BASE_URL } from "../../../utils/api";

const VendorGallery = () => {
  const [vendorId, setVendorId] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch vendor ID using cookie/session
  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data) {
          setVendorId(res.data.vendor?.vendor_id || res.data.vendor_id);
        }
      } catch (err) {
        console.error("Error fetching vendor ID:", err);
        toast.error("Failed to fetch vendor details.");
      }
    };
    fetchVendorId();
  }, []);

  // ✅ Handle image selection with 5-limit validation
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = files.length + selectedImages.length;

    if (totalImages > 5) {
      toast.error("You can upload up to 5 images only.");
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Generate image previews
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // ✅ Upload images to backend
  const handleUpload = async () => {
    if (!vendorId) {
      toast.error("Vendor ID not found. Please log in again.");
      return;
    }

    if (selectedImages.length === 0) {
      toast.error("Please select at least one image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("vendor_id", vendorId);
    selectedImages.forEach((file) => formData.append("eventImages", file));

    try {
      setUploading(true);
      const res = await axios.post(`${VITE_API_BASE_URL}/Vendor/AddEventImages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.status === 200) {
        toast.success(res.data?.message || "Images uploaded successfully!");
        setSelectedImages([]);
        setPreviewImages([]);
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(error.response?.data?.message || "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Remove selected image (before upload)
  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setPreviewImages(updatedPreviews);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6">
      {/* Header */}
      <div className="bg-[#3c6e71] text-white shadow-lg rounded-xl px-6 py-4 mb-8 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">Upload Event Gallery</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl mx-auto border-t-4 border-[#3c6e71]">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Add Images to Your Event Gallery (Max 5)
        </h2>

        {/* Upload Button */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#3c6e71] rounded-2xl p-8 bg-[#f0f4f5]">
          <PhotoIcon className="h-14 w-14 text-[#3c6e71] mb-3" />
          <p className="text-gray-600 mb-4 text-center">
            Drag & drop images here, or click to browse (Max 5)
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="gallery-upload"
          />
          <label
            htmlFor="gallery-upload"
            className={`cursor-pointer bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium px-6 py-2 rounded-lg shadow-md transition ${
              selectedImages.length >= 5 ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            Select Images
          </label>
        </div>

        {/* Preview Section */}
        {previewImages.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((src, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden border-2 border-[#3c6e71] group"
              >
                <img
                  src={src}
                  alt={`Preview ${index}`}
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-[#3c6e71] text-white rounded-full px-2 py-1 text-xs opacity-80 hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end mt-10">
          <button
            onClick={handleUpload}
            disabled={uploading || selectedImages.length === 0}
            className={`${
              uploading || selectedImages.length === 0
                ? "opacity-70 cursor-not-allowed"
                : ""
            } bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition`}
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorGallery;
