
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../utils/api";

import { FaRegEnvelope, FaLock, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { RiSparklingFill } from "react-icons/ri";

const Login = () => {
  const navigate = useNavigate();

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
      const res = await axios.post(`${VITE_API_BASE_URL}/User/Login`, formData);

      if (res.data?.token) {
        toast.success("Login Successful");

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        setTimeout(() => navigate("/vendor/dashboard"), 700);
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Something went wrong", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    

      <div className="flex min-h-screen bg-gray-100">
        {/* Left Banner */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/login.jpg')" }}
        ></div>

        {/* Right Section */}
        <div className="flex flex-1 justify-center items-center p-6">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border-t-4 border-[#3c6e71]">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-[#3c6e71] text-white rounded-full flex items-center justify-center shadow-md">
                <RiSparklingFill size={28} />
              </div>

              <h2 className="text-3xl font-bold mt-4 text-gray-800">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-sm">
                Login to continue your journey
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <FaRegEnvelope className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border outline-none bg-gray-50 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-[#3c6e71]`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none bg-gray-50 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-[#3c6e71]`}
                />

                {/* Toggle Password */}
                <div
                  className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-[#3c6e71] text-white rounded-lg font-semibold hover:bg-[#284b63] transition"
              >
                {loading ? "Processing..." : "Login"}
              </button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <span
                  className="text-[#3c6e71] cursor-pointer font-semibold hover:underline"
                  onClick={() => navigate("/register")}
                >
                  Register
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
