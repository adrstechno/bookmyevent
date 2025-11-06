// // import React from "react";
// // import {
// //   Box,
// //   Grid,
// //   Card,
// //   CardContent,
// //   Typography,
// //   LinearProgress,
// //   Avatar,
// //   Stack,
// //   Divider,
// // } from "@mui/material";
// // import DashboardIcon from "@mui/icons-material/Dashboard";
// // import PeopleIcon from "@mui/icons-material/People";
// // import EventIcon from "@mui/icons-material/Event";
// // import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// // import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

// // const Admindashboard = () => {
// //   const stats = [
// //     { label: "Total Users", value: 1240, icon: <PeopleIcon color="primary" />, color: "#e3f2fd" },
// //     { label: "Total Events", value: 340, icon: <EventIcon color="secondary" />, color: "#f3e5f5" },
// //     { label: "Revenue", value: "₹1.2M", icon: <MonetizationOnIcon color="success" />, color: "#e8f5e9" },
// //     { label: "Growth", value: "18%", icon: <TrendingUpIcon color="warning" />, color: "#fff8e1" },
// //   ];

// //   return (
// //     <Box sx={{ p: 3 }}>
// //       {/* Header */}
// //       <Typography variant="h4" fontWeight={600} gutterBottom>
// //         Admin Dashboard
// //       </Typography>
// //       <Typography variant="body2" color="text.secondary" mb={4}>
// //         Overview of your event platform’s performance
// //       </Typography>

// //       {/* Stats Cards */}
// //       <Grid container spacing={3}>
// //         {stats.map((item, index) => (
// //           <Grid item xs={12} sm={6} md={3} key={index}>
// //             <Card
// //               sx={{
// //                 borderRadius: 3,
// //                 boxShadow: 3,
// //                 bgcolor: item.color,
// //                 transition: "0.3s",
// //                 "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
// //               }}
// //             >
// //               <CardContent>
// //                 <Stack direction="row" alignItems="center" spacing={2}>
// //                   <Avatar
// //                     sx={{
// //                       bgcolor: "white",
// //                       color: "primary.main",
// //                       boxShadow: 2,
// //                       p: 1,
// //                     }}
// //                   >
// //                     {item.icon}
// //                   </Avatar>
// //                   <Box>
// //                     <Typography variant="subtitle2" color="text.secondary">
// //                       {item.label}
// //                     </Typography>
// //                     <Typography variant="h5" fontWeight={700}>
// //                       {item.value}
// //                     </Typography>
// //                   </Box>
// //                 </Stack>
// //               </CardContent>
// //             </Card>
// //           </Grid>
// //         ))}
// //       </Grid>

// //       {/* Performance Section */}
// //       <Card
// //         sx={{
// //           mt: 5,
// //           borderRadius: 3,
// //           boxShadow: 3,
// //           p: 3,
// //         }}
// //       >
// //         <Typography variant="h6" fontWeight={600} mb={2}>
// //           Platform Performance
// //         </Typography>
// //         <Divider sx={{ mb: 2 }} />
// //         <Stack spacing={3}>
// //           <Box>
// //             <Typography variant="body2">User Growth</Typography>
// //             <LinearProgress variant="determinate" value={75} color="primary" sx={{ borderRadius: 2, height: 8 }} />
// //           </Box>
// //           <Box>
// //             <Typography variant="body2">Events Hosted</Typography>
// //             <LinearProgress variant="determinate" value={60} color="secondary" sx={{ borderRadius: 2, height: 8 }} />
// //           </Box>
// //           <Box>
// //             <Typography variant="body2">Revenue Goal</Typography>
// //             <LinearProgress variant="determinate" value={82} color="success" sx={{ borderRadius: 2, height: 8 }} />
// //           </Box>
// //         </Stack>
// //       </Card>
// //     </Box>
// //   );
// // };

// // export default Admindashboard;

// import React from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   LinearProgress,
//   Avatar,
//   Stack,
//   Divider,
// } from "@mui/material";
// import PeopleIcon from "@mui/icons-material/People";
// import EventIcon from "@mui/icons-material/Event";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

// const Admindashboard = () => {
//   const stats = [
//     {
//       label: "Total Users",
//       value: 1240,
//       icon: <PeopleIcon />,
//       bg: "linear-gradient(135deg, #f8f9fa, #dee2e6)",
//       iconColor: "#495057",
//     },
//     {
//       label: "Total Events",
//       value: 340,
//       icon: <EventIcon />,
//       bg: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
//       iconColor: "#495057",
//     },
//     {
//       label: "Revenue",
//       value: "₹1.2M",
//       icon: <MonetizationOnIcon />,
//       bg: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
//       iconColor: "#495057",
//     },
//     {
//       label: "Growth",
//       value: "18%",
//       icon: <TrendingUpIcon />,
//       bg: "linear-gradient(135deg, #f8f9fa, #dee2e6)",
//       iconColor: "#495057",
//     },
//   ];

//   return (
//     <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <Typography
//           variant="h4"
//           fontWeight={700}
//           sx={{
//             color: "#212529",
//             letterSpacing: 0.5,
//           }}
//           gutterBottom
//         >
//           Admin Dashboard
//         </Typography>
//         <Typography variant="body2" color="#6c757d">
//           Overview of your event platform’s performance
//         </Typography>
//       </Box>

