import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiMessageSquare,
  FiPackage,
  FiUser,
} from "react-icons/fi";

const BookingSection = () => {
  const navigate = useNavigate();
  const [bookingForm, setBookingForm] = useState({
    vendor_id: "",
    shift_id: "",
    package_id: "",
    event_address: "",
    event_date: "",
    event_time: "",
    special_requirement: "",
    status: "pending",
    admin_approval: "pending",
  });

  const handleBooking = async (e) => {
    e.preventDefault();

    // Validation
    if (!bookingForm.vendor_id) return toast.error("Please enter Vendor ID");
    if (!bookingForm.package_id) return toast.error("Please enter Package ID");
    if (!bookingForm.shift_id) return toast.error("Please enter Shift ID");
    if (!bookingForm.event_address) return toast.error("Event address is required");
    if (!bookingForm.event_date) return toast.error("Event date is required");
    if (!bookingForm.event_time) return toast.error("Event time is required");

    try {
      const response = await axios.post(
        `${VITE_API_BASE_URL}/Booking/InsertBooking`,
        bookingForm,
        { withCredentials: true }
      );

      toast.success("Booking created successfully!");
      
      // Reset form
      setBookingForm({
        vendor_id: "",
        shift_id: "",
        package_id: "",
        event_address: "",
        event_date: "",
        event_time: "",
        special_requirement: "",
        status: "pending",
        admin_approval: "pending",
      });

      // Navigate to bookings page after 1 second
      setTimeout(() => {
        navigate("/user/bookings");
      }, 1500);
    } catch (error) {
      console.error("Booking error:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to create a booking");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(error.response?.data?.error || "Failed to create booking");
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-[#3c6e71]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f9a826]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-[#284b63] mb-4">
            Quick <span className="text-[#f9a826]">Booking</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Book your event in minutes! Fill in the details and we'll take care of the rest.
          </p>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#3c6e71] to-[#284b63] p-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Create Your Booking</h3>
              <p className="text-gray-200">Enter your event details below</p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleBooking} className="p-8 space-y-6">
              {/* IDs Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FiUser className="text-[#3c6e71]" />
                    Vendor ID *
                  </label>
                  <input
                    type="number"
                    value={bookingForm.vendor_id}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, vendor_id: e.target.value })
                    }
                    placeholder="Enter vendor ID"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FiPackage className="text-[#3c6e71]" />
                    Package ID *
                  </label>
                  <input
                    type="number"
                    value={bookingForm.package_id}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, package_id: e.target.value })
                    }
                    placeholder="Enter package ID"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FiClock className="text-[#3c6e71]" />
                    Shift ID *
                  </label>
                  <input
                    type="number"
                    value={bookingForm.shift_id}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, shift_id: e.target.value })
                    }
                    placeholder="Enter shift ID"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                  />
                </motion.div>
              </div>

              {/* Event Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FiMapPin className="text-[#3c6e71]" />
                  Event Address *
                </label>
                <textarea
                  value={bookingForm.event_address}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, event_address: e.target.value })
                  }
                  placeholder="Enter complete event address"
                  rows="3"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none resize-none transition-all"
                />
              </motion.div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FiCalendar className="text-[#3c6e71]" />
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.event_date}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, event_date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <FiClock className="text-[#3c6e71]" />
                    Event Time *
                  </label>
                  <input
                    type="time"
                    value={bookingForm.event_time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, event_time: e.target.value })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                  />
                </motion.div>
              </div>

              {/* Special Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <FiMessageSquare className="text-[#3c6e71]" />
                  Special Requirements (Optional)
                </label>
                <textarea
                  value={bookingForm.special_requirement}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      special_requirement: e.target.value,
                    })
                  }
                  placeholder="Any special requests or requirements..."
                  rows="3"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none resize-none transition-all"
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#f9a826] to-[#f9a826]/80 hover:from-[#f9a826]/90 hover:to-[#f9a826]/70 text-white text-xl font-bold py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Book Now
                </button>
              </motion.div>

              {/* Info Text */}
              <p className="text-center text-sm text-gray-500 mt-4">
                By booking, you agree to our terms and conditions. Your booking will be pending until admin approval.
              </p>
            </form>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Need help? Browse our{" "}
            <a href="/category/weddings" className="text-[#3c6e71] font-semibold hover:underline">
              vendors
            </a>{" "}
            to find the perfect match for your event!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingSection;
