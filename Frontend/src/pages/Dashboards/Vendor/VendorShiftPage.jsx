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
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add, Search, ArrowUpward, ArrowDownward, ArrowBack } from "@mui/icons-material";
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
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
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
  if (!timeStr) return 0;
  const [h = 0, m = 0] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const VendorShiftPage = () => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm")); // true for sm and up

  const [vendorShifts, setVendorShifts] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [shift, setShift] = useState({
    shift_id: "",
    shift_name: "",
    start_time: "09:00",
    end_time: "12:00",
    days_of_week: [],
  });

  const fetchVendorShifts = async () => {
    setVendorLoading(true);
    try {
      const res = await axios.get(
        `${VITE_API_BASE_URL}/Vendor/getVendorShiftforVendor`,
        { withCredentials: true }
      );
      const raw = res.data;
      const data =
        raw?.data || raw?.shifts || raw?.vendorShifts || raw?.Data || [];
      setVendorShifts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch vendor shifts");
    } finally {
      setVendorLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorShifts();
  }, []);

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
  const handleOpenEdit = (s) => {
    setIsEdit(true);
    setShift({
      shift_id: s.shift_id ?? s.id,
      shift_name: s.shift_name ?? "",
      start_time: (s.start_time || "09:00").slice(0, 5),
      end_time: (s.end_time || "12:00").slice(0, 5),
      days_of_week: parseDays(s.days_of_week),
    });
    setOpen(true);
  };

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
        await axios.post(
          `${VITE_API_BASE_URL}/Vendor/updateVendorShiftbyId`,
          payload,
          { withCredentials: true }
        );
        toast.success("Shift updated");
      } else {
        await axios.post(
          `${VITE_API_BASE_URL}/Vendor/AddvendorShifts`,
          payload,
          { withCredentials: true }
        );
        toast.success("Shift added");
      }

      setOpen(false);
      fetchVendorShifts();
    } catch {
      toast.error("Failed to save shift");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.get(
        `${VITE_API_BASE_URL}/Vendor/deleteVendorShiftbyId`,
        { params: { shift_id: id }, withCredentials: true }
      );
      toast.success("Shift deleted");
      fetchVendorShifts();
    } catch {
      toast.error("Failed to delete shift");
    }
  };

  const filteredShifts = vendorShifts
    .filter((s) => {
      const term = searchTerm.toLowerCase();
      return (
        s.shift_name?.toLowerCase().includes(term) ||
        parseDays(s.days_of_week).join(" ").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const ta = timeToMinutes(a.start_time);
      const tb = timeToMinutes(b.start_time);
      return sortOrder === "asc" ? ta - tb : tb - ta;
    });

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2, sm: 4 },
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          Vendor Shifts
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="stretch"
        >
          <TextField
            size="small"
            placeholder="Search by name / days"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", sm: 260 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAdd}
            sx={{
              bgcolor: "#3c6e71",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Add Shift
          </Button>
        </Stack>
      </Stack>

      {/* Table / Cards responsive */}
      {vendorLoading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : filteredShifts.length === 0 ? (
        <Typography>No vendor shifts found.</Typography>
      ) : isSmUp ? (
        <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#e8e8e8" }}>
              <TableRow>
                {["Shift", "Time", "Days", "Actions"].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      // allow days header to wrap
                      whiteSpace: h === "Days" ? "normal" : "nowrap",
                      wordBreak: h === "Days" ? "break-word" : undefined,
                      maxWidth: h === "Days" ? { xs: 140, sm: 360 } : undefined,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredShifts.map((s) => (
                <TableRow key={s.shift_id ?? s.id} hover>
                  <TableCell sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    {s.shift_name}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere", maxWidth: { xs: 140, sm: 400 }, fontSize: { xs: "0.75rem", sm: "0.9rem" } }}>
                    {parseDays(s.days_of_week).join(", ")}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(s)}
                        sx={{
                          "&:hover": {
                            bgcolor: "#3c6e71",
                            color: "white",
                          },
                        }}
                        aria-label={`Edit ${s.shift_name}`}
                      >
                        <FiEdit3 />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(s.shift_id ?? s.id)}
                        sx={{
                          "&:hover": {
                            bgcolor: "#d32f2f",
                            color: "white",
                          },
                        }}
                        aria-label={`Delete ${s.shift_name}`}
                      >
                        <RiDeleteBin6Line />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // XS / Mobile - show stacked cards for better readability
        <Stack spacing={2}>
          {filteredShifts.map((s) => (
            <Card key={s.shift_id ?? s.id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                      {s.shift_name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: "normal", wordBreak: "break-word" }}>
                      {parseDays(s.days_of_week).join(", ")}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small" onClick={() => handleOpenEdit(s)} aria-label={`Edit ${s.shift_name}`}>
                      <FiEdit3 />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(s.shift_id ?? s.id)} aria-label={`Delete ${s.shift_name}`}>
                      <RiDeleteBin6Line />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
       <DialogTitle
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1,
    fontWeight: 700,
  }}
>
  <IconButton
    onClick={() => setOpen(false)}
    sx={{
      border: "1px solid #e0e0e0",
      color: "#3c6e71",
      "&:hover": {
        bgcolor: "#3c6e71",
        color: "white",
      },
    }}
    size="small"
  >
    <ArrowBack fontSize="small" />
  </IconButton>

  {isEdit ? "Edit Shift" : "Add Shift"}
</DialogTitle>

        <DialogContent
          dividers
          sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}
        >
          <Stack spacing={2}>
            <TextField
              label="Shift Name"
              value={shift.shift_name}
              onChange={(e) =>
                setShift({ ...shift, shift_name: e.target.value })
              }
            />

            <Stack direction="row" spacing={2}>
              <TextField
                type="time"
                label="Start Time"
                value={shift.start_time}
                onChange={(e) =>
                  setShift({ ...shift, start_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                type="time"
                label="End Time"
                value={shift.end_time}
                onChange={(e) =>
                  setShift({ ...shift, end_time: e.target.value })
                }
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
                    days_of_week: e.target.value,
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
          <Button
  onClick={() => setOpen(false)}
  sx={{
    color: "#555",
    textTransform: "none",
  }}
>
  Cancel
</Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ bgcolor: "#3c6e71" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorShiftPage;
