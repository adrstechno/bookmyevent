import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Stack,
  Divider,
} from "@mui/material";

const AdminUsers = () => {
  const users = [
    {
      id: 1,
      name: "Aarav Mehta",
      email: "aarav@example.com",
      role: "Customer",
      date: "12 Oct 2025",
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "Vendor",
      date: "08 Oct 2025",
      status: "Pending",
    },
    {
      id: 3,
      name: "Rohan Patel",
      email: "rohan@example.com",
      role: "Customer",
      date: "22 Sep 2025",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Ananya Rao",
      email: "ananya@example.com",
      role: "Vendor",
      date: "10 Sep 2025",
      status: "Active",
    },
  ];

  const bookings = [
    {
      id: 1,
      event: "Wedding Ceremony",
      client: "Aarav Mehta",
      vendor: "Elegant Decorators",
      date: "15 Nov 2025",
      status: "Confirmed",
    },
    {
      id: 2,
      event: "Corporate Meetup",
      client: "Priya Sharma",
      vendor: "Catering Pro",
      date: "20 Nov 2025",
      status: "Pending",
    },
  ];

  const statusColor = {
    Active: "success",
    Inactive: "error",
    Pending: "warning",
    Confirmed: "success",
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} sx={{ color: "#212529" }} gutterBottom>
        User Management
      </Typography>
      <Typography variant="body2" color="#6c757d" mb={4}>
        Manage registered users and view vendor bookings.
      </Typography>

      {/* Users Table */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.06)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: "#212529" }}>
            Registered Users
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff", borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e9ecef" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                        transition: "0.2s ease",
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: "#dee2e6", color: "#212529", fontWeight: 600 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={600} color="#212529">
                          {user.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={statusColor[user.status]}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          mt: 5,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: "#212529" }}>
            Recent Vendor Bookings
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff", borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e9ecef" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow
                    key={b.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                        transition: "0.2s ease",
                      },
                    }}
                  >
                    <TableCell>{b.event}</TableCell>
                    <TableCell>{b.client}</TableCell>
                    <TableCell>{b.vendor}</TableCell>
                    <TableCell>{b.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        color={statusColor[b.status]}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminUsers;
