import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
} from "lucide-react";
import adminService from "../../../services/adminService";
import { useAuth } from "../../../context/AuthContext";

const BRAND = "#3C6E71";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeBookings: 0,
    monthlyGrowth: { percentage: 0 }
  });
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState({
    monthlyBookings: [],
    statusDistribution: [],
    topVendors: []
  });
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Fetching admin dashboard data...');
        console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
        console.log('Current user:', user);
        
        // Set debug info
        setDebugInfo({
          apiUrl: import.meta.env.VITE_API_BASE_URL,
          user: user,
          timestamp: new Date().toISOString()
        });
        
        // Test authentication first
        console.log('Testing authentication...');
        
        // Fetch all dashboard data
        console.log('Making API calls...');
        const [kpisResponse, activitiesResponse, analyticsResponse] = await Promise.all([
          adminService.getAdminKPIs().catch(err => {
            console.error('KPIs API error:', err);
            return { success: false, error: err.message, response: err.response };
          }),
          adminService.getAdminRecentActivities(5).catch(err => {
            console.error('Activities API error:', err);
            return { success: false, error: err.message, response: err.response };
          }),
          adminService.getAdminAnalytics().catch(err => {
            console.error('Analytics API error:', err);
            return { success: false, error: err.message, response: err.response };
          })
        ]);

        console.log('📊 Admin KPIs response:', kpisResponse);
        console.log('📋 Admin activities response:', activitiesResponse);
        console.log('📈 Admin analytics response:', analyticsResponse);

        // Update debug info with API responses
        setDebugInfo(prev => ({
          ...prev,
          apiResponses: {
            kpis: kpisResponse,
            activities: activitiesResponse,
            analytics: analyticsResponse
          }
        }));

        if (kpisResponse.success) {
          console.log('✅ Setting admin KPIs:', kpisResponse.data);
          setKpis(kpisResponse.data);
        } else {
          console.log('❌ Admin KPIs request failed:', kpisResponse);
        }

        if (activitiesResponse.success) {
          console.log('✅ Setting admin activities:', activitiesResponse.data);
          setActivities(activitiesResponse.data);
        } else {
          console.log('❌ Admin activities request failed:', activitiesResponse);
        }

        if (analyticsResponse.success) {
          console.log('✅ Setting admin analytics:', analyticsResponse.data);
          setAnalytics(analyticsResponse.data);
        } else {
          console.log('❌ Admin analytics request failed:', analyticsResponse);
        }

      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        
        setDebugInfo(prev => ({
          ...prev,
          error: {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          }
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const stats = [
    { 
      label: "Total Users", 
      value: kpis.totalUsers.toLocaleString(), 
      change: `${kpis.monthlyGrowth.percentage >= 0 ? '+' : ''}${kpis.monthlyGrowth.percentage}%`, 
      icon: Users 
    },
    { 
      label: "Total Bookings", 
      value: kpis.totalBookings.toLocaleString(), 
      change: "+8.2%", 
      icon: Calendar 
    },
    { 
      label: "Revenue", 
      value: `₹${(kpis.totalRevenue / 100000).toFixed(1)}L`, 
      change: "+15.3%", 
      icon: IndianRupee 
    },
    { 
      label: "Total Vendors", 
      value: kpis.totalVendors.toLocaleString(), 
      change: "+5.1%", 
      icon: TrendingUp 
    },
  ];

  const metrics = [
    { label: "Pending Approvals", value: Math.min((kpis.pendingApprovals / Math.max(kpis.totalBookings, 1)) * 100, 100) },
    { label: "Active Bookings", value: Math.min((kpis.activeBookings / Math.max(kpis.totalBookings, 1)) * 100, 100) },
    { label: "User Growth", value: Math.min(Math.abs(kpis.monthlyGrowth.percentage), 100) },
    { label: "Platform Health", value: 94 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Debug Info (only show in development) */}
      {import.meta.env.DEV && debugInfo && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔧 Debug Information</h3>
          <div className="text-xs text-yellow-700">
            <p><strong>API URL:</strong> {debugInfo.apiUrl}</p>
            <p><strong>User Role:</strong> {debugInfo.user?.role}</p>
            <p><strong>User ID:</strong> {debugInfo.user?.user_id}</p>
            <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
            {debugInfo.error && (
              <div className="mt-2 p-2 bg-red-100 rounded">
                <p><strong>Error:</strong> {debugInfo.error.message}</p>
                <p><strong>Status:</strong> {debugInfo.error.status}</p>
              </div>
            )}
            {debugInfo.apiResponses && (
              <div className="mt-2">
                <p><strong>KPIs Success:</strong> {debugInfo.apiResponses.kpis?.success ? '✅' : '❌'}</p>
                <p><strong>Activities Success:</strong> {debugInfo.apiResponses.activities?.success ? '✅' : '❌'}</p>
                <p><strong>Analytics Success:</strong> {debugInfo.apiResponses.analytics?.success ? '✅' : '❌'}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                    {Math.round(metric.value)}%
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

        {/* Recent Activities */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h3>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activities</p>
            ) : (
              activities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="shrink-0">
                    {activity.admin_approval === 'pending' ? (
                      <Clock className="w-4 h-4 text-orange-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user_name || 'User'} - {activity.package_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.vendor_name} • ₹{activity.amount}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {analytics.topVendors.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Vendors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topVendors.slice(0, 6).map((vendor, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{vendor.business_name}</h4>
                <p className="text-sm text-gray-600">{vendor.booking_count} bookings</p>
                <p className="text-sm text-green-600">₹{vendor.total_revenue}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
