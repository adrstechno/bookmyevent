// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   Stack,
//   Divider,
//   Avatar,
//   CircularProgress,
//   MenuItem,
// } from "@mui/material";
// import { PhotoCamera, Save, Business } from "@mui/icons-material";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { VITE_API_BASE_URL } from "../../../utils/api"; // ✅ use same import style

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

//   // ✅ Fetch All Services for dropdown
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const response = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`);
//         console.log("✅ Services Response:", response.data);

//         if (response.data && Array.isArray(response.data.data)) {
//           setServices(response.data.data);
//         } else if (Array.isArray(response.data)) {
//           setServices(response.data);
//         } else {
//           console.warn("⚠️ Unexpected format for services API:", response.data);
//         }
//       } catch (error) {
//         console.error("❌ Error fetching services:", error);
//         alert("Failed to load services. Please try again.");
//       }
//     };
//     fetchServices();
//   }, []);

//   // ✅ Handle input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // ✅ Handle file upload
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, profilePicture: file }));
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   // ✅ Handle submit
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
//       for (const key in formData) {
//         formDataToSend.append(key, formData[key]);
//       }

//       const response = await axios.post(
//         `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
//         formDataToSend,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("✅ Vendor Created:", response.data);

//       alert(response.data.message || "Vendor profile created successfully!");
//       navigate("/vendor/dashboard");
//     } catch (error) {
//       console.error("❌ Error creating vendor:", error);
//       alert("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: "#f9f9fb", minHeight: "100vh" }}>
//       <Card
//         sx={{
//           maxWidth: 900,
//           mx: "auto",
//           borderRadius: 4,
//           boxShadow: 6,
//           p: { xs: 2, md: 4 },
//           bgcolor: "background.paper",
//         }}
//       >
//         <CardContent>
//           <Stack spacing={2}>
//             {/* Header */}
//             <Box textAlign="center" mb={1}>
//               <Business sx={{ fontSize: 50, color: "primary.main" }} />
//               <Typography variant="h4" fontWeight={600}>
//                 Vendor Profile Setup
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Add your business details to start accepting event bookings 🎉
//               </Typography>
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {/* Form */}
//             <form onSubmit={handleSubmit} encType="multipart/form-data">
//               <Grid container spacing={3}>
//                 {/* Business Name */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Business Name"
//                     name="business_name"
//                     fullWidth
//                     value={formData.business_name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>

//                 {/* Service Category Dropdown */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     select
//                     label="Service Category"
//                     name="service_category_id"
//                     fullWidth
//                     value={formData.service_category_id}
//                     onChange={handleChange}
//                     required
//                   >
//                     {services.map((service) => (
//                       <MenuItem key={service.service_id} value={service.service_id}>
//                         {service.category_name}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>

//                 {/* Description */}
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Description"
//                     name="description"
//                     fullWidth
//                     multiline
//                     rows={3}
//                     value={formData.description}
//                     onChange={handleChange}
//                     placeholder="Describe your business services, specialties..."
//                     required
//                   />
//                 </Grid>

//                 {/* Years of Experience */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Years of Experience"
//                     name="years_experience"
//                     fullWidth
//                     type="number"
//                     value={formData.years_experience}
//                     onChange={handleChange}
//                   />
//                 </Grid>

//                 {/* Contact */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Contact Number"
//                     name="contact"
//                     fullWidth
//                     type="tel"
//                     value={formData.contact}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Grid>

//                 {/* Address */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Address"
//                     name="address"
//                     fullWidth
//                     value={formData.address}
//                     onChange={handleChange}
//                   />
//                 </Grid>

//                 {/* City */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="City"
//                     name="city"
//                     fullWidth
//                     value={formData.city}
//                     onChange={handleChange}
//                   />
//                 </Grid>

//                 {/* State */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="State"
//                     name="state"
//                     fullWidth
//                     value={formData.state}
//                     onChange={handleChange}
//                   />
//                 </Grid>

//                 {/* Event Profile URL */}
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Event Profile URL"
//                     name="event_profiles_url"
//                     fullWidth
//                     value={formData.event_profiles_url}
//                     onChange={handleChange}
//                     placeholder="https://instagram.com/yourprofile"
//                   />
//                 </Grid>

//                 {/* Profile Picture Upload */}
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle1" fontWeight={500}>
//                     Upload Profile Picture
//                   </Typography>
//                   <Stack direction="row" alignItems="center" spacing={2} mt={1}>
//                     <Avatar
//                       src={preview}
//                       sx={{ width: 90, height: 90, border: "2px solid #ccc" }}
//                     />
//                     <Button
//                       variant="outlined"
//                       component="label"
//                       startIcon={<PhotoCamera />}
//                     >
//                       Upload Image
//                       <input
//                         hidden
//                         accept="image/*"
//                         type="file"
//                         onChange={handleFileChange}
//                       />
//                     </Button>
//                   </Stack>
//                 </Grid>

//                 {/* Submit */}
//                 <Grid item xs={12}>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     fullWidth
//                     type="submit"
//                     sx={{ py: 1.4, fontWeight: 600 }}
//                     startIcon={<Save />}
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <CircularProgress size={26} color="inherit" />
//                     ) : (
//                       "Save Vendor Profile"
//                     )}
//                   </Button>
//                 </Grid>
//               </Grid>
//             </form>
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

  // ✅ Fetch All Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${VITE_API_BASE_URL}/Service/GetAllServices`
        );

        if (response.data?.data && Array.isArray(response.data.data)) {
          setServices(response.data.data);
        } else if (Array.isArray(response.data)) {
          setServices(response.data);
        }
      } catch (error) {
        console.error("❌ Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.business_name ||
      !formData.service_category_id ||
      !formData.description ||
      !formData.contact ||
      !formData.profilePicture
    ) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) =>
        formDataToSend.append(key, formData[key])
      );

      const response = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(response.data.message || "Vendor profile created successfully!");
      navigate("/vendor/dashboard");
    } catch (error) {
      console.error("❌ Error creating vendor:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(180deg, #f6f7fb 0%, #eef1f5 100%)",
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
          transition: "all 0.3s ease",
        }}
      >
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            {/* Header */}
            <Box textAlign="center">
              <Business sx={{ fontSize: 50, color: "#3f51b5" }} />
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
                  border: "2px solid #e0e0e0",
                  bgcolor: "#fafafa",
                }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Upload
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleFileChange}
                />
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
              value={formData.service_category_id}
              onChange={handleChange}
              required
            >
              {services.map((service) => (
                <MenuItem key={service.service_id} value={service.service_id}>
                  {service.category_name}
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
              placeholder="Describe your services..."
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
              placeholder="https://instagram.com/yourbusiness"
            />

            {/* Submit */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{
                py: 1.3,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 15px rgba(63,81,181,0.3)",
                transition: "0.3s",
                "&:hover": {
                  boxShadow: "0 6px 25px rgba(63,81,181,0.4)",
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
