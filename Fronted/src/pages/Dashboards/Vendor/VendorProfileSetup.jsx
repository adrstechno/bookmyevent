// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   Stack,
//   Avatar,
//   CircularProgress,
//   MenuItem,
//   Divider,
// } from "@mui/material";
// import { PhotoCamera, Save, Business } from "@mui/icons-material";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { VITE_API_BASE_URL } from "../../../utils/api";
// import toast from "react-hot-toast";

// const VendorProfileSetup = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     business_name: "",
//     service_category_id: "",
//     description: "",
//     years_experience: "",
//     contact: "",
//     address: "",
//     city: "",
//     state: "",
//     event_profiles_url: "",
//     profilePicture: null,
//   });

//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [services, setServices] = useState([]);

//   const token = localStorage.getItem("token");

//   // ✅ Fetch all service categories
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         // If there's no token, redirect to login — backend requires auth for this endpoint
//         if (!token) {
//           toast.error("Please log in to continue.");
//           navigate("/login");
//           return;
//         }

//         const response = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });

//         const data = response.data?.data || response.data;

//         if (Array.isArray(data)) {
//           const formatted = data.map((item) => ({
//             id: item.category_id,
//             name: item.category_name,
//           }));
//           setServices(formatted);
//         } else {
//           console.error("Unexpected data format:", data);
//         }
//       } catch (error) {
//         // Log details for debugging
//         console.error("Error fetching services:", error?.response || error);

//         if (error.response?.status === 401) {
//           // token invalid/expired — clear and redirect
//           localStorage.removeItem("token");
//           localStorage.removeItem("user");
//           toast.error("Session expired or unauthorized. Please log in again.");
//           navigate("/login");
//         } else {
//           toast.error("Failed to load services. Please try again later.");
//         }
//       }
//     };
//     fetchServices();
//   }, [token, navigate]);

//   // ✅ Handle input field change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // ✅ Handle profile image upload
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, profilePicture: file }));
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   // ✅ Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formData.business_name ||
//       !formData.service_category_id ||
//       !formData.description ||
//       !formData.contact ||
//       !formData.profilePicture
//     ) {
//       alert("Please fill all required fields!");
//       return;
//     }

//     try {
//       setLoading(true);
//       const formDataToSend = new FormData();
//       Object.keys(formData).forEach((key) => {
//         formDataToSend.append(key, formData[key]);
//       });

//       const response = await axios.post(
//         `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
//         formDataToSend,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       toast.success(response.data.message || "Vendor profile created successfully!");
//       navigate("/vendor/dashboard");
//     } catch (error) {
//       if (error.response?.status === 401) {
//         toast.error("Unauthorized! Please log in again.");
//         // navigate("/login");
//       } else {
//         console.error("Error creating vendor:", error);
//         toast.error("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         bgcolor: "#f8f9fa",
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         p: 2,
//       }}
//     >
//       <Card
//         sx={{
//           width: "100%",
//           maxWidth: 500,
//           borderRadius: 4,
//           boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
//           bgcolor: "#fff",
//           p: { xs: 3, md: 4 },
//         }}
//       >
//         <CardContent>
//           <Stack spacing={3} component="form" onSubmit={handleSubmit}>
//             <Box textAlign="center">
//               <Business sx={{ fontSize: 50, color: "#3c6e71" }} />
//               <Typography variant="h5" fontWeight={600}>
//                 Vendor Profile Setup
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Fill your business details to get started.
//               </Typography>
//             </Box>

//             <Divider />

//             {/* Profile Picture */}
//             <Stack
//               direction="row"
//               spacing={2}
//               alignItems="center"
//               justifyContent="center"
//             >
//               <Avatar
//                 src={preview}
//                 sx={{
//                   width: 90,
//                   height: 90,
//                   border: "2px solid #d9d9d9",
//                   bgcolor: "#fafafa",
//                 }}
//               />
//               <Button
//                 variant="outlined"
//                 component="label"
//                 startIcon={<PhotoCamera />}
//                 sx={{
//                   textTransform: "none",
//                   borderRadius: 2,
//                   borderColor: "#284b63",
//                   color: "#284b63",
//                 }}
//               >
//                 Upload
//                 <input hidden accept="image/*" type="file" onChange={handleFileChange} />
//               </Button>
//             </Stack>

//             {/* Form Fields */}
//             <TextField
//               label="Business Name"
//               name="business_name"
//               fullWidth
//               value={formData.business_name}
//               onChange={handleChange}
//               required
//             />

//             <TextField
//               select
//               label="Service Category"
//               name="service_category_id"
//               fullWidth
//               value={formData.service_category_id || ""}
//               onChange={handleChange}
//               required
//             >
//               {services.map((service) => (
//                 <MenuItem key={service.id} value={service.id}>
//                   {service.name}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <TextField
//               label="Description"
//               name="description"
//               fullWidth
//               multiline
//               rows={3}
//               value={formData.description}
//               onChange={handleChange}
//               required
//             />

//             <TextField
//               label="Years of Experience"
//               name="years_experience"
//               type="number"
//               fullWidth
//               value={formData.years_experience}
//               onChange={handleChange}
//             />

