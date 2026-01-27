import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import vendorService from "../../../services/vendorService";
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
        const profile = await vendorService.getVendorProfile();
        
        if (profile) {
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

    // Fetch KPIs using service
    const fetchKPIs = async () => {
      try {
        console.log('Fetching vendor KPIs...');
        const response = await vendorService.getVendorKPIs();
        console.log('KPI response:', response);
        if (response?.kpis) {
          console.log('Setting KPIs:', response.kpis);
          setKpis(response.kpis);
        } else {
          console.log('No KPIs in response, using defaults');
        }
      } catch (err) {
        console.error("Error loading KPIs", err);
        console.error("Error details:", err.response?.data);
      }
    };

    // Fetch activities using service
    const fetchActivities = async () => {
      try {
        console.log('Fetching vendor activities...');
        const response = await vendorService.getVendorRecentActivities(5);
        console.log('Activities response:', response);
        if (Array.isArray(response.activities)) {
          console.log('Setting activities:', response.activities);
          setActivities(response.activities);
        } else {
          console.log('No activities in response or not an array');
        }
      } catch (err) {
        console.error("Error loading activities", err);
        console.error("Error details:", err.response?.data);
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
        <main className="flex-1 p-6 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#284b63] mb-2">Vendor Dashboard</h1>
            <p className="text-gray-600">Welcome, {vendorName}! Complete your profile to start receiving bookings.</p>
          </div>

          {/* Profile Setup Required */}
          <div className="flex items-center justify-center">
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
          </div>
        </main>
      </div>
    );
  }

  // Normal dashboard (profile complete)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Section */}
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#284b63] mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {vendorName}! Here's your business overview.</p>
        </div>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Total Sales</h3>
              <CurrencyRupeeIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">₹{kpis.totalSales?.toLocaleString() || 0}</p>
            <span className="text-sm text-gray-500">Lifetime earnings</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">New Orders</h3>
              <ClipboardDocumentListIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{kpis.newOrders || 0}</p>
            <span className="text-sm text-gray-500">This month</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Active Events</h3>
              <ChartPieIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{kpis.activeEvents || 0}</p>
            <span className="text-sm text-gray-500">Ongoing projects</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Total Clients</h3>
              <UserCircleIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{kpis.totalClients || 0}</p>
            <span className="text-sm text-gray-500">Unique customers</span>
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
                <div>
                  <span className="text-gray-700 font-medium">Booking #{act.booking_uuid?.slice(-8)}</span>
                  <span className="text-gray-500 ml-2">— {act.status}</span>
                  {act.user_name && (
                    <div className="text-sm text-gray-500">Customer: {act.user_name}</div>
                  )}
                </div>
                <span className="text-xs text-gray-400">{new Date(act.created_at).toLocaleDateString()}</span>
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
            <div className="text-center">
              <span className="text-4xl mb-2 block">📈</span>
              <span className="text-sm">
                Analytics visualization coming soon
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VendorDashboard;