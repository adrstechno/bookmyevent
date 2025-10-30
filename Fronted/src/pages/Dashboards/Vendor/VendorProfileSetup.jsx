import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Avatar,
} from "@mui/material";
import { PhotoCamera, Save, Event, CurrencyRupee } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const VendorProfileSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    city: "Jabalpur",
    address: "",
    description: "",
    startingPrice: "",
    contact: "",
    image: null,
    preview: "",
  });

  const categories = [
    "Wedding Planner",
    "Caterer",
    "Decorator",
    "DJ / Music",
    "Venue",
    "Photographer",
    "Makeup Artist",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Vendor Profile Submitted:", formData);
    // Simulate success → redirect
    navigate("/vendor/dashboard");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: "#f9f9fb", minHeight: "100vh" }}>
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          borderRadius: 4,
          boxShadow: 5,
          p: { xs: 2, md: 4 },
          bgcolor: "background.paper",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            {/* Header */}
            <Box textAlign="center">
              <Event sx={{ fontSize: 50, color: "primary.main" }} />
              <Typography variant="h4" fontWeight={600}>
                Create Your Vendor Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete your business details to start receiving event bookings 🎉
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Business Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Business Name"
                    name="businessName"
                    fullWidth
                    variant="outlined"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Service Category"
                    name="category"
                    fullWidth
                    variant="outlined"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* City */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    fullWidth
                    variant="outlined"
                    value={formData.city}
                    onChange={handleChange}
                    disabled
                  />
                </Grid>

                {/* Address */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    fullWidth
                    variant="outlined"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Starting Price */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Starting Price"
                    name="startingPrice"
                    fullWidth
                    variant="outlined"
                    type="number"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupee fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Contact Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact Number"
                    name="contact"
                    fullWidth
                    variant="outlined"
                    value={formData.contact}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    label="Business Description"
                    name="description"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your services, specialties, and packages..."
                  />
                </Grid>

                {/* Image Upload */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Upload Profile Image / Cover Photo
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} mt={1}>
                    <Avatar
                      src={formData.preview}
                      sx={{ width: 80, height: 80, border: "2px solid #ccc" }}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                    >
                      Upload
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  </Stack>
                </Grid>

                {/* Submit */}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    fullWidth
                    type="submit"
                    sx={{ py: 1.3, fontWeight: 600 }}
                  >
                    Save Profile & Continue
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );    
};

export default VendorProfileSetup;
