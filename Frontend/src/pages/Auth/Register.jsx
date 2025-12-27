// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { VITE_API_BASE_URL } from "../../utils/api";

// // React Icons
// import { FaUser, FaPhoneAlt, FaRegEnvelope, FaLock } from "react-icons/fa";
// import { RiUserAddFill } from "react-icons/ri";

// const Register = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     user_type: "user",
//     email: "",
//     phone: "",
//     password: "",
//   });

//   const [isVendorSignup, setIsVendorSignup] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   // VALIDATION
//   const validate = () => {
//     let err = {};

//     if (!formData.first_name.trim()) {
//       err.first_name = "First name is required";
//     }

//     if (!formData.email.trim()) {
//       err.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       err.email = "Enter a valid email";
//     }

//     if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
//       err.phone = "Phone must be a valid 10-digit number";
//     }

//     if (!formData.password.trim()) {
//       err.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       err.password = "Password must be at least 6 characters";
//     }

//     return err;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationErrors = validate();
//     setErrors(validationErrors);
//     if (Object.keys(validationErrors).length > 0) return;

//     setLoading(true);

//     try {
//       const payload = {
//         ...formData,
//         user_type: isVendorSignup ? "vendor" : "user",
//       };

//       await axios.post(`${VITE_API_BASE_URL}/User/InsertUser`, payload);

//       toast.success("Registration Successful");
//       setTimeout(() => navigate("/login"), 800);
//     } catch (error) {
//       toast.error("Something went wrong" ,error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//   <>
//     <div
//       className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
//       style={{
//         backgroundImage:
//           "url('https://cdn.pixabay.com/photo/2016/12/03/15/41/fireworks-1880042_1280.jpg')",
//       }}
//     >
//       {/* Dark overlay for contrast */}
//       <div className="absolute inset-0 bg-black/40"></div>

//       {/* Register Card */}
//       <div className="relative w-full max-w-md mx-4 bg-white/20 backdrop-blur-md rounded-xl shadow-2xl p-8 ">
//         {/* Header */}
//         <div className="flex flex-col items-center mb-6">
//           <div className="w-14 h-14 bg-[#3c6e71] text-white rounded-full flex items-center justify-center shadow-md">
//             <RiUserAddFill size={28} />
//           </div>

//           <h2 className="text-3xl font-bold mt-4 text-black-800">
//             {isVendorSignup ? "Vendor Sign Up" : "Create Your Account"}
//           </h2>

//           <p className="text-black-600 text-sm">
//             {isVendorSignup
//               ? "Join as a vendor and grow your business"
//               : "Let's get you started"}
//           </p>
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* First + Last Name */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <div className="relative">
//               <FaUser className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 name="first_name"
//                 placeholder="First Name"
//                 value={formData.first_name}
//                 onChange={handleChange}
//                 className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-gray-50/80 outline-none ${
//                   errors.first_name ? "border-red-500" : "border-gray-300"
//                 } focus:ring-2 focus:ring-[#3c6e71]`}
//               />
//               {errors.first_name && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.first_name}
//                 </p>
//               )}
//             </div>

//             <div className="relative">
//               <FaUser className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 name="last_name"
//                 placeholder="Last Name"
//                 value={formData.last_name}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-3 py-2.5 rounded-lg border bg-gray-50/80 border-gray-300 outline-none focus:ring-2 focus:ring-[#3c6e71]"
//               />
//             </div>
//           </div>

//           {/* Email */}
//           <div className="relative">
//             <FaRegEnvelope className="absolute left-3 top-3 text-gray-500" />
//             <input
//               name="email"
//               placeholder="Email Address"
//               value={formData.email}
//               onChange={handleChange}
//               className={`w-full pl-10 pr-3 py-2.5 rounded-lg border outline-none bg-gray-50/80 ${
//                 errors.email ? "border-red-500" : "border-gray-300"
//               } focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//             )}
//           </div>

//           {/* Phone */}
//           <div className="relative">
//             <FaPhoneAlt className="absolute left-3 top-3 text-gray-500" />
//             <input
//               name="phone"
//               placeholder="Phone Number"
//               value={formData.phone}
//               onChange={handleChange}
//               className={`w-full pl-10 pr-3 py-2.5 rounded-lg border outline-none bg-gray-50/80 ${
//                 errors.phone ? "border-red-500" : "border-gray-300"
//               } focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.phone && (
//               <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//             )}
//           </div>

