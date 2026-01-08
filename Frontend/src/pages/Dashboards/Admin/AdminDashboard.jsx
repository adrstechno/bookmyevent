import {
  Users,
  Calendar,
  TrendingUp,
  IndianRupee,
} from "lucide-react";

const BRAND = "#3C6E71";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "1,240", change: "+12.5%", icon: Users },
    { label: "Total Events", value: "340", change: "+8.2%", icon: Calendar },
    { label: "Revenue", value: "₹1.2M", change: "+15.3%", icon: IndianRupee },
    { label: "Growth Rate", value: "18%", change: "-2.1%", icon: TrendingUp },
  ];

  const metrics = [
    { label: "User Engagement", value: 85 },
    { label: "Event Success Rate", value: 92 },
    { label: "Revenue Target", value: 78 },
    { label: "Customer Satisfaction", value: 94 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of platform performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((item, index) => {
          const Icon = item.icon;
          const positive = item.change.startsWith("+");

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex items-center justify-between">
                <Icon
                  className="w-6 h-6"
                  style={{ color: BRAND }}
                />
                <span
                  className={`text-sm font-medium ${positive ? "text-green-600" : "text-red-500"
                    }`}
                >
                  {item.change}
                </span>
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </h2>
                <p className="text-sm text-gray-500">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Performance Metrics
          </h3>

          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {metric.value}%
                  </span>
                </div>

                <div className="h-2.5 bg-gray-200 rounded-full">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: BRAND,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            {[
              "View Analytics",
              "Manage Users",
              "Create Event",
              "Settings",
            ].map((action, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 transition"
                style={{
                  borderColor: "#e5e7eb",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = BRAND;
                  e.currentTarget.style.backgroundColor = "#f0f7f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
