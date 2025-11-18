// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import { PhotoIcon } from "@heroicons/react/24/outline";
// import { VITE_API_BASE_URL } from "../../../utils/api";

// const VendorGallery = () => {
//   const [vendorId, setVendorId] = useState("");
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [uploading, setUploading] = useState(false);

//   // ✅ Fetch vendor ID using cookie/session
//   useEffect(() => {
//     const fetchVendorId = async () => {
//       try {
//         const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`, {
//           withCredentials: true,
//         });
//         if (res.status === 200 && res.data) {
//           setVendorId(res.data.vendor?.vendor_id || res.data.vendor_id);
//         }
//       } catch (err) {
//         console.error("Error fetching vendor ID:", err);
//         toast.error("Failed to fetch vendor details.");
//       }
//     };
//     fetchVendorId();
//   }, []);

//   // ✅ Handle image selection with 5-limit validation
//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     const totalImages = files.length + selectedImages.length;

//     if (totalImages > 5) {
//       toast.error("You can upload up to 5 images only.");
//       return;
//     }

//     const newImages = [...selectedImages, ...files];
//     setSelectedImages(newImages);

//     // Generate image previews
//     const previews = newImages.map((file) => URL.createObjectURL(file));
//     setPreviewImages(previews);
//   };

//   // ✅ Upload images to backend
//   const handleUpload = async () => {
//     if (!vendorId) {
//       toast.error("Vendor ID not found. Please log in again.");
//       return;
//     }

//     if (selectedImages.length === 0) {
//       toast.error("Please select at least one image to upload.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("vendor_id", vendorId);
//     selectedImages.forEach((file) => formData.append("eventImages", file));

//     try {
//       setUploading(true);
//       const res = await axios.post(`${VITE_API_BASE_URL}/Vendor/AddEventImages`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         withCredentials: true,
//       });

//       if (res.status === 200) {
//         toast.success(res.data?.message || "Images uploaded successfully!");
//         setSelectedImages([]);
//         setPreviewImages([]);
//       } else {
//         toast.error("Unexpected server response.");
//       }
//     } catch (error) {
//       console.error("Error uploading images:", error);
//       toast.error(error.response?.data?.message || "Failed to upload images.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ✅ Remove selected image (before upload)
//   const removeImage = (index) => {
//     const updatedImages = selectedImages.filter((_, i) => i !== index);
//     const updatedPreviews = previewImages.filter((_, i) => i !== index);
//     setSelectedImages(updatedImages);
//     setPreviewImages(updatedPreviews);
//   };

//   return (
//     <div className="min-h-screen bg-[#f9fafb] p-6">
//       {/* Header */}
//       <div className="bg-[#3c6e71] text-white shadow-lg rounded-xl px-6 py-4 mb-8 flex justify-between items-center">
//         <h1 className="text-xl md:text-2xl font-semibold">Upload Event Gallery</h1>
//       </div>

//       {/* Upload Section */}
//       <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl mx-auto border-t-4 border-[#3c6e71]">
//         <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
//           Add Images to Your Event Gallery (Max 5)
//         </h2>

//         {/* Upload Button */}
//         <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#3c6e71] rounded-2xl p-8 bg-[#f0f4f5]">
//           <PhotoIcon className="h-14 w-14 text-[#3c6e71] mb-3" />
//           <p className="text-gray-600 mb-4 text-center">
//             Drag & drop images here, or click to browse (Max 5)
//           </p>
//           <input
//             type="file"
//             multiple
//             accept="image/*"
//             onChange={handleImageChange}
//             className="hidden"
//             id="gallery-upload"
//           />
//           <label
//             htmlFor="gallery-upload"
//             className={`cursor-pointer bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium px-6 py-2 rounded-lg shadow-md transition ${
//               selectedImages.length >= 5 ? "opacity-70 cursor-not-allowed" : ""
//             }`}
//           >
//             Select Images
//           </label>
//         </div>

