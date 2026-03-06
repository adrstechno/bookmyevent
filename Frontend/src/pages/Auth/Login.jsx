

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

import { FaRegEnvelope, FaLock, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { RiSparklingFill } from "react-icons/ri";

// Configure axios to include credentials (cookies) with requests
axios.defaults.withCredentials = true;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // VALIDATION
  const validate = () => {
    let err = {};

    if (!formData.email.trim()) {
      err.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      err.email = "Enter a valid email";
    }

    if (!formData.password.trim()) {
      err.password = "Password is required";
    } else if (formData.password.length < 6) {
      err.password = "Password must be at least 6 characters";
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await axios.post(
        `${VITE_API_BASE_URL}/User/Login`,
        formData,
        {
          withCredentials: true // Ensure cookies are sent and received
        }
      );

      if (res.data?.token) {
        toast.success("Login Successful");
        
        // Use AuthContext login method with correct data structure
        login({
          token: res.data.token,
          role: res.data.role,
          email: res.data.email || formData.email,
          user_id: res.data.user_id,
          first_name: res.data.first_name,
          last_name: res.data.last_name
        });

        const role = res.data.role;

        // Add a small delay to ensure state is updated
        setTimeout(() => {
          // Check for redirect URL first
          const redirectUrl = searchParams.get('redirect');
          if (redirectUrl) {
            navigate(decodeURIComponent(redirectUrl));
            return;
          }

          // Navigate based on role if no redirect URL
          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (role === "user") {
            navigate("/user/dashboard");
          } else if (role === "vendor") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/");
          }
        }, 100);
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      
      // Handle email verification requirement
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        toast.error(error.response.data.message);
        
        // Show resend verification option
        const shouldResend = window.confirm(
          "Would you like to resend the verification email?"
        );
        
        if (shouldResend) {
          try {
            await axios.post(`${VITE_API_BASE_URL}/User/resend-verification`, {
              email: error.response.data.email || formData.email
            });
            toast.success("Verification email sent! Please check your inbox.");
          } catch (resendError) {
            console.error("Resend verification error:", resendError);
            toast.error("Failed to resend verification email. Please try again.");
          }
        }
      } else {
        toast.error(error.response?.data?.message || error.response?.data?.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

 return (
  <>
   <div
  className="relative min-h-screen w-full bg-cover bg-center flex items-center justify-center"
  style={{
    backgroundImage:
      "url('https://cdn.pixabay.com/photo/2016/11/23/17/56/wedding-1854074_1280.jpg')",
  }}
>
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"></div>

  {/* Login Card */}
  <div
    className="relative w-full max-w-md mx-4 p-8 rounded-2xl
    bg-white/30 backdrop-blur-xl
    border border-white/30
    shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
  >
    {/* Header */}
    <div className="flex flex-col items-center mb-8">
      <div className="w-14 h-14 bg-[#3c6e71] text-white rounded-full flex items-center justify-center shadow-lg">
        <RiSparklingFill size={28} />
      </div>

      <h2 className="text-3xl font-bold mt-4 text-gray-900">
        Welcome Back
      </h2>
      <p className="text-gray-700 text-sm">
        Login to continue your journey
      </p>
    </div>

    {/* FORM */}
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none
          bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-500
          ${errors.email ? "border-red-500" : "border-gray-300"}
          focus:ring-2 focus:ring-[#3c6e71] relative z-0`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className={`w-full pl-12 pr-12 py-3 rounded-xl border outline-none
          bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-500
          ${errors.password ? "border-red-500" : "border-gray-300"}
          focus:ring-2 focus:ring-[#3c6e71] relative z-0`}
        />

        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors z-10"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#3c6e71] text-white font-semibold
        shadow-lg hover:bg-[#284b63] hover:shadow-xl transition"
      >
        {loading ? "Processing..." : "Login"}
      </button>

      {/* Register Link */}
      <p className="text-center text-sm text-gray-800">
        Don’t have an account?{" "}
        <span
          className="text-[#284b63] cursor-pointer font-semibold hover:underline"
          onClick={() => navigate("/register")}
        >
          Register
        </span>
      </p>
    </form>
  </div>
</div>

  </>
);

};

export default Login;
