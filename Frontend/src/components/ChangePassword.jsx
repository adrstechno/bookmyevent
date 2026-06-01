import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { VITE_API_BASE_URL } from "../utils/api"; // adjust import if needed

const ChangePassword = ({ visible, onClose }) => {
  const [form, setForm] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.oldPassword || !form.newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // Create form data for x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append("email", form.email);
      params.append("oldPassword", form.oldPassword);
      params.append("newPassword", form.newPassword);

      const response = await axios.post(
        `${VITE_API_BASE_URL}/User/changePassword`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true, // allows cookies to be sent if needed
        }
      );

      toast.success(response.data.message || "Password changed successfully");
      setForm({ email: "", oldPassword: "", newPassword: "" });
      onClose();
    } catch (error) {
      console.error("Change Password Error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Soft blurred background */}
      <div className="fixed inset-0 z-[998] bg-white/50 backdrop-blur-sm transition" />

      {/* Modal */}
      <div className="fixed z-[999] inset-0 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md border-t-4 border-[#3c6e71] animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
              />
            </div>

            {/* Old Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Old Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                placeholder="Enter old password"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-5 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-semibold py-2 px-6 rounded-lg shadow-md transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Animation */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChangePassword;