//         {/* Preview Section */}
//         {previewImages.length > 0 && (
//           <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
//             {previewImages.map((src, index) => (
//               <div
//                 key={index}
//                 className="relative rounded-lg overflow-hidden border-2 border-[#3c6e71] group"
//               >
//                 <img
//                   src={src}
//                   alt={`Preview ${index}`}
//                   className="w-full h-40 object-cover"
//                 />
//                 <button
//                   onClick={() => removeImage(index)}
//                   className="absolute top-2 right-2 bg-[#3c6e71] text-white rounded-full px-2 py-1 text-xs opacity-80 hover:opacity-100 transition"
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Upload Button */}
//         <div className="flex justify-end mt-10">
//           <button
//             onClick={handleUpload}
//             disabled={uploading || selectedImages.length === 0}
//             className={`${
//               uploading || selectedImages.length === 0
//                 ? "opacity-70 cursor-not-allowed"
//                 : ""
//             } bg-[#3c6e71] hover:bg-[#284b63] text-white font-medium py-2 px-8 rounded-lg shadow-md transition`}
//           >
//             {uploading ? "Uploading..." : "Upload Images"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorGallery;


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
  const [isDragging, setIsDragging] = useState(false);

  // Fetch vendor ID
  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          setVendorId(res.data.vendor?.vendor_id || res.data.vendor_id);
        }
      } catch (err) {
        console.error("Error fetching vendor ID:", err);
        toast.error("Failed to fetch vendor details.");
      }
    };
    fetchVendorId();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const total = selectedImages.length + files.length;

    if (total > 5) {
      toast.error("You can upload up to 5 images only.");
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    setPreviewImages(newImages.map((file) => URL.createObjectURL(file)));
  };

  // Drag & Drop drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const total = selectedImages.length + files.length;

    if (total > 5) {
      toast.error("You can upload up to 5 images only.");
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    setPreviewImages(newImages.map((file) => URL.createObjectURL(file)));
  };

  // Upload images
  const handleUpload = async () => {
    if (!vendorId) return toast.error("Vendor ID not found.");
    if (selectedImages.length === 0) return toast.error("Select images first.");

    const formData = new FormData();
    formData.append("vendor_id", vendorId);
    selectedImages.forEach((file) => formData.append("eventImages", file));

    try {
      setUploading(true);

      const res = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/AddEventImages`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        toast.success(res.data.message || "Images uploaded successfully!");
        setSelectedImages([]);
        setPreviewImages([]);
      }
    } catch (err) {
      console.error("Error uploading:", err);
      toast.error(err.response?.data?.message || "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  // Remove image before upload
  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9f1ef] to-[#f7fbfa] p-8">

      {/* Header */}
      <div className="bg-white shadow-xl rounded-2xl px-8 py-6 mb-10 border-l-4 border-[#3c6e71] flex items-center gap-4">
        <div className="bg-[#3c6e71] p-3 rounded-xl">
          <PhotoIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#284b63]">Event Gallery Upload</h1>
          <p className="text-gray-600 text-sm">
            Add high-quality images to showcase your event highlights
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-4xl mx-auto border-t-4 border-[#3c6e71]">

        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
          Upload Images (Max 5)
        </h2>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer 
            ${isDragging ? "border-[#3c6e71] bg-[#e5f2ee]" : "border-gray-300 bg-white/70 hover:bg-white shadow-sm hover:shadow-lg"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {/* Glow overlay */}
          <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-30 blur-xl bg-gradient-to-br from-[#3c6e71] to-[#284b63] pointer-events-none transition-all"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full bg-[#3c6e71]/10 border border-[#3c6e71]/20 mb-3 animate-bounce">
              <PhotoIcon className="h-10 w-10 text-[#3c6e71]" />
            </div>

            <h3 className="text-lg font-semibold text-[#284b63]">Upload Images</h3>
            <p className="text-gray-600 text-sm">
              Drag & drop files here, or click to browse  
              <br />
              <span className="text-xs text-gray-500">Maximum 5 images allowed</span>
            </p>

            {/* Hidden file input */}
            <input
              id="gallery-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Button */}
            <label
              htmlFor="gallery-upload"
              className="mt-4 inline-block px-6 py-2 bg-[#3c6e71] text-white rounded-lg shadow-md hover:bg-[#284b63] transition active:scale-95"
            >
              Select Images
            </label>
          </div>

          {/* Upload shimmer progress bar */}
          {uploading && (
            <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-[#3c6e71] via-[#284b63] to-[#3c6e71] animate-[slide_1.5s_linear_infinite]"></div>
            </div>
          )}
        </div>

        {/* Preview Grid */}
        {previewImages.length > 0 && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {previewImages.map((src, index) => (
              <div
                key={index}
                className="relative rounded-xl border-2 border-[#3c6e71] overflow-hidden shadow-lg group"
              >
                <img src={src} className="w-full h-44 object-cover" />

                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-[#3c6e71]/90 text-white text-xs px-2 py-1 rounded-full shadow-md opacity-90 hover:opacity-100 transition"
                >
                  ✕
                </button>

                <div className="absolute bottom-0 left-0 w-full bg-black/30 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition">
                  Preview {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end mt-10">
          <button
            onClick={handleUpload}
            disabled={uploading || selectedImages.length === 0}
            className={`px-10 py-3 text-white font-medium rounded-xl shadow-lg bg-[#3c6e71] hover:bg-[#284b63] transition 
            ${uploading || selectedImages.length === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorGallery;
