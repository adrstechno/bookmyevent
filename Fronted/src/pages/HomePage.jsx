// import React from "react";
// import {
//   Box,
//   Typography,
//   Container,
//   Button,
//   Grid,
//   Card,
//   CardContent,
// } from "@mui/material";
// import HomeNavbar from "../../src/components/layout/HomeNavbar";

// const HomePage = () => {
//   return (
//     <Box
//       sx={{
//         bgcolor: "#f8f9fa",
//         color: "#212529",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       {/* Navbar */}
//       <HomeNavbar />

//       {/* Hero Section */}
//       <Box
//         sx={{
//           py: 10,
//           textAlign: "center",
//           background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
//         }}
//       >
//         <Container maxWidth="md">
//           <Typography
//             variant="h3"
//             fontWeight="bold"
//             sx={{
//               mb: 2,
//               color: "#212529",
//               letterSpacing: 0.5,
//             }}
//           >
//             Welcome to <span style={{ color: "#495057" }}>EventSite</span> 🎉
//           </Typography>

//           <Typography
//             variant="body1"
//             color="#6c757d"
//             sx={{ mb: 4, fontSize: "1.1rem" }}
//           >
//             Simplifying event planning and vendor management with ease and
//             elegance.
//           </Typography>

//           <Button
//             variant="contained"
//             size="large"
//             sx={{
//               backgroundColor: "#343a40",
//               color: "#f8f9fa",
//               px: 4,
//               py: 1.5,
//               borderRadius: "8px",
//               fontWeight: "600",
//               "&:hover": { backgroundColor: "#212529" },
//             }}
//           >
//             Explore Services
//           </Button>
//         </Container>
//       </Box>

//       {/* Features Section */}
//       <Container sx={{ py: 8 }}>
//         <Grid container spacing={4}>
//           {[
//             {
//               title: "Trusted Vendors",
//               desc: "Connect with verified professionals for your events.",
//             },
//             {
//               title: "Seamless Booking",
//               desc: "Book services and manage your events effortlessly.",
//             },
//             {
//               title: "Personalized Experience",
//               desc: "Tailor every detail to your unique requirements.",
//             },
//           ].map((feature, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <Card
//                 sx={{
//                   bgcolor: "#e9ecef",
//                   color: "#212529",
//                   borderRadius: 3,
//                   textAlign: "center",
//                   boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
//                   transition: "all 0.3s ease",
//                   "&:hover": {
//                     transform: "translateY(-6px)",
//                     boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
//                   },
//                 }}
//               >
//                 <CardContent>
//                   <Typography
//                     variant="h6"
//                     fontWeight="bold"
//                     sx={{ mb: 1, color: "#495057" }}
//                   >
//                     {feature.title}
//                   </Typography>
//                   <Typography color="#6c757d" variant="body2">
//                     {feature.desc}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* Footer */}
//       <Box
//         sx={{
//           mt: "auto",
//           py: 3,
//           textAlign: "center",
//           bgcolor: "#212529",
//           color: "#adb5bd",
//         }}
//       >
//         <Typography variant="body2">
//           © {new Date().getFullYear()} EventSite. All rights reserved.
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// export default HomePage;

import React from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import HomeNavbar from "../../src/components/layout/HomeNavbar";

const HomePage = () => {
  const colors = {
    dark: "#353535",
    accent: "#3C6E71",
    white: "#FFFFFF",
    gray: "#D9D9D9",
    deepBlue: "#284B63",
  };

  return (
    <Box
      sx={{
        bgcolor: colors.white,
        color: colors.dark,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <HomeNavbar />

      {/* Hero Section */}
      <Box
        sx={{
          py: 10,
          textAlign: "center",
          background: `linear-gradient(135deg, ${colors.deepBlue}, ${colors.accent})`,
          color: colors.white,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              mb: 2,
              letterSpacing: 0.5,
              color: colors.white,
            }}
          >
            Welcome to <span style={{ color: colors.gray }}>EventSite</span> 🎉
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
              color: colors.gray,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Your one-stop destination for event planning, vendor management, and
            creating memorable moments — all in one platform.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: colors.white,
              color: colors.deepBlue,
              px: 4,
              py: 1.5,
              fontWeight: "600",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: colors.gray,
                color: colors.dark,
              },
            }}
          >
            Explore Services
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          sx={{ color: colors.deepBlue, mb: 4 }}
        >
          Why Choose EventSite?
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: "Verified Vendors",
              desc: "Partner with trusted, pre-verified vendors for flawless events.",
            },
            {
              title: "Smart Booking System",
              desc: "Plan, schedule, and manage event bookings with one click.",
            },
            {
              title: "Tailored Experiences",
              desc: "Customize every element to make your event truly special.",
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  bgcolor: colors.white,
                  borderRadius: 3,
                  textAlign: "center",
                  p: 1,
                  boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 1, color: colors.accent }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography color={colors.dark} variant="body2">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          backgroundColor: colors.gray,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2, color: colors.deepBlue }}
          >
            Ready to Create Your Perfect Event?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: colors.dark,
            }}
          >
            Let’s make it memorable — explore our curated list of vendors and
            services now!
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.accent,
              color: colors.white,
              px: 5,
              py: 1.5,
              borderRadius: "8px",
              "&:hover": { backgroundColor: colors.deepBlue },
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: "auto",
          py: 3,
          textAlign: "center",
          bgcolor: colors.dark,
          color: colors.gray,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} EventSite. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
