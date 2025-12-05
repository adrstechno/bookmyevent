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
} from "@mui/material";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../../utils/api";

const AdminUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("user");
  const [openDropdown, setOpenDropdown] = useState(false);

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
      console.log("Error fetching users:", error);
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
                  </TableRow>
                ))}

                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
    </Box>
  );
};

export default AdminUsers;
