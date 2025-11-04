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
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const Admindashboard = () => {
  const stats = [
    { label: "Total Users", value: 1240, icon: <PeopleIcon color="primary" />, color: "#e3f2fd" },
    { label: "Total Events", value: 340, icon: <EventIcon color="secondary" />, color: "#f3e5f5" },
    { label: "Revenue", value: "₹1.2M", icon: <MonetizationOnIcon color="success" />, color: "#e8f5e9" },
    { label: "Growth", value: "18%", icon: <TrendingUpIcon color="warning" />, color: "#fff8e1" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Overview of your event platform’s performance
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: item.color,
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      boxShadow: 2,
                      p: 1,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
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
          boxShadow: 3,
          p: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>
          Platform Performance
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2">User Growth</Typography>
            <LinearProgress variant="determinate" value={75} color="primary" sx={{ borderRadius: 2, height: 8 }} />
          </Box>
          <Box>
            <Typography variant="body2">Events Hosted</Typography>
            <LinearProgress variant="determinate" value={60} color="secondary" sx={{ borderRadius: 2, height: 8 }} />
          </Box>
          <Box>
            <Typography variant="body2">Revenue Goal</Typography>
            <LinearProgress variant="determinate" value={82} color="success" sx={{ borderRadius: 2, height: 8 }} />
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default Admindashboard;