//           {/* Password */}
//           <div className="relative">
//             <FaLock className="absolute left-3 top-3 text-gray-500" />
//             <input
//               name="password"
//               type="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               className={`w-full pl-10 pr-3 py-2.5 rounded-lg border outline-none bg-gray-50/80 ${
//                 errors.password ? "border-red-500" : "border-gray-300"
//               } focus:ring-2 focus:ring-[#3c6e71]`}
//             />
//             {errors.password && (
//               <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//             )}
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 bg-[#3c6e71] text-white rounded-lg font-semibold hover:bg-[#284b63] transition"
//           >
//             {loading
//               ? "Registering..."
//               : isVendorSignup
//               ? "Register as Vendor"
//               : "Register"}
//           </button>

//           {/* Vendor Switch */}
//           <p className="text-center text-sm text-black-700">
//             {isVendorSignup ? (
//               <>
//                 Want to register as a normal user?{" "}
//                 <span
//                   className="text-black cursor-pointer font-semibold hover:underline"
//                   onClick={() => {
//                     setIsVendorSignup(false);
//                     setFormData({ ...formData, user_type: "user" });
//                   }}
//                 >
//                   Sign Up as User
//                 </span>
//               </>
//             ) : (
//               <>
//                 Want to offer services?{" "}
//                 <span
//                   className="text-black-800 cursor-pointer font-semibold hover:underline"
//                   onClick={() => {
//                     setIsVendorSignup(true);
//                     setFormData({ ...formData, user_type: "vendor" });
//                   }}
//                 >
//                   Sign Up as Vendor
//                 </span>
//               </>
//             )}
//           </p>

//           {/* Login Link */}
//           <p className="text-center text-sm text-black-700">
//             Already have an account?{" "}
//             <span
//               className="text-black cursor-pointer font-semibold hover:underline"
//               onClick={() => navigate("/login")}
//             >
//               Login
//             </span>
//           </p>
//         </form>
//       </div>
//     </div>
//   </>
// );

// };

// export default Register;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../utils/api";

// React Icons
import {
  FaUser,
  FaPhoneAlt,
  FaRegEnvelope,
  FaLock,
  FaRegEye,
  FaRegEyeSlash,
} from "react-icons/fa";
import { RiUserAddFill } from "react-icons/ri";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_type: "user",
    email: "",
    phone: "",
    password: "",
  });

  const [isVendorSignup, setIsVendorSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  /* ---------- Validation ---------- */
  const validate = () => {
    let err = {};

    if (!formData.first_name.trim()) {
      err.first_name = "First name is required";
    }

    if (!formData.email.trim()) {
      err.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      err.email = "Enter a valid email";
    }

    if (!formData.phone.trim()) {
      err.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      err.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.password.trim()) {
      err.password = "Password is required";
    } else if (formData.password.length < 6) {
      err.password = "Password must be at least 6 characters";
    }

    return err;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        user_type: isVendorSignup ? "vendor" : "user",
      };

      await axios.post(`${VITE_API_BASE_URL}/User/InsertUser`, payload);

      toast.success("Registration successful");
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      if (error.response?.data?.message) {
        const msg = error.response.data.message.toLowerCase();

        if (msg.includes("phone")) {
          setErrors({ phone: "Phone number already exists" });
          toast.error("Phone number already exists");
        } else if (msg.includes("email")) {
          setErrors({ email: "Email already exists" });
          toast.error("Email already exists");
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/736x/3f/4c/e4/3f4ce4265b717aacce9b6b8378018292.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Register Card */}
      <div className="relative w-full max-w-md mx-4 bg-white/20 backdrop-blur-md rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#3c6e71] text-white rounded-full flex items-center justify-center shadow-md">
            <RiUserAddFill size={28} />
          </div>

          <h2 className="text-3xl font-bold mt-4 text-gray-900">
            {isVendorSignup ? "Vendor Sign Up" : "User Sign Up"}
          </h2>

          <p className="text-gray-700 text-sm">
            {isVendorSignup
              ? "Join as a vendor and grow your business"
              : "Let's get you started events"}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-500" />
              <input
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full pl-10 py-2.5 rounded-lg border bg-gray-50/80 outline-none ${
                  errors.first_name ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-[#3c6e71]`}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>

            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-500" />
              <input
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full pl-10 py-2.5 rounded-lg border bg-gray-50/80 border-gray-300 outline-none focus:ring-2 focus:ring-[#3c6e71]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <FaRegEnvelope className="absolute left-3 top-3 text-gray-500" />
            <input
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 py-2.5 rounded-lg border outline-none bg-gray-50/80 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhoneAlt className="absolute left-3 top-3 text-gray-500" />
            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-10 py-2.5 rounded-lg border outline-none bg-gray-50/80 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-[#3c6e71]`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none bg-gray-50/80 ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-[#3c6e71]`}
            />

            <span
              className="absolute right-3 top-3 text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </span>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3c6e71] text-white rounded-lg font-semibold hover:bg-[#284b63] transition"
          >
            {loading
              ? "Registering..."
              : isVendorSignup
              ? "Register as Vendor"
              : "Register as User"}
          </button>

          {/* Vendor Switch */}
          <p className="text-center text-sm text-gray-800">
            {isVendorSignup ? (
              <>
                Want a normal account?{" "}
                <span
                  className="text-[#284b63] cursor-pointer font-semibold hover:underline"
                  onClick={() => {
                    setIsVendorSignup(false);
                    setFormData({ ...formData, user_type: "user" });
                  }}
                >
                  Sign Up as User
                </span>
              </>
            ) : (
              <>
                Want to offer services?{" "}
                <span
                  className="text-[#284b63] cursor-pointer font-semibold hover:underline"
                  onClick={() => {
                    setIsVendorSignup(true);
                    setFormData({ ...formData, user_type: "vendor" });
                  }}
                >
                  Sign Up as Vendor
                </span>
              </>
            )}
          </p>

          {/* Login */}
          <p className="text-center text-sm text-gray-800">
            Already have an account?{" "}
            <span
              className="text-[#284b63] cursor-pointer font-semibold hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
