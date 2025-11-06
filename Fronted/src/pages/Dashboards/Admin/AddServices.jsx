import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
} from "@mui/material";
import { AddCircleOutline, CloudUpload } from "@mui/icons-material";
import axios from "axios";
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

  // handle text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle toggle
  const handleToggle = (e) => {
    setFormData((prev) => ({ ...prev, is_active: e.target.checked }));
  };

  // handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, serviceIcon: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name || !formData.description || !formData.serviceIcon) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("category_name", formData.category_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("serviceIcon", formData.serviceIcon);
      formDataToSend.append("is_active", formData.is_active ? 1 : 0); // ✅ match backend (1 or 0)

      const response = await axios.post(
        `${VITE_API_BASE_URL}/Service/InsertService`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Service Added:", response.data);
      alert("Service added successfully!");

      // reset form
      setFormData({
        category_name: "",
        description: "",
        serviceIcon: null,
        is_active: true,
      });
      setPreview(null);
    } catch (error) {
      console.error("❌ Error adding service:", error);
      alert("Something went wrong! Please check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f9f9fb",
        p: 3,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 4,
          boxShadow: 5,
          p: 3,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Box textAlign="center">
              <AddCircleOutline sx={{ fontSize: 50, color: "primary.main" }} />
              <Typography variant="h4" fontWeight={600}>
                Add New Service
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define your service category and details below 🛠️
              </Typography>
            </Box>

            <Divider />

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <Stack spacing={3}>
                <TextField
                  label="Category Name"
                  name="category_name"
                  fullWidth
                  value={formData.category_name}
                  onChange={handleChange}
                  required
                />

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

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    borderStyle: "dashed",
                    py: 1.5,
                  }}
                >
                  {formData.serviceIcon ? "Change Icon" : "Upload Service Icon"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>

                {preview && (
                  <Box textAlign="center">
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        marginTop: 10,
                        objectFit: "cover",
                        border: "1px solid #ccc",
                      }}
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleToggle}
                      color="primary"
                    />
                  }
                  label={
                    <Typography fontWeight={500}>
                      {formData.is_active ? "Active" : "Inactive"}
                    </Typography>
                  }
                />

                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ py: 1.3, fontWeight: 600 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Add Service"
                  )}
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddService;
