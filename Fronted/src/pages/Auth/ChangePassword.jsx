import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../utils/api";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    previousPassword: "",
    currentPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const res = await axios.post(
        `${VITE_API_BASE_URL}/auth/change-password`,
        {
          email: formData.email,
          oldPassword: formData.previousPassword,
          newPassword: formData.currentPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setFormData({ email: "", previousPassword: "", currentPassword: "" });
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f9f9f9"
    >
      <Card sx={{ width: 400, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>
            Change Password
          </Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Previous Password"
                name="previousPassword"
                type="password"
                value={formData.previousPassword}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;
