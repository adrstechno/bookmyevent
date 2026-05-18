import axios from "axios";
import { VITE_API_BASE_URL } from "../utils/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Module-level logout callback registered by AuthContext.
// Using a callback avoids a hard window.location redirect (which destroys React state)
// and lets React Router handle the navigation cleanly.
let _logoutCallback = null;
let _isHandling401 = false;

export const setAxiosLogoutCallback = (fn) => {
  _logoutCallback = fn;
};

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // Guard against multiple simultaneous 401s all triggering logout
          if (!_isHandling401) {
            _isHandling401 = true;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');

            if (_logoutCallback) {
              // Let React handle the redirect via ProtectedRoute
              _logoutCallback();
            } else if (window.location.pathname !== '/login') {
              // Fallback if AuthContext hasn't registered yet
              window.location.href = '/login';
            }

            setTimeout(() => { _isHandling401 = false; }, 3000);
          }
          break;
        case 403:
          console.error("Permission denied - 403 Forbidden");
          break;
        case 429:
          console.error("Rate limit exceeded. Please try again later.");
          break;
        default:
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
