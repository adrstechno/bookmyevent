import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const RouteDebugger = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Current route:', location.pathname);
    console.log('Search params:', location.search);
    console.log('Full URL:', window.location.href);

    // If we're on the root path but have a token parameter, it might be a verification link
    if (location.pathname === '/' && location.search.includes('token=')) {
      console.log('Detected token parameter on home page, redirecting to verify-email');
      navigate(`/verify-email${location.search}`, { replace: true });
    }
  }, [location, navigate]);

  return children;
};

export default RouteDebugger;