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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Login as LoginIcon, Event } from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Submitted:", formData);
    navigate("/dashboard");
  };

  return (
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
          backgroundImage:
            "url('/login.jpg')",
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
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LoginIcon />}
                    type="submit"
                    sx={{ py: 1.3, fontWeight: 600 }}
                  >
                    Login
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
  );
};

export default Login;
