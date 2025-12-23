import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBell, FiCheck, FiCheckCircle, FiTrash2, FiArchive, FiArrowLeft,
  FiCalendar, FiStar, FiKey, FiAlertCircle, FiFilter, FiRefreshCw,
} from "react-icons/fi";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Footer from "../components/mainpage/Footer";
import notificationService from "../services/notificationService";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const params = { page: currentPage, limit: 20 };
      if (filter === "unread") params.status = "unread";
      if (filter === "read") params.status = "read";

      const response = await notificationService.getNotifications(params);
      const newNotifications = response.data?.notifications || [];
      
      if (reset) {
        setNotifications(newNotifications);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      setHasMore(response.data?.pagination?.hasMore || false);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationService.archiveNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification archived");
    } catch (error) {
      toast.error("Failed to archive notification");
    }
  };

  const getNotificationIcon = (type) => {
    if (type?.includes("booking")) return <FiCalendar className="text-blue-500" />;
    if (type?.includes("otp")) return <FiKey className="text-purple-500" />;
    if (type?.includes("review")) return <FiStar className="text-yellow-500" />;
    return <FiAlertCircle className="text-gray-500" />;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white flex flex-col min-h-screen">
      <HomeNavbar />

      <motion.button onClick={() => navigate(-1)}
        className="fixed top-24 left-6 z-50 bg-white border-2 border-[#3c6e71] text-[#3c6e71] hover:bg-[#3c6e71] hover:text-white p-4 rounded-full shadow-2xl">
        <FiArrowLeft className="text-2xl" />
      </motion.button>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#284b63] via-[#3c6e71] to-[#284b63] py-16 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <FiBell className="text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-200">Stay updated with your bookings and activities</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 flex-grow w-full">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "read", label: "Read" },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === tab.key ? "bg-[#3c6e71] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[#3c6e71] hover:bg-gray-100 border flex items-center gap-1">
                <FiCheckCircle /> Mark all read
              </button>
            )}
            <button onClick={() => fetchNotifications(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[#3c6e71] hover:bg-gray-100 border flex items-center gap-1">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-[#3c6e71] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Notifications</h2>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div key={notification.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${!notification.is_read ? "border-[#3c6e71] bg-blue-50/30" : "border-gray-200"}`}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold ${!notification.is_read ? "text-[#284b63]" : "text-gray-800"}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>}
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-400">{formatTimeAgo(notification.created_at)}</span>
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Mark as read">
                            <FiCheck />
                          </button>
                        )}
                        <button onClick={() => handleArchive(notification.id)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Archive">
                          <FiArchive />
                        </button>
                        <button onClick={() => handleDelete(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {hasMore && (
              <button onClick={() => { setPage(p => p + 1); fetchNotifications(); }} disabled={loading}
                className="w-full py-3 bg-white text-[#3c6e71] rounded-xl font-semibold hover:bg-gray-50 border border-gray-200 disabled:opacity-50">
                {loading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
