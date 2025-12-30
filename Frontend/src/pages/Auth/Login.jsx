

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        
        // Use AuthContext login method
        login({
          token: res.data.token,
          user: {
            role: res.data.role,
            email: formData.email
          }
        });

        // Also store role in localStorage for ProtectedRoute
        localStorage.setItem("role", res.data.role);

        const role = res.data.role;

        // Navigate immediately after successful login
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "user") {
          navigate("/");
        } else if (role === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Something went wrong");
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
        <FaRegEnvelope className="absolute left-3 top-3.5 text-gray-600" />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className={`w-full pl-10 pr-3 py-3 rounded-xl border outline-none
          bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-500
          ${errors.email ? "border-red-500" : "border-gray-300"}
          focus:ring-2 focus:ring-[#3c6e71]`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="relative">
        <FaLock className="absolute left-3 top-3.5 text-gray-600" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className={`w-full pl-10 pr-10 py-3 rounded-xl border outline-none
          bg-white/70 backdrop-blur-md text-gray-900 placeholder-gray-500
          ${errors.password ? "border-red-500" : "border-gray-300"}
          focus:ring-2 focus:ring-[#3c6e71]`}
        />

        <div
          className="absolute right-3 top-3.5 text-gray-700 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <FaRegEyeSlash size={20} />
          ) : (
            <FaRegEye size={20} />
          )}
        </div>

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
