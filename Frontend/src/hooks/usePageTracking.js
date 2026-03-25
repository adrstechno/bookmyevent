import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Custom hook to automatically track page views in Google Analytics
 * 
 * Usage: Add this hook to your main App component or layout
 * 
 * Example:
 * function App() {
 *   usePageTracking();
 *   return <Routes>...</Routes>
 * }
 */
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const path = location.pathname + location.search;
    const title = document.title;
    
    trackPageView(path, title);
  }, [location]);
};

export default usePageTracking;
