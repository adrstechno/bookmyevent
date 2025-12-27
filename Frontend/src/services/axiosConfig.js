import axios from "axios";
import { VITE_API_BASE_URL } from "../utils/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          console.log("Auth error - 401 Unauthorized");
          // Clear stored auth data on 401
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
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
