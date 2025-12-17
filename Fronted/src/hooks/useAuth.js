import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook to check authentication status
 * @param {string} requiredRole - Optional role requirement ('admin', 'vendor', 'user')
 * @param {boolean} redirect - Whether to redirect to login if not authenticated (default: false)
 */
const useAuth = (requiredRole = null, redirect = false) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("name") || localStorage.getItem("username");
      const userId = localStorage.getItem("userId") || localStorage.getItem("user_id");

      if (token) {
        setIsAuthenticated(true);
        setUser({ role, name, userId });

        // Check role requirement
        if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
          if (redirect) {
            // Redirect to appropriate dashboard based on actual role
            const dashboardPath = getDashboardPath(role);
            navigate(dashboardPath, { replace: true });
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        
        if (redirect) {
          navigate("/login", { replace: true });
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [requiredRole, redirect, navigate]);

  return { isAuthenticated, isLoading, user };
};

// Helper function to get dashboard path based on role
const getDashboardPath = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/admin/dashboard";
    case "vendor":
      return "/vendor/dashboard";
    case "user":
      return "/user/dashboard";
    case "marketer":
      return "/marketer/dashboard";
    default:
      return "/";
  }
};

export default useAuth;
