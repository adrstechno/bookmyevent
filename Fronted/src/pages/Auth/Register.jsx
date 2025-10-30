// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   TextField,
//   Typography,
//   Stack,
//   Link,
//   Divider,
//   MenuItem,
//   InputAdornment,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { PersonAdd, Phone, Email } from "@mui/icons-material";

// const Register = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     user_type: "",
//     email: "",
//     phone: "",
//     password: "",
//   });

//   const userTypes = [
//     { label: "Vendor", value: "vendor" },
//     { label: "User", value: "user" },
//     { label: "Marketer", value: "marketer" },
//   ];

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Here you’ll later call your backend API (POST /register)
//     console.log("Register Data:", formData);

//     if (!formData.user_type) {
//       alert("Please select a user type");
//       return;
//     }

//     if (!formData.email || !formData.password) {
//       alert("Please fill all required fields");
//       return;
//     }

//     navigate("/login");
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         height: "100vh",
//         bgcolor: "#f9f9fb",
//       }}
//     >
//       {/* Left Section with Image */}
//       <Box
//         sx={{
//           flex: 1,
//           backgroundImage:
//             "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80')",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           display: { xs: "none", md: "block" },
//         }}
//       />

//       {/* Right Section with Form */}
//       <Box
//         flex={1}
//         display="flex"
//         alignItems="center"
//         justifyContent="center"
//         p={3}
//       >
//         <Card
//           sx={{
//             width: "100%",
//             maxWidth: 440,
//             borderRadius: 4,
//             boxShadow: 5,
//             p: 3,
//           }}
//         >
//           <CardContent>
//             <Stack spacing={2}>
//               <Box textAlign="center">
//                 <PersonAdd sx={{ fontSize: 50, color: "primary.main" }} />
//                 <Typography variant="h4" fontWeight={600}>
//                   Create Your Account
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Join us and start planning your perfect event 🎉
//                 </Typography>
//               </Box>

//               <Divider />

//               <form onSubmit={handleSubmit}>
//                 <Stack spacing={2}>
//                   <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
//                     <TextField
//                       label="First Name"
//                       name="first_name"
//                       fullWidth
//                       variant="outlined"
//                       value={formData.first_name}
//                       onChange={handleChange}
//                       required
//                     />
//                     <TextField
//                       label="Last Name"
//                       name="last_name"
//                       fullWidth
//                       variant="outlined"
//                       value={formData.last_name}
//                       onChange={handleChange}
//                     />
//                   </Stack>

//                   <TextField
//                     select
//                     label="User Type"
//                     name="user_type"
//                     fullWidth
//                     variant="outlined"
//                     value={formData.user_type}
//                     onChange={handleChange}
//                     required
//                   >
//                     {userTypes.map((type) => (
//                       <MenuItem key={type.value} value={type.value}>
//                         {type.label}
//                       </MenuItem>
//                     ))}
//                   </TextField>

//                   <TextField
//                     label="Email Address"
//                     name="email"
//                     type="email"
//                     fullWidth
//                     variant="outlined"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <Email />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />

//                   <TextField
//                     label="Phone Number"
//                     name="phone"
//                     type="tel"
//                     fullWidth
//                     variant="outlined"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <Phone />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />

//                   <TextField
//                     label="Password"
//                     name="password"
//                     type="password"
//                     fullWidth
//                     variant="outlined"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                   />

//                   <Button
//                     variant="contained"
//                     color="primary"
//                     type="submit"
//                     sx={{ py: 1.3, fontWeight: 600 }}
//                   >
//                     Register
//                   </Button>
//                 </Stack>
//               </form>

//               <Typography
//                 variant="body2"
//                 textAlign="center"
//                 color="text.secondary"
//               >
//                 Already have an account?{" "}
//                 <Link
//                   component="button"
//                   underline="hover"
//                   onClick={() => navigate("/login")}
//                 >
//                   Login
//                 </Link>
//               </Typography>
//             </Stack>
//           </CardContent>
//         </Card>
//       </Box>
//     </Box>
//   );
// };

// export default Register;

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
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PersonAdd, Phone, Email } from "@mui/icons-material";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../utils/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_type: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const userTypes = [
    { label: "Vendor", value: "vendor" },
    { label: "User", value: "user" },
    { label: "Marketer", value: "marketer" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_type) {
      alert("Please select a user type");
      return;
    }

    if (!formData.email || !formData.password) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_BASE_URL}/User/InsertUser`,
        formData
      );
      console.log("Register Success:", response.data);

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Register Error:", error);
      alert("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#f9f9fb",
      }}
    >
      {/* Left Image Section */}
      <Box
        sx={{
          flex: 1,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: { xs: "none", md: "block" },
        }}
      />

      {/* Right Form Section */}
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
            maxWidth: 440,
            borderRadius: 4,
            boxShadow: 5,
            p: 3,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box textAlign="center">
                <PersonAdd sx={{ fontSize: 50, color: "primary.main" }} />
                <Typography variant="h4" fontWeight={600}>
                  Create Your Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join us and start planning your perfect event 🎉
                </Typography>
              </Box>

              <Divider />

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="First Name"
                      name="first_name"
                      fullWidth
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                    <TextField
                      label="Last Name"
                      name="last_name"
                      fullWidth
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </Stack>

                  <TextField
                    select
                    label="User Type"
                    name="user_type"
                    fullWidth
                    value={formData.user_type}
                    onChange={handleChange}
                    required
                  >
                    {userTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    fullWidth
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{ py: 1.3, fontWeight: 600 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
                  </Button>
                </Stack>
              </form>

              <Typography
                variant="body2"
                textAlign="center"
                color="text.secondary"
              >
                Already have an account?{" "}
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;
