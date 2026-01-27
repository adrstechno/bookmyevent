import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { checkAndCleanAuth } from "../utils/tokenValidation";
import { useEffect } from "react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, logout } = useAuth();
  
  // Check token validity on route access
  useEffect(() => {
    const hasValidAuth = checkAndCleanAuth();
    if (!hasValidAuth && user) {
      console.log('Invalid token detected in ProtectedRoute, logging out');
      logout();
    }
  }, [user, logout]);

  // Show loading while AuthContext is initializing
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." fullScreen />;
  }

  // Check both AuthContext and localStorage for authentication
  const token = localStorage.getItem("token");
  const isAuthenticated = !!user && !!token;

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get role from user object
  const userRole = user?.role;

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
