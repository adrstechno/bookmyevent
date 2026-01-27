import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from '../pages/HomePage';

const HomePageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If we're on the home page but have a token parameter, redirect to verification
    if (location.search.includes('token=')) {
      console.log('Token detected on home page, redirecting to email verification');
      navigate(`/verify-email${location.search}`, { replace: true });
      return;
    }

    // Clear any stale URL parameters that might cause issues
    if (location.search && !location.search.includes('redirect=')) {
      console.log('Clearing stale URL parameters');
      navigate('/', { replace: true });
      return;
    }
  }, [location, navigate]);

  // Don't render HomePage if we're redirecting
  if (location.search.includes('token=')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <HomePage />;
};

export default HomePageWrapper;