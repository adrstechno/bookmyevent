import React, { createContext, useContext, useState, useEffect } from "react";
import { checkAndCleanAuth, isTokenExpired } from "../utils/tokenValidation";
import { VITE_API_BASE_URL } from "../utils/api";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      // If no token, just set loading to false
      if (!token) {
        console.log('No token found, user not authenticated');
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, clearing auth data');
        checkAndCleanAuth();
        setUser(null);
        setLoading(false);
        return;
      }
      
      // If we have a valid token and saved user, restore session
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Restored user session:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing saved user:", error);
          checkAndCleanAuth();
          setUser(null);
        }
      }
      
    } catch (error) {
      console.error("Error in AuthProvider initialization:", error);
      checkAndCleanAuth();
      setUser(null);
    } finally {
      console.log('AuthProvider initialization complete');
      setLoading(false);
    }
  }, []);

  const login = (data) => {
    // Handle the user data structure from backend
    const userData = {
      role: data.role || data.user?.role,
      email: data.email || data.user?.email,
      user_id: data.user_id,
      first_name: data.first_name,
      last_name: data.last_name,
      ...data.user
    };
    
    setUser(userData);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userData.role); // Store role separately for ProtectedRoute
  };

  const logout = () => {
    setUser(null);
    checkAndCleanAuth(); // Use the utility function for consistent cleanup
  };

  // Method to refresh user session
  const refreshSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return false;
    }

    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Update user data with fresh info from backend
          const userData = {
            role: data.user.user_type,
            email: data.user.email,
            user_id: data.user.uuid,
            first_name: data.user.first_name,
            last_name: data.user.last_name
          };
          
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", userData.role);
          return true;
        }
      }
      
      // Token is invalid
      logout();
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};