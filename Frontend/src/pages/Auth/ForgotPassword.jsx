import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../utils/api";
import { RiSparklingFill } from "react-icons/ri";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await axios.post(
        `${VITE_API_BASE_URL}/User/forgot-password`,
        { email },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setEmailSent(true);
        toast.success("Password reset link sent! Check your email.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(
        err.response?.data?.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://cdn.pixabay.com/photo/2016/11/23/17/56/wedding-1854074_1280.jpg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"></div>

      {/* Forgot Password Card */}
      <div className="relative w-full max-w-md mx-4 p-8 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#3c6e71] text-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold mt-4 text-gray-900">
            Forgot Password?
          </h2>
          <p className="text-gray-700 text-sm text-center mt-2">
            {emailSent
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none
                bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-500
                ${error ? "border-red-500" : "border-gray-300"}
                focus:ring-2 focus:ring-[#3c6e71] relative z-0`}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#3c6e71] text-white font-semibold
              shadow-lg hover:bg-[#284b63] hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-800">
              Remember your password?{" "}
              <span
                className="text-[#284b63] cursor-pointer font-semibold hover:underline"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </span>
            </p>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Success Message */}
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-3">
                <svg
                  className="h-6 w-6 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Email Sent!</p>
                  <p className="text-sm">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">Next Steps:</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Check your email inbox</li>
                <li>Click the password reset link</li>
                <li>Create a new password</li>
                <li>Login with your new password</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-[#284b63] font-semibold hover:underline"
                >
                  try again
                </button>
              </p>
            </div>

            {/* Back to Login */}
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl bg-white/70 backdrop-blur-md text-gray-900 font-semibold
              border border-gray-300 hover:bg-white hover:shadow-lg transition"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
