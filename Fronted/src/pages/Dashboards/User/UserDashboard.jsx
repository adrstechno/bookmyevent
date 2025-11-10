import React, { useEffect, useState } from "react";
import {
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  HeartIcon,
  BellAlertIcon,
  UserCircleIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";

const UserDashboard = () => {
  const [user, setUser] = useState({});
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Demo data until backend integration
    setUser({ name: "Aarav Mehta", email: "aarav@example.com" });
    setBookings([
      { id: 1, event: "Wedding Ceremony", date: "2025-12-20", status: "Confirmed", amount: "₹85,000" },
      { id: 2, event: "Corporate Launch", date: "2026-01-10", status: "Pending", amount: "₹45,000" },
    ]);
    setNotifications([
      { id: 1, message: "Your payment for 'Wedding Ceremony' was successful.", time: "3 hrs ago" },
      { id: 2, message: "Vendor has shared decoration layout for your event.", time: "1 day ago" },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-[#3c6e71] text-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">User Dashboard</h1>
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="h-8 w-8 text-white" />
          <span className="font-medium">Hi, {user.name}</span>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 p-6 md:p-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Bookings */}
          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">My Bookings</h3>
              <CalendarDaysIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {bookings.length}
            </p>
            <span className="text-sm text-gray-500">
              Active event bookings
            </span>
          </div>

          {/* Payments */}
          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Payments</h3>
              <CurrencyRupeeIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">₹1,30,000</p>
            <span className="text-sm text-gray-500">Total paid this year</span>
          </div>

          {/* Saved Vendors */}
          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Saved Vendors</h3>
              <HeartIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">5</p>
            <span className="text-sm text-gray-500">Your favorite partners</span>
          </div>

          {/* Support Tickets */}
          <div className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-[#3c6e71] hover:shadow-2xl transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">Support Tickets</h3>
              <LifebuoyIcon className="h-6 w-6 text-[#3c6e71]" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">2</p>
            <span className="text-sm text-gray-500">Pending responses</span>
          </div>
        </div>

        {/* My Bookings */}
        <section className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            My Bookings
          </h2>
          {bookings.length > 0 ? (
            <table className="w-full text-left border-t border-gray-100">
              <thead>
                <tr className="text-gray-700 border-b">
                  <th className="py-2">Event</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{booking.event}</td>
                    <td>{booking.date}</td>
                    <td>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>{booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">You have no event bookings yet.</p>
          )}
        </section>

        {/* Notifications */}
        <section className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Notifications
            </h2>
            <BellAlertIcon className="h-6 w-6 text-[#3c6e71]" />
          </div>
          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {notifications.map((note) => (
                <li key={note.id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-700">{note.message}</span>
                  <span className="text-xs text-gray-400">{note.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No new notifications.</p>
          )}
        </section>

        {/* Help Section */}
        <section className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Need Help?
          </h2>
          <p className="text-gray-600 mb-4">
            Facing an issue with your booking or event planning?  
            Our support team is available 24/7 to assist you.
          </p>
          <button className="bg-[#3c6e71] text-white px-5 py-2 rounded-lg hover:bg-[#2d5559] transition">
            Contact Support
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#284b63] text-gray-100 text-center py-4 text-sm mt-auto">
        © {new Date().getFullYear()} EventPlus — User Dashboard. All rights reserved.
      </footer>
    </div>
  );
};

export default UserDashboard;
