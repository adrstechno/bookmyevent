import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { VITE_API_BASE_URL } from "../../../utils/api";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({ totalSales: 0, newOrders: 0, activeEvents: 0, totalClients: 0 });
  const [activities, setActivities] = useState([]);
  const [vendorName, setVendorName] = useState("Vendor");
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);

        if (userObj?.email) {
          // email se name part nikaal rahe hain
          const displayName = userObj.email.split("@")[0];
          setVendorName(displayName);
        }
      } catch (err) {
        console.error("Invalid user data in localStorage", err);
      }
    }

    // Check vendor profile first
    const checkVendorProfile = async () => {
      try {
        const res = await axios.get(
          `${VITE_API_BASE_URL}/Vendor/getvendorById`,
          { withCredentials: true }
        );

        if (res.status === 200 && res.data) {
          // Profile exists, proceed with normal dashboard loading
          setProfileIncomplete(false);
          await fetchKPIs();
          await fetchActivities();
        }
      } catch (err) {
        console.error("Error checking vendor profile:", err);
        if (err.response?.status === 404 && err.response?.data?.message === "Vendor not found") {
          // Profile doesn't exist
          setProfileIncomplete(true);
        }
      } finally {
        setLoading(false);
      }
    };

    // ---- EXISTING LOGIC (MOVED TO SEPARATE FUNCTIONS) ----
    const fetchKPIs = async () => {
      try {
        const res = await axios.get(
          `${VITE_API_BASE_URL}/Vendor/GetVendorKPIs`,
          { withCredentials: true }
        );
        if (res.data?.kpis) setKpis(res.data.kpis);
      } catch (err) {
        console.error("Error loading KPIs", err);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await axios.get(
          `${VITE_API_BASE_URL}/Vendor/GetVendorRecentActivities?limit=5`,
          { withCredentials: true }
        );
        if (Array.isArray(res.data.activities)) setActivities(res.data.activities);
      } catch (err) {
        console.error("Error loading activities", err);
      }
    };

    checkVendorProfile();
  }, []);

  const handleCompleteProfile = () => {
    navigate("/vendor/setting");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Profile incomplete state
  if (profileIncomplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <header className="bg-[#3c6e71] text-white shadow-md py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">Vendor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <UserCircleIcon className="h-8 w-8 text-white" />
            <span className="font-medium">Welcome, {vendorName}</span>
          </div>
        </header>

        {/* Profile Setup Required */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-orange-500">
              <div className="mb-6">
                <ExclamationTriangleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Profile Setup Required
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  To access your vendor dashboard and start receiving bookings,
                  you need to complete your vendor profile first.
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-orange-800 mb-2">What you need to provide:</h3>
                <ul className="text-sm text-orange-700 text-left space-y-1">
                  <li>• Business name and description</li>
                  <li>• Service category</li>
                  <li>• Contact information</li>
                  <li>• Business address</li>
                  <li>• Profile picture</li>
                </ul>
              </div>

              <button
                onClick={handleCompleteProfile}
                className="w-full bg-[#3c6e71] hover:bg-[#284b63] text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                <CogIcon className="h-5 w-5" />
                <span>Complete Profile Setup</span>
              </button>

              <p className="text-xs text-gray-500 mt-4">
                This will only take a few minutes to complete
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Normal dashboard (profile complete)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-[#3c6e71] text-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">Vendor Dashboard</h1>
        <div className="flex items-center space-x-4">
          <UserCircleIcon className="h-8 w-8 text-white" />
          <span className="font-medium">Welcome, {vendorName}</span>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 p-6 md:p-10">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Total Sales</h3>
              <CurrencyRupeeIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">₹{kpis.totalSales ?? 0}</p>
            <span className="text-sm text-gray-500">+18% from last month</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">New Orders</h3>
              <ClipboardDocumentListIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{kpis.newOrders ?? 0}</p>
            <span className="text-sm text-gray-500">+9% this week</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Active Events</h3>
              <ChartPieIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{kpis.activeEvents ?? 0}</p>
            <span className="text-sm text-gray-500">Ongoing projects</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Total Clients</h3>
              <UserCircleIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{kpis.totalClients ?? 0}</p>
            <span className="text-sm text-gray-500">+3 new this week</span>
          </div>
        </div>

        {/* Recent Activities */}
        <section className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <ul className="divide-y divide-gray-100">
            {activities.length === 0 && (
              <li className="py-3 text-gray-500">No recent activities</li>
            )}
            {activities.map((act) => (
              <li key={act.booking_id} className="py-3 flex justify-between items-center">
                <span className="text-gray-700">Booking {act.booking_uuid} — {act.status}</span>
                <span className="text-xs text-gray-400">{new Date(act.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Performance Chart Placeholder */}
        <section className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Overview
          </h2>
          <div className="w-full h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <span className="text-sm">
              📈 Chart or Analytics Visualization Placeholder
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VendorDashboard;