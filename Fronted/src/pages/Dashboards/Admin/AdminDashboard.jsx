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
