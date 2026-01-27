import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // User is already logged in, redirect to the intended page
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl));
      } else {
        // Default redirect based on user type
        switch (user.user_type) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'vendor':
            navigate('/vendor/dashboard');
            break;
          default:
            navigate('/user/dashboard');
        }
      }
    }
  }, [user, navigate, searchParams]);

  return null; // This component doesn't render anything
};

export default LoginRedirect;