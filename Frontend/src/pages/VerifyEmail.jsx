import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiLoader, FiMail } from "react-icons/fi";
import api from "../services/axiosConfig";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus("verifying");
      const response = await api.get(`/User/verify-email?token=${token}`);
      
      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage(
        error.response?.data?.message || 
        "Failed to verify email. The link may have expired."
      );
    }
  };

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const email = prompt("Please enter your email address:");
      
      if (!email) {
        setResending(false);
        return;
      }

      const response = await api.post("/User/resend-verification", { email });
      
      if (response.data.success) {
        alert("Verification email sent! Please check your inbox.");
      } else {
        alert(response.data.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Resend error:", error);
      alert(
        error.response?.data?.message || 
        "Failed to resend verification email"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#284b63] via-[#3c6e71] to-[#284b63] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === "verifying" && (
            <div className="relative">
              <FiLoader className="text-6xl text-[#f9a826] animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="relative">
              <FiCheckCircle className="text-6xl text-green-500" />
              <div className="absolute inset-0 animate-ping">
                <FiCheckCircle className="text-6xl text-green-500 opacity-75" />
              </div>
            </div>
          )}
          {status === "error" && (
            <FiXCircle className="text-6xl text-red-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          {status === "verifying" && "Verifying Email..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">
          {message}
        </p>

        {/* Success Actions */}
        {status === "success" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 text-sm">
                ✅ Your account is now active!
                <br />
                Redirecting to login page...
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full bg-[#f9a826] hover:bg-[#f7b733] text-white text-center py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Error Actions */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm text-center">
                ⚠️ {message}
              </p>
            </div>
            
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full bg-[#3c6e71] hover:bg-[#284b63] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <FiLoader className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiMail />
                  Resend Verification Email
                </>
              )}
            </button>

            <Link
              to="/login"
              className="block w-full text-center text-gray-600 hover:text-gray-800 py-2"
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Verifying State */}
        {status === "verifying" && (
          <div className="text-center">
            <div className="inline-block animate-pulse text-gray-600">
              Please wait while we verify your email address...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
