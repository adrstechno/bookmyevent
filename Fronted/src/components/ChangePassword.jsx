import React, { useState, useEffect } from "react";

const ChangePassword = ({ visible, onClose }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    console.log("Password updated:", form);
    alert("Password updated successfully!");
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Soft blur background (no black overlay) */}
      <div className="fixed inset-0 z-[998] bg-white/50 backdrop-blur-sm transition" />

      {/* Modal Box */}
      <div className="fixed z-[999] inset-0 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border-t-4 border-[#3c6e71] animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
                placeholder="Enter current password"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3c6e71]"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-5 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-[#3c6e71] hover:bg-[#284b63] text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
              >
                Update
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
