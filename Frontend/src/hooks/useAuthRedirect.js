import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const requireAuth = (action = 'perform this action', redirectPath = '/login') => {
    const token = localStorage.getItem('token');
    
    if (!token || !user) {
      toast.error(`Please login to ${action}`);
      
      // Store the current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      navigate(`${redirectPath}?redirect=${encodeURIComponent(currentPath)}`);
      
      return false;
    }
    
    return true;
  };

  const requireRole = (allowedRoles, action = 'access this page') => {
    if (!requireAuth(action)) {
      return false;
    }

    const userRole = user?.role || localStorage.getItem('role');
    
    if (!allowedRoles.includes(userRole)) {
      toast.error(`You don't have permission to ${action}`);
      
      // Redirect to appropriate dashboard based on role
      if (userRole === 'admin') navigate('/admin/dashboard');
      else if (userRole === 'vendor') navigate('/vendor/dashboard');
      else if (userRole === 'user') navigate('/user/dashboard');
      else navigate('/');
      
      return false;
    }
    
    return true;
  };

  return {
    requireAuth,
    requireRole,
    isAuthenticated: !!(localStorage.getItem('token') && user),
    user
  };
};

export default useAuthRedirect;