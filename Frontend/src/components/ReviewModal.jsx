import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiStar } from "react-icons/fi";
import reviewService from "../services/reviewService";
import toast from "react-hot-toast";

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [serviceQuality, setServiceQuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [loading, setLoading] = useState(false);

  // Don't render if no booking
  if (!booking) return null;

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      return toast.error("Please select a rating");
    }

    try {
      setLoading(true);
      await reviewService.submitReview(booking.booking_id, {
        rating,
        review_text: reviewText,
        service_quality: serviceQuality || rating,
        communication: communication || rating,
        value_for_money: valueForMoney || rating,
        punctuality: punctuality || rating,
      });

      toast.success("Thank you for your review!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 w-32">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => label === "Overall Rating" && setHoverRating(star)}
            onMouseLeave={() => label === "Overall Rating" && setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <FiStar
              className={`w-6 h-6 ${
                star <= (label === "Overall Rating" ? (hoverRating || value) : value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-2">
        {value > 0 ? `${value}/5` : "Not rated"}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#284b63] to-[#3c6e71] p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Rate Your Experience</h2>
              <p className="text-white/80">
                {booking?.vendor_name || "Vendor"} - {booking?.package_name || "Service"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
            <StarRating
              value={rating}
              onChange={setRating}
              label="Overall Rating *"
            />
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">
              Detailed Ratings (Optional)
            </h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <StarRating
                value={serviceQuality}
                onChange={setServiceQuality}
                label="Service Quality"
              />
              <StarRating
                value={communication}
                onChange={setCommunication}
                label="Communication"
              />
              <StarRating
                value={valueForMoney}
                onChange={setValueForMoney}
                label="Value for Money"
              />
              <StarRating
                value={punctuality}
                onChange={setPunctuality}
                label="Punctuality"
              />
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Share Your Experience (Optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience with this vendor..."
              rows="4"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your review will help other customers make informed decisions
            </p>
          </div>

          {/* Booking Info */}
          {booking && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Booking Details</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(booking.event_date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Package:</span> {booking.package_name}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewModal;
