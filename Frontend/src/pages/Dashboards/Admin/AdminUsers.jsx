import React, { useEffect, useState } from "react";
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
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from "@mui/material";
import { X, Mail, Phone, MapPin, Calendar, Briefcase, Award, FileText, Trash2, Ban, Edit } from "lucide-react";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../../utils/api";

const AdminUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("user");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const PRIMARY = "#3C6E71";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const { data } = await axios.get(`${VITE_API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(data.users || []);
    } catch (error) {
      // console.log("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const filtered = allUsers.filter(
      (u) => u.user_type?.toLowerCase() === roleFilter.toLowerCase()
    );
    setFilteredUsers(filtered);
    setPage(1);
  }, [roleFilter, allUsers]);

  const paginatedData = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      // Add delete functionality here
      console.log("Delete user:", selectedUser);
      // You can add API call here to delete the user
      alert(`Delete user: ${selectedUser.first_name} ${selectedUser.last_name}`);
    }
  };

  const handleBlockUser = () => {
    if (selectedUser) {
      // Add block/unblock functionality here
      const action = selectedUser.is_active ? "Block" : "Unblock";
      console.log(`${action} user:`, selectedUser);
      // You can add API call here to block/unblock the user
      alert(`${action} user: ${selectedUser.first_name} ${selectedUser.last_name}`);
    }
  };

  const handleEditUser = () => {
    if (selectedUser) {
      // Add edit functionality here
      console.log("Edit user:", selectedUser);
      // You can navigate to edit page or open edit modal
      alert(`Edit user: ${selectedUser.first_name} ${selectedUser.last_name}`);
    }
  };

  const copyToClipboard = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setSnackMsg(`${label} copied`);
      setSnackOpen(true);
    } catch (e) {
      setSnackMsg("Copy failed");
      setSnackOpen(true);
    }
  };

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <Box>
        {/* Header Section with Avatar and Basic Info */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
            borderRadius: "20px",
            p: 4,
            mb: 4,
            mt: 2,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(60, 110, 113, 0.3)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-30%",
              left: "-5%",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
            },
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: "#fff",
                  color: PRIMARY,
                  fontSize: "3rem",
                  fontWeight: 700,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                  border: "5px solid rgba(255,255,255,0.4)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                {selectedUser.first_name?.charAt(0) || "U"}
              </Avatar>
              {/* Status Badge on Avatar */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 5,
                  right: 5,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: selectedUser.is_active ? "#4caf50" : "#f44336",
                  border: "3px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              />
            </Box>
            <Box sx={{ textAlign: { xs: "center", sm: "left" }, flex: 1 }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: "#fff", mb: 1.5, letterSpacing: "-0.5px" }}>
                {selectedUser.first_name} {selectedUser.last_name}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: { xs: "center", sm: "flex-start" }, flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label={selectedUser.user_type?.toUpperCase()}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.3)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    px: 1,
                  }}
                />
                <Chip
                  label={selectedUser.is_active ? "● Active" : "● Inactive"}
                  sx={{
                    bgcolor: selectedUser.is_active ? "rgba(76, 175, 80, 0.9)" : "rgba(244, 67, 54, 0.9)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    px: 1,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
                <Chip
                  label={selectedUser.is_verified ? "✓ Verified" : "⚠ Not Verified"}
                  sx={{
                    bgcolor: selectedUser.is_verified ? "rgba(33, 150, 243, 0.9)" : "rgba(255, 152, 0, 0.9)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    px: 1,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Contact Information Card */}
        <Card
          sx={{
            mb: 3,
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "none",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            },
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(90deg, ${PRIMARY} 0%, #2d5558 100%)`,
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <Mail size={22} color="#fff" />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#fff", letterSpacing: "0.5px" }}>
              Contact Information
            </Typography>
          </Box>

          <CardContent sx={{ p: 3, bgcolor: "#fafafa" }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "14px",
                    bgcolor: "#fff",
                    border: "2px solid #e3f2fd",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: PRIMARY,
                      transform: "translateX(5px)",
                      boxShadow: "0 6px 20px rgba(60, 110, 113, 0.15)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(60, 110, 113, 0.3)",
                      }}
                    >
                      <Mail size={24} color="#fff" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#9e9e9e",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                          letterSpacing: "1px",
                        }}
                      >
                        Email Address
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{
                          color: "#212529",
                          wordBreak: "break-word",
                          fontSize: "0.95rem",
                          mt: 0.5,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>{selectedUser.email}</span>
                          <Tooltip title="Copy email">
                            <IconButton size="small" onClick={() => copyToClipboard(selectedUser.email, "Email") }>
                              <FileText size={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "14px",
                    bgcolor: "#fff",
                    border: "2px solid #e3f2fd",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: PRIMARY,
                      transform: "translateX(5px)",
                      boxShadow: "0 6px 20px rgba(60, 110, 113, 0.15)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100())`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(60, 110, 113, 0.3)",
                      }}
                    >
                      <Phone size={24} color="#fff" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#9e9e9e",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                          letterSpacing: "1px",
                        }}
                      >
                        Phone Number
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{
                          color: "#212529",
                          fontSize: "0.95rem",
                          mt: 0.5,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>{selectedUser.phone || "Not Provided"}</span>
                          {selectedUser.phone && (
                            <Tooltip title="Copy phone">
                              <IconButton size="small" onClick={() => copyToClipboard(selectedUser.phone, "Phone") }>
                                <FileText size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "14px",
                    bgcolor: "#fff",
                    border: "2px solid #e3f2fd",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: PRIMARY,
                      transform: "translateX(5px)",
                      boxShadow: "0 6px 20px rgba(60, 110, 113, 0.15)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(60, 110, 113, 0.3)",
                      }}
                    >
                      <Calendar size={24} color="#fff" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#9e9e9e",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                          letterSpacing: "1px",
                        }}
                      >
                        Member Since
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{
                          color: "#212529",
                          fontSize: "0.95rem",
                          mt: 0.5,
                        }}
                      >
                        {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Vendor Specific Information */}
        {roleFilter === "vendor" && (
          <Card
            sx={{
              mb: 3,
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "none",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <Box
              sx={{
                background: `linear-gradient(90deg, ${PRIMARY} 0%, #2d5558 100%)`,
                p: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Briefcase size={22} color="#fff" />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#fff", letterSpacing: "0.5px" }}>
                Business Information
              </Typography>
            </Box>

            <CardContent sx={{ p: 3, bgcolor: "#fafafa" }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "14px",
                      bgcolor: "#fff",
                      border: "2px solid #e3f2fd",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: PRIMARY,
                        transform: "translateX(5px)",
                        boxShadow: "0 6px 20px rgba(60, 110, 113, 0.15)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "12px",
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(60, 110, 113, 0.3)",
                        }}
                      >
                        <Briefcase size={24} color="#fff" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9e9e9e",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                            letterSpacing: "1px",
                          }}
                        >
                          Business Name
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{
                            color: "#212529",
                            fontSize: "0.95rem",
                            mt: 0.5,
                          }}
                        >
                          {selectedUser.business_name || "Not Provided"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "14px",
                      bgcolor: "#fff",
                      border: "2px solid #e3f2fd",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: PRIMARY,
                        transform: "translateX(5px)",
                        boxShadow: "0 6px 20px rgba(60, 110, 113, 0.15)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "12px",
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(60, 110, 113, 0.3)",
                        }}
                      >
                        <Award size={24} color="#fff" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9e9e9e",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                            letterSpacing: "1px",
                          }}
                        >
                          Experience
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{
                            color: "#212529",
                            fontSize: "0.95rem",
                            mt: 0.5,
                          }}
                        >
                          {selectedUser.years_experience || "0"} Years
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "14px",
                      bgcolor: "#fff",
                      border: "2px solid #e3f2fd",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: PRIMARY,
                        transform: "translateX(5px)",
                        boxShadow: "0 6px 20px rgba(60, 110, 113, 0.15)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "12px",
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(60, 110, 113, 0.3)",
                        }}
                      >
                        <MapPin size={24} color="#fff" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9e9e9e",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                            letterSpacing: "1px",
                          }}
                        >
                          Business Address
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{
                            color: "#212529",
                            mb: 0.5,
                            fontSize: "0.95rem",
                            mt: 0.5,
                          }}
                        >
                          {selectedUser.address || "Not Provided"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#757575", fontSize: "0.85rem" }}>
                          {selectedUser.city && selectedUser.state
                            ? `${selectedUser.city}, ${selectedUser.state}`
                            : "Location not specified"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "14px",
                      bgcolor: "#fff",
                      border: "2px solid #e3f2fd",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: PRIMARY,
                        transform: "translateX(5px)",
                        boxShadow: "0 6px 20px rgba(60, 110, 113, 0.15)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "12px",
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(60, 110, 113, 0.3)",
                        }}
                      >
                        <FileText size={24} color="#fff" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9e9e9e",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                            letterSpacing: "1px",
                          }}
                        >
                          Business Description
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#424242",
                            lineHeight: 1.8,
                            mt: 1,
                            fontSize: "0.95rem",
                          }}
                        >
                          {selectedUser.description || "No description available"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

        {/* Recent Activity */}
        <Card sx={{ mb: 3, borderRadius: "12px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#fff' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Recent Activity</Typography>
          </Box>
          <CardContent sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Calendar size={18} />
                </ListItemIcon>
                <ListItemText primary={selectedUser.last_login ? `Last login: ${new Date(selectedUser.last_login).toLocaleString()}` : 'Last login: -'} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Award size={18} />
                </ListItemIcon>
                <ListItemText primary={`Total bookings: ${selectedUser.total_bookings ?? 0}`} />
              </ListItem>
              {selectedUser.recent_bookings && selectedUser.recent_bookings.length > 0 ? (
                selectedUser.recent_bookings.slice(0,3).map((b, i) => (
                  <ListItem key={i}>
                    <ListItemIcon>
                      <FileText size={16} />
                    </ListItemIcon>
                    <ListItemText primary={`${b.title || 'Booking'} • ${new Date(b.date).toLocaleDateString()}`} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent bookings" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER */}
      {/* FILTER (Responsive) */}
<Stack
  direction={{ xs: "column", sm: "row" }}
  spacing={2}
  alignItems={{ xs: "stretch", sm: "center" }}
  sx={{ width: { xs: "100%", sm: "auto" } }}
>

  {/* BUTTONS FOR DESKTOP */}
  <Stack
    direction="row"
    spacing={2}
    sx={{ display: { xs: "none", sm: "flex" } }}
  >
    <Button
      variant={roleFilter === "user" ? "contained" : "outlined"}
      onClick={() => setRoleFilter("user")}
      sx={{
        backgroundColor: roleFilter === "user" ? PRIMARY : "transparent",
        color: roleFilter === "user" ? "#fff" : PRIMARY,
        borderColor: PRIMARY,
        "&:hover": {
          backgroundColor: roleFilter === "user" ? "#31575A" : "#e9ecef",
        },
      }}
    >
      Users
    </Button>

    <Button
      variant={roleFilter === "vendor" ? "contained" : "outlined"}
      onClick={() => setRoleFilter("vendor")}
      sx={{
        backgroundColor: roleFilter === "vendor" ? PRIMARY : "transparent",
        color: roleFilter === "vendor" ? "#fff" : PRIMARY,
        borderColor: PRIMARY,
        "&:hover": {
          backgroundColor: roleFilter === "vendor" ? "#31575A" : "#e9ecef",
        },
      }}
    >
      Vendors
    </Button>
  </Stack>

  {/* DROPDOWN FOR MOBILE */}
  {/* MOBILE FILTER DROPDOWN — TAILWIND CUSTOM ATTRACTIVE */}
{/* MOBILE FILTER DROPDOWN — CUSTOM TAILWIND, NO SELECT TAG */}
<Box
  sx={{
    display: { xs: "block", sm: "none" },
    width: "100%",
    marginTop: "10px",
  }}
>
  <div className="relative w-full">

    {/* Dropdown Button */}
    <div
      onClick={() => setOpenDropdown(!openDropdown)}
      className="
        w-full 
        px-4 
        py-3 
        bg-white 
        border 
        rounded-xl 
        cursor-pointer 
        shadow-md
        flex 
        justify-between 
        items-center
      "
      style={{
        borderColor: "#3C6E71",
        color: "#3C6E71",
        fontWeight: 600,
      }}
    >
      {roleFilter === "user" ? "Users" : "Vendors"}

      {/* Arrow Icon */}
      <svg
        className={`transition-transform duration-200 ${
          openDropdown ? "rotate-180" : ""
        }`}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3C6E71"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>

    {/* Dropdown Menu */}
    {openDropdown && (
      <div
        className="
          absolute 
          left-0 
          mt-2 
          w-full 
          bg-white 
          rounded-xl 
          shadow-xl 
          z-50
          border
        "
        style={{ borderColor: "#3C6E71" }}
      >
        {/* Users */}
        <div
          onClick={() => {
            setRoleFilter("user");
            setOpenDropdown(false);
          }}
          className="
            px-4 
            py-3 
            cursor-pointer 
            font-semibold 
            hover:bg-gray-100
          "
          style={{ color: "#3C6E71" }}
        >
          Users
        </div>

        {/* Vendors */}
        <div
          onClick={() => {
            setRoleFilter("vendor");
            setOpenDropdown(false);
          }}
          className="
            px-4 
            py-3 
            cursor-pointer 
            font-semibold 
            hover:bg-gray-100
          "
          style={{ color: "#3C6E71" }}
        >
          Vendors
        </div>
      </div>
    )}
  </div>
</Box>


</Stack>


      {/* TABLE */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.06)", mt: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2, color: PRIMARY }}
          >
            {roleFilter === "user" ? "Users" : "Vendors"} List
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#e9ecef" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData.map((user, index) => (
                  <TableRow
                    key={user.user_id || index}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                        transition: "0.2s ease",
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: PRIMARY, color: "#fff" }}>
                          {user.first_name?.charAt(0) || "U"}
                        </Avatar>
                        <Typography fontWeight={600}>
                          {(user.first_name || "") + " " + (user.last_name || "")}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>

                    <TableCell>
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        color={user.is_active ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(user)}
                        sx={{
                          color: PRIMARY,
                          borderColor: PRIMARY,
                          "&:hover": {
                            backgroundColor: PRIMARY,
                            color: "#fff",
                            borderColor: PRIMARY,
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography>No records found.</Typography>
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION (original style — only color changed) */}
          <Stack direction="row" justifyContent="center" mt={3}>
            <Pagination
              count={Math.ceil(filteredUsers.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: PRIMARY,
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: PRIMARY,
                  color: "#fff",
                },
                "& .MuiPaginationItem-root.Mui-selected:hover": {
                  backgroundColor: "#31575A",
                },
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d5558 100%)`,
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2.5,
            px: 3,
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {roleFilter === "user" ? "👤 User" : "💼 Vendor"} Profile
          </Typography>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
                transform: "rotate(90deg)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <X size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>{renderUserDetails()}</DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: "#fff",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "flex-start",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* Action buttons - All disabled */}
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button
              onClick={handleEditUser}
              variant="contained"
              size="large"
              startIcon={<Edit size={20} />}
              sx={{
                bgcolor: PRIMARY,
                color: "#fff",
                px: 3,
                py: 1.5,
                borderRadius: "10px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "#31575A",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(49,87,90,0.25)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Edit
            </Button>

            <Button
              onClick={handleBlockUser}
              variant="outlined"
              size="large"
              startIcon={<Ban size={20} />}
              sx={{
                color: selectedUser?.is_active ? "#ed6c02" : "#2e7d32",
                borderColor: selectedUser?.is_active ? "#ed6c02" : "#2e7d32",
                px: 3,
                py: 1.5,
                borderRadius: "10px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: selectedUser?.is_active ? "#ed6c02" : "#2e7d32",
                  color: "#fff",
                  borderColor: selectedUser?.is_active ? "#ed6c02" : "#2e7d32",
                  transform: "translateY(-2px)",
                  boxShadow: selectedUser?.is_active
                    ? "0 6px 16px rgba(237, 108, 2, 0.3)"
                    : "0 6px 16px rgba(46, 125, 50, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {selectedUser?.is_active ? "Block" : "Unblock"}
            </Button>

            <Button
              onClick={handleDeleteUser}
              variant="outlined"
              size="large"
              startIcon={<Trash2 size={20} />}
              sx={{
                color: "#d32f2f",
                borderColor: "#d32f2f",
                px: 3,
                py: 1.5,
                borderRadius: "10px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "#d32f2f",
                  color: "#fff",
                  borderColor: "#d32f2f",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(211, 47, 47, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Delete
            </Button>
          </Stack>
        </DialogActions>
        <Snackbar
          open={snackOpen}
          autoHideDuration={2000}
          onClose={() => setSnackOpen(false)}
          message={snackMsg}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
