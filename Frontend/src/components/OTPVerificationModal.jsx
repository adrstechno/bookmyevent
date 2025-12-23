import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShield, FiClock, FiAlertCircle, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import otpService from "../services/otpService";
import toast from "react-hot-toast";

const OTPVerificationModal = ({ isOpen, onClose, bookingId, onSuccess }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // Timer for OTP expiry
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setRemainingTime(diff);

      if (diff === 0) {
        clearInterval(interval);
        setError("OTP has expired. Please request a new one.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Format remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate OTP
  const handleGenerateOTP = async () => {
    try {
      setGenerating(true);
      setError("");
      const response = await otpService.generateOTP(bookingId);
      
      if (response.success) {
        setOtpGenerated(true);
        setExpiresAt(response.data.expires_at);
        setRemainingAttempts(3);
        toast.success("OTP sent successfully! Check your email/phone.");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate OTP";
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // Verify OTP
  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await otpService.verifyOTP(bookingId, otpCode);

      if (response.success) {
        toast.success("OTP verified successfully! Booking confirmed.");
        onSuccess?.(response.data);
        onClose();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid OTP";
      setError(message);
      setRemainingAttempts((prev) => Math.max(0, prev - 1));
      
      if (remainingAttempts <= 1) {
        setError("Maximum attempts reached. Please request a new OTP.");
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      setGenerating(true);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      
      const response = await otpService.resendOTP(bookingId);
      
      if (response.success) {
        setExpiresAt(response.data.expires_at);
        setRemainingAttempts(3);
        toast.success("New OTP sent successfully!");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setOtpGenerated(false);
      setExpiresAt(null);
      setRemainingTime(0);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#284b63] to-[#3c6e71] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiShield className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">OTP Verification</h2>
                  <p className="text-white/80 text-sm">Verify your booking</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {!otpGenerated ? (
              // Generate OTP Section
              <div className="text-center">
                <div className="w-20 h-20 bg-[#3c6e71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="text-4xl text-[#3c6e71]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Generate OTP to Confirm Booking
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Click the button below to receive a 6-digit OTP on your registered email/phone.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateOTP}
                  disabled={generating}
                  className="w-full py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiShield />
                      Generate OTP
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              // Verify OTP Section
              <div>
                {/* Timer */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <FiClock className={`text-lg ${remainingTime < 60 ? "text-red-500" : "text-[#3c6e71]"}`} />
                  <span className={`font-mono text-lg font-semibold ${remainingTime < 60 ? "text-red-500" : "text-gray-700"}`}>
                    {formatTime(remainingTime)}
                  </span>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c6e71]/50 transition-all ${
                        error
                          ? "border-red-400 bg-red-50"
                          : digit
                          ? "border-[#3c6e71] bg-[#3c6e71]/5"
                          : "border-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm mb-4 justify-center"
                  >
                    <FiAlertCircle />
                    {error}
                  </motion.div>
                )}

                {/* Remaining Attempts */}
                <p className="text-center text-sm text-gray-500 mb-6">
                  Remaining attempts: <span className="font-semibold text-[#284b63]">{remainingAttempts}</span>
                </p>

                {/* Verify Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerify}
                  disabled={loading || otp.join("").length !== 6 || remainingAttempts === 0}
                  className="w-full py-3 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-xl font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Verify OTP
                    </>
                  )}
                </motion.button>

                {/* Resend OTP */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResend}
                    disabled={generating || remainingTime > 540}
                    className="text-[#3c6e71] hover:text-[#284b63] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
                  >
                    <FiRefreshCw className={generating ? "animate-spin" : ""} />
                    Resend OTP
                  </button>
                  {remainingTime > 540 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Wait {formatTime(remainingTime - 540)} to resend
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OTPVerificationModal;
