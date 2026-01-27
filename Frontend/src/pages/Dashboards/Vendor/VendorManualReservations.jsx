import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiLock,
  FiUnlock,
  FiPlus,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../../utils/api";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../style/Calendar.css";

const VendorManualReservations = () => {
  const [vendorId, setVendorId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Modal state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [availableShifts, setAvailableShifts] = useState([]);

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  useEffect(() => {
    if (vendorId) {
      fetchReservations();
    }
  }, [vendorId]);

  // Fetch available shifts when both vendor and date are selected
  useEffect(() => {
    if (vendorId && selectedDate) {
      fetchAvailableShifts(vendorId, selectedDate);
    } else {
      setAvailableShifts([]);
    }
  }, [vendorId, selectedDate]);

  const fetchVendorProfile = async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/Vendor/GetVendorProfile`, {
        withCredentials: true,
      });
      setVendorId(response.data?.vendor_id);
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      toast.error("Failed to load vendor profile");
    }
  };

  const fetchAvailableShifts = async (vendorId, date) => {
    if (!vendorId || !date) return;
    
    try {
      setShiftsLoading(true);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const response = await axios.get(
        `${VITE_API_BASE_URL}/shift-availability/available-shifts?vendor_id=${vendorId}&event_date=${formattedDate}`,
        { withCredentials: true }
      );
      
      if (response.data?.success) {
        setAvailableShifts(response.data.availableShifts || []);
        console.log('Fetched available shifts for vendor:', vendorId, 'date:', formattedDate, response.data.availableShifts);
      } else {
        setAvailableShifts([]);
        if (!response.data?.available) {
          toast.info(response.data?.message || "No shifts available for this date");
        }
      }
    } catch (error) {
      console.error("Error fetching available shifts:", error);
      setAvailableShifts([]);
      if (error.response?.status === 404) {
        toast.info("No shifts available for this date");
      } else {
        toast.error("Failed to load available shifts");
      }
    } finally {
      setShiftsLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const response = await axios.get(
        `${VITE_API_BASE_URL}/manual-reservations/vendor/${vendorId}?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
        { withCredentials: true }
      );
      setReservations(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedDate || !selectedShift) {
      toast.error("Please select date and shift");
      return;
    }

    try {
      setSubmitting(true);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      await axios.post(
        `${VITE_API_BASE_URL}/manual-reservations`,
        {
          vendor_id: vendorId,
          shift_id: selectedShift,
          event_date: formattedDate,
          reason: reason || "Manual reservation by vendor",
          reserved_by_type: "vendor",
        },
        { withCredentials: true }
      );

      toast.success("Shift reserved successfully!");
      setShowModal(false);
      setSelectedDate(null);
      setSelectedShift(null);
      setReason("");
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reserve shift");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("Cancel this reservation?")) return;

    try {
      await axios.delete(`${VITE_API_BASE_URL}/manual-reservations/${reservationId}`, {
        withCredentials: true,
      });
      toast.success("Reservation cancelled");
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel reservation");
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      const hasReservation = reservations.some((r) => {
        const rDate = new Date(r.event_date).toISOString().split("T")[0];
        return rDate === dateStr;
      });
      if (hasReservation) {
        return "react-calendar__tile--booked";
      }
    }
    return null;
  };

  if (!vendorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3c6e71] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#284b63] flex items-center gap-3">
            <FiLock /> My Shift Reservations
          </h1>
          <p className="text-gray-500">
            Reserve your shifts for bookings made outside the platform
          </p>
        </div>

        {/* Add Reservation Button */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowModal(true);
              setSelectedDate(null);
              setSelectedShift(null);
              setAvailableShifts([]);
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg font-semibold flex items-center gap-2 shadow-md"
          >
            <FiPlus /> Reserve Shift
          </motion.button>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Active Reservations
            </h2>
            <button
              onClick={fetchReservations}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiRefreshCw className="text-[#3c6e71]" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3c6e71] border-t-transparent mx-auto"></div>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiAlertCircle className="mx-auto text-4xl mb-2" />
              <p>No active reservations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div
                  key={reservation.reservation_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#3c6e71]/10 rounded-lg flex items-center justify-center">
                      <FiLock className="text-[#3c6e71] text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {reservation.shift_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(reservation.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}{" "}
                        • {reservation.start_time?.substring(0, 5)} -{" "}
                        {reservation.end_time?.substring(0, 5)}
                      </p>
                      {reservation.reason && (
                        <p className="text-xs text-gray-400 mt-1">
                          {reservation.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCancelReservation(reservation.reservation_id)
                    }
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                  >
                    <FiUnlock /> Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Reservation Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-[#284b63] to-[#3c6e71] p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Reserve Shift</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Date *
                  </label>
                  <Calendar
                    onChange={(date) => {
                      setSelectedDate(date);
                      setSelectedShift(null); // Reset shift selection when date changes
                    }}
                    value={selectedDate}
                    minDate={new Date()}
                    tileClassName={tileClassName}
                    className="w-full"
                  />
                  {selectedDate && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                {/* Shift Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Available Shift *
                  </label>
                  {!selectedDate ? (
                    <div className="text-center py-8 text-gray-500">
                      <FiCalendar className="mx-auto text-3xl mb-2" />
                      <p>Please select a date first</p>
                    </div>
                  ) : shiftsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#3c6e71] border-t-transparent mx-auto mb-2"></div>
                      <p className="text-gray-500">Loading available shifts...</p>
                    </div>
                  ) : availableShifts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FiAlertCircle className="mx-auto text-3xl mb-2" />
                      <p>No available shifts for this date</p>
                      <p className="text-sm">All shifts are already booked or reserved</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {availableShifts.map((shift) => (
                        <button
                          key={shift.shift_id}
                          onClick={() => setSelectedShift(shift.shift_id)}
                          className={`p-4 rounded-xl border-2 text-left transition ${
                            selectedShift === shift.shift_id
                              ? "border-[#3c6e71] bg-[#3c6e71]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-semibold text-gray-800">
                            {shift.shift_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {shift.time_display || `${shift.start_time?.substring(0, 5)} - ${shift.end_time?.substring(0, 5)}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Booked via phone call, External event..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6e71] focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateReservation}
                    disabled={submitting || !selectedDate || !selectedShift}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Reserving...
                      </>
                    ) : (
                      <>
                        <FiLock /> Reserve Shift
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManualReservations;
