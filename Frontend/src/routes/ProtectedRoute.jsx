import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role-based protection
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "vendor") return <Navigate to="/vendor/dashboard" replace />;
    if (role === "user") return <Navigate to="/user/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
