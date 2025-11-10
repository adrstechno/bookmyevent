
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { PhotoCamera, Save, Business, AccessTime } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { VITE_API_BASE_URL } from "../../../utils/api";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const VendorProfileSetup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    business_name: "",
    service_category_id: "",
    description: "",
    years_experience: "",
    contact: "",
    address: "",
    city: "",
    state: "",
    event_profiles_url: "",
    profilePicture: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [hasShift, setHasShift] = useState(false);

  const [shiftOpen, setShiftOpen] = useState(false);
  const [shiftValues, setShiftValues] = useState({
    shift_name: "",
    start_time: "09:00",
    end_time: "12:00",
    days_of_week: [],
  });
  const [shiftLoading, setShiftLoading] = useState(false);

  // ✅ Fetch all service categories
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${VITE_API_BASE_URL}/Service/GetAllServices`);
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({
            id: item.category_id,
            name: item.category_name,
          }));
          setServices(formatted);
        }
      } catch {
        toast.error("Failed to load services.");
      }
    };
    fetchServices();
  }, []);

  // ✅ Main Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateMainForm = () => {
    if (
      !formData.business_name ||
      !formData.service_category_id ||
      !formData.description ||
      !formData.contact
    ) {
      toast.error("Please fill all required fields!");
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.contact)) {
      toast.error("Enter a valid 10-digit contact number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMainForm()) return;

    try {
      setLoading(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => payload.append(key, formData[key]));

      const response = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/InsertVendor`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(response.data.message || "Vendor profile created!");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Shift Handlers
  const openShiftModal = () => setShiftOpen(true);
  const closeShiftModal = () => setShiftOpen(false);

  const handleShiftChange = (e) => {
    const { name, value } = e.target;
    setShiftValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleDaysChange = (event) => {
    const { value } = event.target;
    setShiftValues((prev) => ({
      ...prev,
      days_of_week: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const validateShift = () => {
    const { shift_name, start_time, end_time, days_of_week } = shiftValues;
    if (!shift_name.trim()) return toast.error("Shift name required.");
    if (!start_time || !end_time)
      return toast.error("Start and end time are required.");
    if (start_time >= end_time)
      return toast.error("End time must be after start time.");
    if (!days_of_week.length) return toast.error("Select at least one day.");
    return true;
  };

  // ✅ ADD SHIFT API integration (exactly like Postman)
  const saveShift = async () => {
  if (!validateShift()) return;
  setShiftLoading(true);

  try {
    // Prepare the body as JSON
    const payload = {
      shift_name: shiftValues.shift_name,
      start_time: shiftValues.start_time + ":00",
      end_time: shiftValues.end_time + ":00",
      days_of_week: shiftValues.days_of_week, // array
    };

    const res = await axios.post(
      `${VITE_API_BASE_URL}/Vendor/AddvendorShifts`,
      payload,
      {
        withCredentials: true, // 🔑 send cookies for auth_token
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.status === 201 || res.status === 200) {
      toast.success(res.data.message || "Shift added successfully!");
      setHasShift(true);
      closeShiftModal();
    } else {
      toast.error("Failed to add shift.");
    }
  } catch (err) {
    console.error("Error adding shift:", err);
    const errorMsg =
      err.response?.data?.message || "Something went wrong while adding shift.";
    toast.error(errorMsg);
  } finally {
    setShiftLoading(false);
  }
};


  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 5,
        px: 2,
      }}
    >
      {/* --- PAGE HEADER --- */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 680,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#3c6e71", letterSpacing: 0.5 }}
        >
          Vendor Profile Setup
        </Typography>

        {/* Shift Button */}
        <Button
          variant={hasShift ? "outlined" : "contained"}
          onClick={openShiftModal}
          startIcon={<AccessTime />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            color: hasShift ? "#3c6e71" : "#fff",
            borderColor: "#3c6e71",
            bgcolor: hasShift ? "#fff" : "#3c6e71",
            "&:hover": {
              bgcolor: hasShift ? "rgba(60,110,113,0.08)" : "#284b63",
            },
          }}
        >
          {hasShift ? "Edit Shift" : "Add Shift"}
        </Button>
      </Box>

      {/* --- Vendor Form --- */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 680,
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          p: { xs: 3, md: 4 },
        }}
      >
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Avatar
                src={preview}
                sx={{
                  width: 90,
                  height: 90,
                  border: "2px solid #d9d9d9",
                  bgcolor: "#fafafa",
                }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#284b63",
                  color: "#284b63",
                }}
              >
                Upload
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>
            </Stack>

            <TextField
              label="Business Name"
              name="business_name"
              fullWidth
              value={formData.business_name}
              onChange={handleChange}
              required
            />

            <TextField
              select
              label="Service Category"
              name="service_category_id"
              fullWidth
              value={formData.service_category_id || ""}
              onChange={handleChange}
              required
            >
              {services.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />

            <TextField
              label="Years of Experience"
              name="years_experience"
              type="number"
              fullWidth
              value={formData.years_experience}
              onChange={handleChange}
            />

            <TextField
              label="Contact Number"
              name="contact"
              fullWidth
              value={formData.contact}
              onChange={handleChange}
              required
            />

            <TextField
              label="Address"
              name="address"
              fullWidth
              value={formData.address}
              onChange={handleChange}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="City"
                name="city"
                fullWidth
                value={formData.city}
                onChange={handleChange}
              />
              <TextField
                label="State"
                name="state"
                fullWidth
                value={formData.state}
                onChange={handleChange}
              />
            </Stack>

            <TextField
              label="Event Profile / Social URL"
              name="event_profiles_url"
              fullWidth
              value={formData.event_profiles_url}
              onChange={handleChange}
            />

            <Button
              variant="contained"
              type="submit"
              sx={{
                py: 1.3,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                bgcolor: "#3c6e71",
                boxShadow: "0 4px 15px rgba(40,75,99,0.3)",
                "&:hover": { bgcolor: "#284b63" },
              }}
              startIcon={<Save />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Vendor Profile"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* --- Shift Modal --- */}
      <Dialog open={shiftOpen} onClose={closeShiftModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#f7fafb", color: "#284b63", fontWeight: 700 }}>
          Add Working Shift
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Shift Name"
              name="shift_name"
              value={shiftValues.shift_name}
              onChange={handleShiftChange}
              fullWidth
              required
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Start Time"
                name="start_time"
                type="time"
                value={shiftValues.start_time}
                onChange={handleShiftChange}
                fullWidth
              />
              <TextField
                label="End Time"
                name="end_time"
                type="time"
                value={shiftValues.end_time}
                onChange={handleShiftChange}
                fullWidth
              />
            </Stack>
            <FormControl fullWidth>
              <InputLabel id="days-label">Days of Week</InputLabel>
              <Select
                labelId="days-label"
                multiple
                value={shiftValues.days_of_week}
                onChange={handleDaysChange}
                input={<OutlinedInput label="Days of Week" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {weekdays.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Checkbox checked={shiftValues.days_of_week.indexOf(day) > -1} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeShiftModal} sx={{ color: "#777" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveShift}
            disabled={shiftLoading}
            sx={{
              bgcolor: "#3c6e71",
              "&:hover": { bgcolor: "#284b63" },
              color: "#fff",
            }}
          >
            {shiftLoading ? <CircularProgress color="inherit" size={20} /> : "Save Shift"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorProfileSetup;
