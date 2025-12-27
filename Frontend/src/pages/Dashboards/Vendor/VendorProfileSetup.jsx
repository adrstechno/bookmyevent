
import { useState, useEffect } from "react";
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
} from "@mui/material";
import { PhotoCamera, Save } from "@mui/icons-material";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

// Configure axios to include credentials (cookies) with requests
axios.defaults.withCredentials = true;

const VendorProfileSetup = () => {
  const { user } = useAuth();

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

  // ✅ Fetch all service categories
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`, {
          withCredentials: true
        });
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({
            id: item.category_id,
            name: item.category_name,
          }));
          setServices(formatted);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services.");
      }
    };
    fetchServices();
  }, []);

  // ✅ Main Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateMainForm = () => {
    if (
      !formData.business_name ||
      !formData.service_category_id ||
      !formData.description ||
      !formData.contact
    ) {
      toast.error("Please fill all required fields!");
      return false;
    }
    
    if (!formData.profilePicture) {
      toast.error("Please upload a profile picture!");
      return false;
    }
    
    if (!/^[0-9]{10}$/.test(formData.contact)) {
      toast.error("Enter a valid 10-digit contact number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMainForm()) return;

    // Check if user is authenticated
    if (!user) {
      toast.error("Please login to create vendor profile");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      
      // Add all form data to FormData object
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          payload.append(key, formData[key]);
        }
      });

      // Get token from localStorage and add as Authorization header
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
        payload,
        {
          withCredentials: true,
          headers: { 
            "Content-Type": "multipart/form-data",
            ...(token && { "Authorization": `Bearer ${token}` })
          },
        }
      );

      toast.success(response.data.message || "Vendor profile created successfully!");
      
      // Reset form after successful submission
      setFormData({
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
      setPreview(null);
      
    } catch (error) {
      console.error("Error creating vendor profile:", error);
      
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Please upload a profile picture.");
      } else {
        toast.error(error.response?.data?.message || "Failed to save profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // shift management moved to VendorShiftPage


  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 5,
        px: 2,
      }}
    >
      {/* --- PAGE HEADER --- */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 680,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#3c6e71", letterSpacing: 0.5 }}
        >
          Vendor Profile Setup
        </Typography>
      </Box>

      {/* --- Vendor Form --- */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 680,
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          p: { xs: 3, md: 4 },
        }}
      >
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
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
              {services.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
            </Stack>

            <TextField
              label="Event Profile / Social URL"
              name="event_profiles_url"
              fullWidth
              value={formData.event_profiles_url}
              onChange={handleChange}
            />

            <Button
              variant="contained"
              type="submit"
              sx={{
                py: 1.3,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                bgcolor: "#3c6e71",
                boxShadow: "0 4px 15px rgba(40,75,99,0.3)",
                "&:hover": { bgcolor: "#284b63" },
              }}
              startIcon={<Save />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Vendor Profile"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Shift management moved to VendorShiftPage */}
    </Box>
  );
};

export default VendorProfileSetup;