//             <TextField
//               label="Contact Number"
//               name="contact"
//               fullWidth
//               value={formData.contact}
//               onChange={handleChange}
//               required
//             />

//             <TextField
//               label="Address"
//               name="address"
//               fullWidth
//               value={formData.address}
//               onChange={handleChange}
//             />

//             <TextField
//               label="City"
//               name="city"
//               fullWidth
//               value={formData.city}
//               onChange={handleChange}
//             />

//             <TextField
//               label="State"
//               name="state"
//               fullWidth
//               value={formData.state}
//               onChange={handleChange}
//             />

//             <TextField
//               label="Event Profile / Social URL"
//               name="event_profiles_url"
//               fullWidth
//               value={formData.event_profiles_url}
//               onChange={handleChange}
//             />

//             {/* Submit */}
//             <Button
//               variant="contained"
//               fullWidth
//               type="submit"
//               sx={{
//                 py: 1.3,
//                 fontWeight: 600,
//                 borderRadius: 2,
//                 textTransform: "none",
//                 bgcolor: "#3c6e71",
//                 boxShadow: "0 4px 15px rgba(40,75,99,0.3)",
//                 "&:hover": {
//                   bgcolor: "#284b63",
//                   boxShadow: "0 6px 25px rgba(40,75,99,0.4)",
//                 },
//               }}
//               startIcon={<Save />}
//               disabled={loading}
//             >
//               {loading ? <CircularProgress size={24} color="inherit" /> : "Save Vendor Profile"}
//             </Button>
//           </Stack>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default VendorProfileSetup;

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  MenuItem,
  Divider,
} from "@mui/material";
import { PhotoCamera, Save, Business } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { VITE_API_BASE_URL } from "../../../utils/api";
import toast from "react-hot-toast";

// ✅ Enable cookies globally
axios.defaults.withCredentials = true;

const VendorProfileSetup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    business_name: "",
    service_category_id: "",
    description: "",
    years_experience: "",
    contact: "",
    address: "",
    city: "",
    state: "",
    event_profiles_url: "",
    profilePicture: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

  // ✅ Fetch service categories (using cookie auth)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`, {
          withCredentials: true, // send cookie
        });

        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({
            id: item.category_id,
            name: item.category_name,
          }));
          setServices(formatted);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error("Failed to load services.");
        }
      }
    };
    fetchServices();
  }, [navigate]);

  // ✅ Handle input field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle profile image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Submit vendor form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.business_name ||
      !formData.service_category_id ||
      !formData.description ||
      !formData.contact ||
      !formData.profilePicture
    ) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // ✅ No Authorization header — backend reads cookie
      const response = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
        formDataToSend,
        {
          withCredentials: true, // 🔑 crucial for cookies
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message || "Vendor profile created successfully!");
      navigate("/vendor/dashboard");
    } catch (error) {
      console.error("Error creating vendor:", error);

      if (error.response?.status === 401) {
        toast.error("Unauthorized: Please log in again.");
        navigate("/login");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          p: { xs: 3, md: 4 },
        }}
      >
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Box textAlign="center">
              <Business sx={{ fontSize: 50, color: "#3c6e71" }} />
              <Typography variant="h5" fontWeight={600}>
                Vendor Profile Setup
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill your business details to get started.
              </Typography>
            </Box>

            <Divider />

            {/* Profile Picture */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Avatar
                src={preview}
                sx={{
                  width: 90,
                  height: 90,
                  border: "2px solid #d9d9d9",
                  bgcolor: "#fafafa",
                }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#284b63",
                  color: "#284b63",
                }}
              >
                Upload
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>
            </Stack>

            {/* Form Fields */}
            <TextField
              label="Business Name"
              name="business_name"
              fullWidth
              value={formData.business_name}
              onChange={handleChange}
              required
            />

            <TextField
              select
              label="Service Category"
              name="service_category_id"
              fullWidth
              value={formData.service_category_id || ""}
              onChange={handleChange}
              required
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />

            <TextField
              label="Years of Experience"
              name="years_experience"
              type="number"
              fullWidth
              value={formData.years_experience}
              onChange={handleChange}
            />

            <TextField
              label="Contact Number"
              name="contact"
              fullWidth
              value={formData.contact}
              onChange={handleChange}
              required
            />

            <TextField
              label="Address"
              name="address"
              fullWidth
              value={formData.address}
              onChange={handleChange}
            />

            <TextField
              label="City"
              name="city"
              fullWidth
              value={formData.city}
              onChange={handleChange}
            />

            <TextField
              label="State"
              name="state"
              fullWidth
              value={formData.state}
              onChange={handleChange}
            />

            <TextField
              label="Event Profile / Social URL"
              name="event_profiles_url"
              fullWidth
              value={formData.event_profiles_url}
              onChange={handleChange}
            />

            {/* Submit */}
            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={{
                py: 1.3,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                bgcolor: "#3c6e71",
                boxShadow: "0 4px 15px rgba(40,75,99,0.3)",
                "&:hover": {
                  bgcolor: "#284b63",
                  boxShadow: "0 6px 25px rgba(40,75,99,0.4)",
                },
              }}
              startIcon={<Save />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Vendor Profile"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorProfileSetup;
