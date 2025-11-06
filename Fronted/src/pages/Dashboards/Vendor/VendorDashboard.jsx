import React from "react";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const VendorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-[#3c6e71] text-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">Vendor Dashboard</h1>
        <div className="flex items-center space-x-4">
          <UserCircleIcon className="h-8 w-8 text-white" />
          <span className="font-medium">Welcome, Vendor</span>
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
            <p className="text-2xl font-semibold text-gray-900">₹52,340</p>
            <span className="text-sm text-gray-500">+18% from last month</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">New Orders</h3>
              <ClipboardDocumentListIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">126</p>
            <span className="text-sm text-gray-500">+9% this week</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Active Events</h3>
              <ChartPieIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">14</p>
            <span className="text-sm text-gray-500">Ongoing projects</span>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Total Clients</h3>
              <UserCircleIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">84</p>
            <span className="text-sm text-gray-500">+3 new this week</span>
          </div>
        </div>

        {/* Recent Activities */}
        <section className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activities
          </h2>
          <ul className="divide-y divide-gray-100">
            {[
              { text: "New booking received from John Doe.", time: "2 hours ago" },
              { text: "Updated profile and service description.", time: "5 hours ago" },
              { text: "Renewed annual vendor subscription.", time: "Yesterday" },
              { text: "Event successfully completed for client Sarah.", time: "2 days ago" },
            ].map((item, i) => (
              <li key={i} className="py-3 flex justify-between items-center">
                <span className="text-gray-700">{item.text}</span>
                <span className="text-xs text-gray-400">{item.time}</span>
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

      {/* Footer */}
      <footer className="bg-[#284b63] text-gray-100 text-center py-4 text-sm mt-auto">
        © {new Date().getFullYear()} Vendor Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default VendorDashboard;
