// import React, { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Stack,
//   TextField,
//   Button,
//   Switch,
//   FormControlLabel,
//   Divider,
//   CircularProgress,
// } from "@mui/material";
// import { AddCircleOutline, CloudUpload } from "@mui/icons-material";
// import axios from "axios";
// import { VITE_API_BASE_URL } from "../../../utils/api";

// const AddService = () => {
//   const [formData, setFormData] = useState({
//     category_name: "",
//     description: "",
//     serviceIcon: null,
//     is_active: true,
//   });

//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // handle text fields
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // handle toggle
//   const handleToggle = (e) => {
//     setFormData((prev) => ({ ...prev, is_active: e.target.checked }));
//   };

//   // handle file upload
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, serviceIcon: file }));
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   // handle submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.category_name || !formData.description || !formData.serviceIcon) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       setLoading(true);

//       const formDataToSend = new FormData();
//       formDataToSend.append("category_name", formData.category_name);
//       formDataToSend.append("description", formData.description);
//       formDataToSend.append("serviceIcon", formData.serviceIcon);
//       formDataToSend.append("is_active", formData.is_active ? 1 : 0); // ✅ match backend (1 or 0)

//       const response = await axios.post(
//         `${VITE_API_BASE_URL}/Service/InsertService`,
//         formDataToSend,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("✅ Service Added:", response.data);
//       alert("Service added successfully!");

//       // reset form
//       setFormData({
//         category_name: "",
//         description: "",
//         serviceIcon: null,
//         is_active: true,
//       });
//       setPreview(null);
//     } catch (error) {
//       console.error("❌ Error adding service:", error);
//       alert("Something went wrong! Please check console.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//         bgcolor: "#f9f9fb",
//         p: 3,
//       }}
//     >
//       <Card
//         sx={{
//           width: "100%",
//           maxWidth: 600,
//           borderRadius: 4,
//           boxShadow: 5,
//           p: 3,
//         }}
//       >
//         <CardContent>
//           <Stack spacing={2}>
//             <Box textAlign="center">
//               <AddCircleOutline sx={{ fontSize: 50, color: "primary.main" }} />
//               <Typography variant="h4" fontWeight={600}>
//                 Add New Service
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Define your service category and details below 🛠️
//               </Typography>
//             </Box>

//             <Divider />

//             <form onSubmit={handleSubmit} encType="multipart/form-data">
//               <Stack spacing={3}>
//                 <TextField
//                   label="Category Name"
//                   name="category_name"
//                   fullWidth
//                   value={formData.category_name}
//                   onChange={handleChange}
//                   required
//                 />

//                 <TextField
//                   label="Description"
//                   name="description"
//                   fullWidth
//                   multiline
//                   rows={3}
//                   value={formData.description}
//                   onChange={handleChange}
//                   required
//                 />

//                 <Button
//                   variant="outlined"
//                   component="label"
//                   startIcon={<CloudUpload />}
//                   sx={{
//                     textTransform: "none",
//                     fontWeight: 500,
//                     borderStyle: "dashed",
//                     py: 1.5,
//                   }}
//                 >
//                   {formData.serviceIcon ? "Change Icon" : "Upload Service Icon"}
//                   <input
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={handleFileChange}
//                   />
//                 </Button>

//                 {preview && (
//                   <Box textAlign="center">
//                     <img
//                       src={preview}
//                       alt="Preview"
//                       style={{
//                         width: 100,
//                         height: 100,
//                         borderRadius: 8,
//                         marginTop: 10,
//                         objectFit: "cover",
//                         border: "1px solid #ccc",
//                       }}
//                     />
//                   </Box>
//                 )}

//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={formData.is_active}
//                       onChange={handleToggle}
//                       color="primary"
//                     />
//                   }
//                   label={
//                     <Typography fontWeight={500}>
//                       {formData.is_active ? "Active" : "Inactive"}
//                     </Typography>
//                   }
//                 />

//                 <Button
//                   variant="contained"
//                   color="primary"
//                   type="submit"
//                   sx={{ py: 1.3, fontWeight: 600 }}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <CircularProgress size={24} color="inherit" />
//                   ) : (
//                     "Add Service"
//                   )}
//                 </Button>
//               </Stack>
//             </form>
//           </Stack>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default AddService;


import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../../utils/api";

const AddService = () => {
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
    serviceIcon: null,
    is_active: true,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle toggle
  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  // ✅ Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, serviceIcon: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name || !formData.description || !formData.serviceIcon) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("category_name", formData.category_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("serviceIcon", formData.serviceIcon);
      formDataToSend.append("is_active", formData.is_active ? 1 : 0);

      const res = await axios.post(
        `${VITE_API_BASE_URL}/Service/InsertService`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data?.message || "Service added successfully!");

      // Reset form
      setFormData({
        category_name: "",
        description: "",
        serviceIcon: null,
        is_active: true,
      });
      setPreview(null);
    } catch (err) {
      console.error("❌ Error adding service:", err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="min-h-screen flex justify-center items-center bg-[#f9fafb] py-10 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border-t-4 border-[#3c6e71]">
          {/* Header */}
          <div className="text-center mb-8">
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
            <h2 className="text-2xl font-semibold text-gray-800">Add New Service</h2>
            <p className="text-gray-500 text-sm mt-1">
              Define your service category and details below 🛠️
            </p>
          </div>

          {/* Form */}
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
                Service Icon
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
                    {formData.serviceIcon ? "Change Icon" : "Upload Service Icon"}
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
                className={`w-14 h-8 rounded-full transition-all ${
                  formData.is_active ? "bg-[#3c6e71]" : "bg-gray-300"
                } relative`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                    formData.is_active ? "translate-x-6" : ""
                  }`}
                ></span>
              </button>
              <span className="font-medium text-gray-700">
                {formData.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 mt-4 rounded-lg text-white font-semibold shadow-md transition ${
                loading
                  ? "bg-[#3c6e71] opacity-70 cursor-not-allowed"
                  : "bg-[#3c6e71] hover:bg-[#284b63]"
              }`}
            >
              {loading ? "Saving..." : "Add Service"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddService;