//       {/* Stats Cards */}
//       <Grid container spacing={3}>
//         {stats.map((item, index) => (
//           <Grid item xs={12} sm={6} md={3} key={index}>
//             <Card
//               sx={{
//                 background: item.bg,
//                 borderRadius: 3,
//                 boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
//                 transition: "0.3s ease",
//                 "&:hover": {
//                   boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
//                   transform: "translateY(-5px)",
//                 },
//               }}
//             >
//               <CardContent>
//                 <Stack direction="row" alignItems="center" spacing={2}>
//                   <Avatar
//                     sx={{
//                       bgcolor: "#fff",
//                       color: item.iconColor,
//                       boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                       p: 1.2,
//                     }}
//                   >
//                     {item.icon}
//                   </Avatar>
//                   <Box>
//                     <Typography
//                       variant="subtitle2"
//                       color="#6c757d"
//                       sx={{ fontWeight: 500 }}
//                     >
//                       {item.label}
//                     </Typography>
//                     <Typography
//                       variant="h5"
//                       fontWeight={700}
//                       sx={{ color: "#212529" }}
//                     >
//                       {item.value}
//                     </Typography>
//                   </Box>
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Performance Section */}
//       <Card
//         sx={{
//           mt: 5,
//           borderRadius: 3,
//           boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
//           bgcolor: "#ffffff",
//           p: 4,
//         }}
//       >
//         <Typography
//           variant="h6"
//           fontWeight={700}
//           mb={2}
//           sx={{ color: "#212529", letterSpacing: 0.3 }}
//         >
//           Platform Performance
//         </Typography>
//         <Divider sx={{ mb: 3, borderColor: "#dee2e6" }} />

//         <Stack spacing={3}>
//           <Box>
//             <Typography variant="body2" sx={{ mb: 0.8, color: "#495057" }}>
//               User Growth
//             </Typography>
//             <LinearProgress
//               variant="determinate"
//               value={75}
//               sx={{
//                 height: 8,
//                 borderRadius: 2,
//                 backgroundColor: "#dee2e6",
//                 "& .MuiLinearProgress-bar": { backgroundColor: "#495057" },
//               }}
//             />
//           </Box>

//           <Box>
//             <Typography variant="body2" sx={{ mb: 0.8, color: "#495057" }}>
//               Events Hosted
//             </Typography>
//             <LinearProgress
//               variant="determinate"
//               value={60}
//               sx={{
//                 height: 8,
//                 borderRadius: 2,
//                 backgroundColor: "#dee2e6",
//                 "& .MuiLinearProgress-bar": { backgroundColor: "#6c757d" },
//               }}
//             />
//           </Box>

//           <Box>
//             <Typography variant="body2" sx={{ mb: 0.8, color: "#495057" }}>
//               Revenue Goal
//             </Typography>
//             <LinearProgress
//               variant="determinate"
//               value={82}
//               sx={{
//                 height: 8,
//                 borderRadius: 2,
//                 backgroundColor: "#dee2e6",
//                 "& .MuiLinearProgress-bar": { backgroundColor: "#343a40" },
//               }}
//             />
//           </Box>
//         </Stack>
//       </Card>
//     </Box>
//   );
// };

// export default Admindashboard;

import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

// 🎨 Theme Palette
const colors = {
  dark: "#353535",
  accent: "#3C6E71",
  light: "#FFFFFF",
  softGrey: "#D9D9D9",
  deepBlue: "#284B63",
};

const Admindashboard = () => {
  const stats = [
    {
      label: "Total Users",
      value: 1240,
      icon: <PeopleIcon sx={{ color: colors.light }} />,
      bg: colors.deepBlue,
    },
    {
      label: "Total Events",
      value: 340,
      icon: <EventIcon sx={{ color: colors.light }} />,
      bg: colors.accent,
    },
    {
      label: "Revenue",
      value: "₹1.2M",
      icon: <MonetizationOnIcon sx={{ color: colors.light }} />,
      bg: colors.dark,
    },
    {
      label: "Growth",
      value: "18%",
      icon: <TrendingUpIcon sx={{ color: colors.light }} />,
      bg: colors.softGrey,
      textColor: colors.dark,
    },
  ];

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: colors.light,
        minHeight: "100vh",
        color: colors.dark,
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: colors.deepBlue }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A quick snapshot of your event platform’s performance.
        </Typography>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                bgcolor: item.bg,
                color: item.textColor || colors.light,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      color: colors.light,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={500}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {item.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Section */}
      <Card
        sx={{
          mt: 5,
          borderRadius: 3,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          p: 3,
          bgcolor: colors.softGrey,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ color: colors.deepBlue, mb: 2 }}
        >
          Platform Performance
        </Typography>
        <Divider sx={{ mb: 3, borderColor: colors.deepBlue, opacity: 0.3 }} />

        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" sx={{ color: colors.dark }}>
              User Growth
            </Typography>
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#B0BEC5",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: colors.accent,
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: colors.dark }}>
              Events Hosted
            </Typography>
            <LinearProgress
              variant="determinate"
              value={60}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#B0BEC5",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: colors.deepBlue,
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: colors.dark }}>
              Revenue Goal
            </Typography>
            <LinearProgress
              variant="determinate"
              value={82}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#B0BEC5",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: colors.dark,
                },
              }}
            />
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default Admindashboard;
