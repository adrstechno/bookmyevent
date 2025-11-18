import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  MenuItem,
  FormControl,
  Select,
  OutlinedInput,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Add, Search, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from "axios";
import toast from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../../utils/api";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const parseDays = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    // value might be JSON string like '["Mon","Tue"]' or comma separated "Mon,Tue"
    if (typeof value === "string") {
      const trimmed = value.trim();
      if ((trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        return JSON.parse(trimmed);
      }
      return trimmed.split(",").map((d) => d.trim()).filter(Boolean);
    }
  } catch {
    return [];
  }
  return [];
};

const timeToMinutes = (timeStr) => {
  // accepts "HH:MM:SS" or "HH:MM"
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  const hh = parseInt(parts[0] || "0", 10);
  const mm = parseInt(parts[1] || "0", 10);
  return hh * 60 + mm;
};

const VendorShiftPage = () => {


  const [vendorShifts, setVendorShifts] = useState([]); // vendor-specific shifts
  const [vendorLoading, setVendorLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [shift, setShift] = useState({
    shift_id: "",
    shift_name: "",
    start_time: "09:00",
    end_time: "12:00",
    days_of_week: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc' for start_time

  // Fetch vendor-specific shifts (shows "My Shifts")
  const fetchVendorShifts = async () => {
    setVendorLoading(true);
    try {
      const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getVendorShiftforVendor`, { withCredentials: true });
      const raw = res.data;
      const extracted =
        raw?.data || raw?.shifts || raw?.vendorShifts || raw?.Data || (Array.isArray(raw) ? raw : []);
      setVendorShifts(Array.isArray(extracted) ? extracted : []);
    } catch (err) {
      console.error("fetchVendorShifts err:", err);
      toast.error("Failed to fetch vendor shifts");
    } finally {
      setVendorLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OPEN ADD
  const handleOpenAdd = () => {
    setIsEdit(false);
    setShift({
      shift_id: "",
      shift_name: "",
      start_time: "09:00",
      end_time: "12:00",
      days_of_week: [],
    });
    setOpen(true);
  };

  // OPEN EDIT
  const handleOpenEdit = (s) => {
    setIsEdit(true);
    setShift({
      shift_id: s.shift_id ?? s.id ?? "",
      shift_name: s.shift_name ?? s.name ?? "",
      start_time: (s.start_time || "09:00").slice(0, 5),
      end_time: (s.end_time || "12:00").slice(0, 5),
      days_of_week: parseDays(s.days_of_week),
    });
    setOpen(true);
  };

  // SAVE (ADD / UPDATE)
  const handleSave = async () => {
    if (!shift.shift_name.trim()) return toast.error("Shift name required");
    if (!shift.days_of_week.length) return toast.error("Select days");
    if (shift.start_time >= shift.end_time)
      return toast.error("Start time must be before end time");

    try {
      const payload = new URLSearchParams();
      if (isEdit) payload.append("shift_id", shift.shift_id);
      payload.append("shift_name", shift.shift_name);
      payload.append("start_time", shift.start_time + ":00");
      payload.append("end_time", shift.end_time + ":00");
      payload.append("days_of_week", JSON.stringify(shift.days_of_week));

      if (isEdit) {
        await axios.post(`${VITE_API_BASE_URL}/Vendor/updateVendorShiftbyId`, payload, { withCredentials: true });
        toast.success("Shift updated");
      } else {
        await axios.post(`${VITE_API_BASE_URL}/Vendor/AddvendorShifts`, payload, { withCredentials: true });
        toast.success("Shift added");
      }

      setOpen(false);
      // refresh vendor shifts
      fetchVendorShifts();
    } catch (err) {
      console.error("handleSave err:", err);
      toast.error("Failed to save shift");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
  try {
    await axios.get(
      `${VITE_API_BASE_URL}/Vendor/deleteVendorShiftbyId`,
      {
        params: { shift_id: id },
        withCredentials: true,
      }
    );

    toast.success("Shift deleted!");
    fetchVendorShifts();

  } catch (err) {
    console.error("handleDelete err:", err.response?.data || err);
    toast.error("Failed to delete shift");
  }
};


  // Search + Sort logic (applied to displayed arrays)
  const filterAndSort = (list) => {
    const lowered = searchTerm.trim().toLowerCase();

    let filtered = list.filter((s) => {
      const name = (s.shift_name || s.name || "").toString().toLowerCase();
      const days = Array.isArray(s.days_of_week)
        ? s.days_of_week.join(" ")
        : (s.days_of_week || "").toString();
      const daysLower = days.toLowerCase();
      const time = (s.start_time || s.start || "").toString();
      return (
        !lowered ||
        name.includes(lowered) ||
        daysLower.includes(lowered) ||
        time.includes(lowered)
      );
    });

    filtered.sort((a, b) => {
      const ta = timeToMinutes((a.start_time || a.start || "00:00").slice(0, 5));
      const tb = timeToMinutes((b.start_time || b.start || "00:00").slice(0, 5));
      return sortOrder === "asc" ? ta - tb : tb - ta;
    });

    return filtered;
  };

  const displayedVendorShifts = filterAndSort(vendorShifts);

  const toggleSort = () => setSortOrder((s) => (s === "asc" ? "desc" : "asc"));

  return (
    <Box sx={{ px: 3, py: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Vendor Shifts
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search by name / days / time"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Button onClick={handleOpenAdd} variant="contained" startIcon={<Add />} sx={{ bgcolor: "#3c6e71" }}>
            Add Shift
          </Button>
        </Stack>
      </Stack>

      {/* Vendor Shifts Table */}
      <Box mb={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight={700}>
            My Vendor Shifts
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button onClick={toggleSort} variant="outlined" startIcon={sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}>
              Sort by Start Time ({sortOrder === "asc" ? "ASC" : "DESC"})
            </Button>
          </Stack>
        </Stack>

        {vendorLoading ? (
          <Box textAlign="center"><CircularProgress /></Box>
        ) : displayedVendorShifts.length === 0 ? (
          <Typography>No vendor shifts found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#e8e8e8" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Shift Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayedVendorShifts.map((s) => (
                  <TableRow key={s.shift_id ?? s.id} hover>
                    <TableCell>{s.shift_name}</TableCell>
                    <TableCell>{(s.start_time || "").slice(0, 5)} - {(s.end_time || "").slice(0, 5)}</TableCell>
                    <TableCell>{parseDays(s.days_of_week).join(", ")}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEdit(s)}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: '#3c6e71', 
                              color: 'white',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s'
                            } 
                          }}
                        >
                          <FiEdit3 size={20} />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(s.shift_id ?? s.id)}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: '#d32f2f', 
                              color: 'white',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s'
                            } 
                          }}
                        >
                          <RiDeleteBin6Line size={20} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Only showing vendor shifts (My Shifts) */}

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Edit Shift" : "Add Shift"}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Shift Name"
              value={shift.shift_name}
              onChange={(e) => setShift({ ...shift, shift_name: e.target.value })}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                type="time"
                label="Start Time"
                value={shift.start_time}
                onChange={(e) => setShift({ ...shift, start_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                type="time"
                label="End Time"
                value={shift.end_time}
                onChange={(e) => setShift({ ...shift, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <FormControl fullWidth>
              <Select
                multiple
                value={shift.days_of_week}
                onChange={(e) =>
                  setShift({
                    ...shift,
                    days_of_week:
                      typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value,
                  })
                }
                input={<OutlinedInput />}
                renderValue={(selected) => selected.join(", ")}
              >
                {weekdays.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Checkbox checked={shift.days_of_week.includes(day)} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#3c6e71" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorShiftPage;
