import axios from "axios";
import { VITE_API_BASE_URL } from "../utils/api";

// Create axios instance with default config
// Uses cookies for authentication (withCredentials: true)
const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true, // This sends cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// No need for Authorization header - backend uses cookie-based sessions

// Response interceptor - Handle errors globally (no redirects)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          console.log("Auth error - 401 Unauthorized");
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
