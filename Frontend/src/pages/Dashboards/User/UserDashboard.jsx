import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../services/dashboardService";
import {
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  HeartIcon,
  UserCircleIcon,
  LifebuoyIcon,
  HomeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const UserDashboard = () => {
  const [userName, setUserName] = useState("User");
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  /* 🔹 Read user email from localStorage */
  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);

        if (userObj?.email) {
          const displayName = userObj.email.split("@")[0];
          setUserName(displayName);
        }
      } catch (err) {
        console.error("Invalid user data in localStorage", err);
      }
    }
    // fetch dashboard data
    (async () => {
      try {
        console.log('Fetching user dashboard data...');
        
        const k = await dashboardService.getUserKpis();
        console.log('User KPIs response:', k);
        if (k?.success) {
          console.log('Setting user KPIs:', k.data);
          setKpis(k.data);
        } else {
          console.log('User KPIs request failed or no success flag');
        }

        const c = await dashboardService.getMonthlyChart();
        console.log('User chart response:', c);
        if (c?.success) {
          // convert YYYY-MM to short month names and ensure numbers
          const formatMonth = (ym) => {
            try {
              const [y, m] = ym.split("-");
              const d = new Date(Number(y), Number(m) - 1, 1);
              return d.toLocaleString("en", { month: "short" });
            } catch {
              return ym;
            }
          };

          const formattedData = c.data.map((r) => ({ 
            month: formatMonth(r.month), 
            bookings: Number(r.bookings) || 0, 
            payments: Number(r.payments) || 0 
          }));
          
          console.log('Setting user chart data:', formattedData);
          setChartData(formattedData);
        } else {
          console.log('User chart request failed or no success flag');
        }
      } catch (err) {
        console.error("Dashboard load error", err);
        console.error("Error details:", err.response?.data);
      } finally {
        setLoadingChart(false);
      }
    })();
  }, []);

  /* 🔹 KPI dummy data */
  const kpiData = kpis || { bookings: 0, totalPayment: 0, savedVendors: 0, tickets: 0 };

  /* 🔹 Colorful monthly chart data */
  const finalChartData = chartData; // rely on API; show loading/no-data states below

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center text-sm text-gray-600">
          <button
            onClick={() => navigate('/')}
            className="hover:text-[#3c6e71] transition-colors duration-200 flex items-center gap-1"
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </button>
          <span className="mx-2">/</span>
          <span className="text-[#3c6e71] font-medium">Dashboard</span>
        </div>
      </div>
      
      {/* MAIN */}
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#284b63] mb-2">User Dashboard</h1>
            <p className="text-gray-600">Hi, {userName}! Manage your bookings and explore services.</p>
          </div>
          
          {/* Home Button */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-[#3c6e71] hover:bg-[#284b63] text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Go to Home</span>
            </button>
            
            <button
              onClick={() => navigate('/services')}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#3c6e71] border-2 border-[#3c6e71] rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <CalendarDaysIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Book Services</span>
            </button>
          </div>
        </div>
        
        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-[#3c6e71] to-[#284b63] text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <HomeIcon className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Home</span>
            </button>
            
            <button
              onClick={() => navigate('/services')}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <CalendarDaysIcon className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Book Now</span>
            </button>
            
            <button
              onClick={() => navigate('/user/bookings')}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <UserCircleIcon className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">My Bookings</span>
            </button>
            
            <button
              onClick={() => navigate('/contact')}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <LifebuoyIcon className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Support</span>
            </button>
          </div>
        </div>
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="My Bookings"
            value={kpiData.bookings}
            subtitle="Active events"
            icon={<CalendarDaysIcon className="h-6 w-6 text-[#3c6e71]" />}
          />
          <KpiCard
            title="Payments"
            value={`₹${Number(kpiData.totalPayment || 0).toLocaleString()}`}
            subtitle="Total paid"
            icon={<CurrencyRupeeIcon className="h-6 w-6 text-[#3c6e71]" />}
          />
          <KpiCard
            title="Saved Vendors"
            value={kpiData.savedVendors}
            subtitle="Favorites"
            icon={<HeartIcon className="h-6 w-6 text-[#3c6e71]" />}
          />
          <KpiCard
            title="Support Tickets"
            value={kpiData.tickets}
            subtitle="Open"
            icon={<LifebuoyIcon className="h-6 w-6 text-[#3c6e71]" />}
          />
        </div>

        {/* CHART SECTION */}
        <section className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Activity Overview
          </h2>

          <div className="h-72 ">
            <ResponsiveContainer width="100%" height="100%">
              {loadingChart ? (
                <div className="flex items-center justify-center  h-full">Loading chart...</div>
              ) : finalChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full">No chart data for the last 6 months</div>
              ) : (
                <BarChart data={finalChartData} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <defs>
                  <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3c6e71" />
                    <stop offset="100%" stopColor="#84a98c" />
                  </linearGradient>

                  <linearGradient id="paymentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f4a261" />
                    <stop offset="100%" stopColor="#e76f51" />
                  </linearGradient>
                </defs>

                <Bar
                  dataKey="bookings"
                  fill="url(#bookingGradient)"
                  radius={[8, 8, 0, 0]}
                  name="Bookings"
                />
                <Bar
                  dataKey="payments"
                  fill="url(#paymentGradient)"
                  radius={[8, 8, 0, 0]}
                  name="Payments (₹)"
                />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#284b63] text-gray-100 text-center py-4 text-sm">
        © {new Date().getFullYear()} GoEventify. All rights reserved.
      </footer>
    </div>
  );
};

/* 🔹 Reusable KPI Card */
const KpiCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white shadow-md rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-lg transition">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-gray-700 font-medium">{title}</h3>
      {icon}
    </div>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
    <span className="text-sm text-gray-500">{subtitle}</span>
  </div>
);

export default UserDashboard;
