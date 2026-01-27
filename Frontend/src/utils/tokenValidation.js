import { VITE_API_BASE_URL } from './api';

// Check if token is expired by decoding JWT (basic check)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expired
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Validate token with backend
export const validateTokenWithBackend = async (token) => {
  if (!token) return false;
  
  try {
    const response = await fetch(`${VITE_API_BASE_URL}/User/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

// Clean up invalid authentication data
export const clearInvalidAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
  localStorage.removeItem('username');
  
  console.log('Cleared invalid authentication data');
};

// Check and clean expired tokens
export const checkAndCleanAuth = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    clearInvalidAuth();
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.log('Token expired, clearing auth data');
    clearInvalidAuth();
    return false;
  }
  
  return true;
};

// Emergency cleanup - removes all auth-related data
export const emergencyAuthCleanup = () => {
  console.log('Performing emergency auth cleanup...');
  
  // Clear all possible auth-related keys
  const authKeys = [
    'token', 'user', 'role', 'name', 'username', 
    'auth_token', 'userRole', 'userData', 'isLoggedIn',
    'email', 'first_name', 'last_name', 'user_id'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Clear all cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('Emergency cleanup complete');
};