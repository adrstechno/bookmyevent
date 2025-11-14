import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Link,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Login as LoginIcon, Event, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation
  const validateForm = () => {
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address!");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return false;
    }

    return true;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await axios.post(`${VITE_API_BASE_URL}/User/Login`, formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        toast.success("Login successful!");

        setTimeout(() => {
          switch (res.data.role) {
            case "admin":
              navigate("/admin/dashboard");
              break;
            case "vendor":
              navigate("/vendor/profile-setup");
              break;
            case "marketer":
              navigate("/marketer/dashboard");
              break;
            case "user":
              navigate("/user/dashboard");
              break;
            default:
              navigate("/");
          }
        }, 800);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Box
        sx={{
          display: "flex",
          height: "100vh",
          bgcolor: "#f9f9fb",
        }}
      >
        {/* Left Section - Image or Branding */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: "url('/login.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: { xs: "none", md: "block" },
          }}
        />

        {/* Right Section - Form */}
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={3}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 4,
              boxShadow: 5,
              p: 3,
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box textAlign="center">
                  <Event sx={{ fontSize: 50, color: "primary.main" }} />
                  <Typography variant="h4" fontWeight={600}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Login to continue planning your perfect event ✨
                  </Typography>
                </Box>

                <Divider />

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Email Address"
                      name="email"
                      type="email"
                      fullWidth
                      variant="outlined"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <TextField
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      variant="outlined"
                      value={formData.password}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<LoginIcon />}
                      type="submit"
                      sx={{ py: 1.3, fontWeight: 600 }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                    </Button>
                  </Stack>
                </form>

                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                >
                  Don’t have an account?{" "}
                  <Link
                    component="button"
                    underline="hover"
                    onClick={() => navigate("/register")}
                  >
                    Register here
                  </Link>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default Login;
  