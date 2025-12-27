import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Show loading while AuthContext is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3c6e71]"></div>
      </div>
    );
  }

  // Not logged in - check both AuthContext and localStorage
  if (!token || (!user && !role)) {
    return <Navigate to="/login" replace />;
  }

  // Get role from user object or localStorage
  const userRole = user?.role || role;

  // Role-based protection
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "vendor") return <Navigate to="/vendor/dashboard" replace />;
    if (userRole === "user") return <Navigate to="/user/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
