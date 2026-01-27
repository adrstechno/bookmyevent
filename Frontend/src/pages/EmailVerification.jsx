import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { VITE_API_BASE_URL } from '../utils/api';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    // Only run verification if we're actually on the verify-email route
    if (location.pathname !== '/verify-email') {
      console.log('EmailVerification component loaded on wrong route, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

    console.log('EmailVerification: checking token...');
    
    if (token) {
      console.log('Token found, verifying...');
      verifyEmailToken();
    } else {
      console.log('No token found in URL');
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token, location.pathname, navigate]);

  const verifyEmailToken = async () => {
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus('success');
        setMessage(data.message);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email verified! You can now login.' }
          });
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Email verification failed.');
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setMessage('Network error. Please try again later.');
      toast.error('Network error occurred');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        toast.error(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Network error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            {verificationStatus === 'verifying' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            )}
            {verificationStatus === 'success' && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {verificationStatus === 'error' && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {verificationStatus === 'verifying' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </h1>
        </div>

        {/* Content */}
        <div className="text-center">
          {verificationStatus === 'verifying' && (
            <div>
              <p className="text-gray-600 mb-4">
                Please wait while we verify your email address...
              </p>
              <div className="flex justify-center">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div>
              <p className="text-green-600 mb-6 font-medium">
                {message}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  🎉 Your account is now fully activated! You will be redirected to the login page in a few seconds.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Go to Login
              </button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div>
              <p className="text-red-600 mb-6 font-medium">
                {message}
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm mb-3">
                  ⚠️ Your verification link may have expired or is invalid.
                </p>
                <p className="text-red-700 text-sm">
                  Enter your email below to receive a new verification link:
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    '📧 Resend Verification Email'
                  )}
                </button>

                <button
                  onClick={() => {
                    // Clear all auth data and redirect to home
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/';
                  }}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
                >
                  🏠 Go to Home Page
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;