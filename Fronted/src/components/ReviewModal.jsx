import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiStar, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import reviewService from "../services/reviewService";
import toast from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, bookingId, vendorName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [serviceQuality, setServiceQuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [loading, setLoading] = useState(false);

  // Star Rating Component
  const StarRating = ({ value, onChange, onHover, size = "text-2xl" }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={() => onHover?.(0)}
          className={`${size} transition-colors ${
            star <= (onHover ? hoverRating || value : value)
              ? "text-yellow-400"
              : "text-gray-300"
          } hover:scale-110 transition-transform`}
        >
          <FiStar
            className={star <= (onHover ? hoverRating || value : value) ? "fill-current" : ""}
          />
        </button>
      ))}
    </div>
  );

  // Mini Star Rating for sub-categories
  const MiniStarRating = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-lg transition-colors ${
              star <= value ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <FiStar className={star <= value ? "fill-current" : ""} />
          </button>
        ))}
      </div>
    </div>
  );

  // Submit review
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select an overall rating");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setLoading(true);
      const reviewData = {
        rating,
        review_text: reviewText,
        service_quality: serviceQuality || rating,
        communication: communication || rating,
        value_for_money: valueForMoney || rating,
        punctuality: punctuality || rating,
      };

      const response = await reviewService.submitReview(bookingId, reviewData);

      if (response.success) {
        toast.success("Review submitted successfully!");
        onSuccess?.(response.data);
        onClose();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit review";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setReviewText("");
    setServiceQuality(0);
    setCommunication(0);
    setValueForMoney(0);
    setPunctuality(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#284b63] to-[#3c6e71] p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiStar className="text-2xl text-yellow-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Write a Review</h2>
                  <p className="text-white/80 text-sm">{vendorName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Overall Rating */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Overall Rating
              </h3>
              <StarRating
                value={rating}
                onChange={setRating}
                onHover={setHoverRating}
                size="text-4xl"
              />
              <p className="text-sm text-gray-500 mt-2">
                {rating === 0
                  ? "Tap to rate"
                  : rating === 1
                  ? "Poor"
                  : rating === 2
                  ? "Fair"
                  : rating === 3
                  ? "Good"
                  : rating === 4
                  ? "Very Good"
                  : "Excellent"}
              </p>
            </div>

            {/* Detailed Ratings */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Rate specific aspects (optional)
              </h4>
              <div className="divide-y divide-gray-200">
                <MiniStarRating
                  label="Service Quality"
                  value={serviceQuality}
                  onChange={setServiceQuality}
                />
                <MiniStarRating
                  label="Communication"
                  value={communication}
                  onChange={setCommunication}
                />
                <MiniStarRating
                  label="Value for Money"
                  value={valueForMoney}
                  onChange={setValueForMoney}
                />
                <MiniStarRating
                  label="Punctuality"
                  value={punctuality}
                  onChange={setPunctuality}
                />
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FiMessageSquare className="text-[#3c6e71]" />
                Your Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this vendor..."
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none resize-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {reviewText.length}/500 characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1 py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Submit Review
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
