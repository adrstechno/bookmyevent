import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import dashboardService from "../../../services/dashboardService";
import {
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  HeartIcon,
  UserCircleIcon,
  LifebuoyIcon,
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
        const k = await dashboardService.getUserKpis();
        if (k?.success) setKpis(k.data);

        const c = await dashboardService.getMonthlyChart();
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

          setChartData(
            c.data.map((r) => ({
              month: formatMonth(r.month),
              bookings: Number(r.bookings) || 0,
              payments: Number(r.payments) || 0,
            }))
          );
        }
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoadingChart(false);
      }
    })();
  }, []);

  /* 🔹 KPI dummy data */
  const kpiData = kpis || {
    bookings: 0,
    totalPayment: 0,
    savedVendors: 0,
    tickets: 0,
  };

  /* 🔹 Colorful monthly chart data */
  const finalChartData = chartData; // rely on API; show loading/no-data states below

  return (
    <div className="min-h-screen  bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <header className="bg-[#3c6e71] text-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">User Dashboard</h1>
        <div className="flex items-center gap-2">
          <UserCircleIcon className="h-8 w-8" />
          <span className="font-medium">Hi, {userName}</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-8 space-y-8">
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
        {/* CHART SECTION */}
        <section className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Activity Overview
          </h2>

          <div className="h-72 flex items-center justify-center">
            {loadingChart ? (
              <p className="text-gray-500">Loading chart...</p>
            ) : finalChartData.length === 0 ? (
              <p className="text-gray-500">
                No chart data for the last 6 months
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finalChartData} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />

                  <defs>
                    <linearGradient
                      id="bookingGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3c6e71" />
                      <stop offset="100%" stopColor="#84a98c" />
                    </linearGradient>

                    <linearGradient
                      id="paymentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
              </ResponsiveContainer>
            )}
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
