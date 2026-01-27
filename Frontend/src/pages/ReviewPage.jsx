import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiArrowLeft, FiCheck } from "react-icons/fi";
import axios from "axios";
import { VITE_API_BASE_URL } from "../utils/api";
import toast from "react-hot-toast";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";

const ReviewPage = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTokenAccess, setIsTokenAccess] = useState(false);
  
  // Review form state
  const [ratings, setRatings] = useState({
    service_quality: 0,
    communication: 0,
    value_for_money: 0,
    punctuality: 0,
  });
  const [overallRating, setOverallRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = searchParams.get('token');
      
      let response;
      
      if (token) {
        // Use public endpoint with review token
        console.log('Using review token for booking access');
        setIsTokenAccess(true);
        response = await axios.get(
          `${VITE_API_BASE_URL}/Booking/review/${bookingId}?token=${token}`
        );
      } else {
        // Try authenticated endpoint first
        console.log('Attempting authenticated booking access');
        try {
          response = await axios.get(
            `${VITE_API_BASE_URL}/Booking/GetBookingById/${bookingId}`,
            { withCredentials: true }
          );
        } catch (authError) {
          console.log('Authenticated access failed, redirecting to login');
          // If no token and auth fails, redirect to login with return URL
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
          navigate(`/login?redirect=${returnUrl}`);
          return;
        }
      }
      
      if (response.data?.success && response.data?.data) {
        setBooking(response.data.data);
        
        // Check if booking is eligible for review
        if (!['awaiting_review', 'completed'].includes(response.data.data.status)) {
          toast.error("This booking is not eligible for review");
          navigate('/');
          return;
        }
      } else {
        toast.error("Booking not found");
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      
      if (error.response?.status === 401) {
        toast.error("Invalid or expired review link. Please log in to continue.");
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        navigate(`/login?redirect=${returnUrl}`);
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to review this booking");
        navigate('/');
      } else {
        toast.error("Failed to load booking details");
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (category, rating) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
    
    // Calculate overall rating as average
    const newRatings = { ...ratings, [category]: rating };
    const total = Object.values(newRatings).reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / Object.keys(newRatings).length);
    setOverallRating(average);
  };

  const handleSubmitReview = async () => {
    // Validation
    const allRatingsGiven = Object.values(ratings).every(rating => rating > 0);
    if (!allRatingsGiven) {
      toast.error("Please provide ratings for all categories");
      return;
    }

    if (overallRating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData = {
        booking_id: bookingId,
        overall_rating: overallRating,
        service_quality_rating: ratings.service_quality,
        communication_rating: ratings.communication,
        value_for_money_rating: ratings.value_for_money,
        punctuality_rating: ratings.punctuality,
        review_text: reviewText.trim(),
      };

      let response;
      
      if (isTokenAccess) {
        // For token-based access, include the token in the request
        const token = searchParams.get('token');
        response = await axios.post(
          `${VITE_API_BASE_URL}/reviews/submit-with-token`,
          { ...reviewData, review_token: token }
        );
      } else {
        // For authenticated users
        response = await axios.post(
          `${VITE_API_BASE_URL}/reviews/submit`,
          reviewData,
          { withCredentials: true }
        );
      }

      if (response.data?.success) {
        setSubmitted(true);
        toast.success("Thank you for your review!");
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        toast.error(response.data?.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (currentRating, onRatingChange, label) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`text-2xl transition-colors ${
                star <= currentRating ? "text-yellow-400" : "text-gray-300"
              } hover:text-yellow-400`}
            >
              <FiStar fill={star <= currentRating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3c6e71] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <HomeNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for sharing your experience. Your feedback helps other customers make informed decisions.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#3c6e71] text-white rounded-lg font-semibold hover:bg-[#284b63] transition"
            >
              Back to Home
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />
      
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-6 z-50 bg-white border-2 border-[#3c6e71] text-[#3c6e71] hover:bg-[#3c6e71] hover:text-white p-4 rounded-full shadow-2xl"
      >
        <FiArrowLeft className="text-2xl" />
      </motion.button>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-16 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <FiStar className="text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Share Your Experience</h1>
          <p className="text-gray-200">Help others by reviewing your recent booking</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        {booking && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Booking Details */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">Vendor:</span>
                  <p className="text-gray-800">{booking.business_name || booking.vendor_name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Event Date:</span>
                  <p className="text-gray-800">
                    {new Date(booking.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Package:</span>
                  <p className="text-gray-800">{booking.package_name || `Package #${booking.package_id}`}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Booking ID:</span>
                  <p className="text-gray-800">#{booking.booking_id}</p>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Rate Your Experience</h2>

              {/* Individual Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderStarRating(
                  ratings.service_quality,
                  (rating) => handleRatingChange('service_quality', rating),
                  'Service Quality'
                )}
                {renderStarRating(
                  ratings.communication,
                  (rating) => handleRatingChange('communication', rating),
                  'Communication'
                )}
                {renderStarRating(
                  ratings.value_for_money,
                  (rating) => handleRatingChange('value_for_money', rating),
                  'Value for Money'
                )}
                {renderStarRating(
                  ratings.punctuality,
                  (rating) => handleRatingChange('punctuality', rating),
                  'Punctuality'
                )}
              </div>

              {/* Overall Rating */}
              <div className="border-t pt-6">
                <label className="block text-lg font-bold text-gray-800 mb-3">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className={`text-4xl transition-colors ${
                        star <= overallRating ? "text-yellow-400" : "text-gray-300"
                      } hover:text-yellow-400`}
                    >
                      <FiStar fill={star <= overallRating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  Write Your Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about your experience to help other customers..."
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c6e71] focus:border-transparent resize-none"
                  maxLength="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {reviewText.length}/1000 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Skip Review
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || Object.values(ratings).some(rating => rating === 0) || overallRating === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiStar /> Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ReviewPage;