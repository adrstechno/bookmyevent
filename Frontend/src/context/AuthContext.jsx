import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { checkAndCleanAuth, isTokenExpired } from "../utils/tokenValidation";
import { VITE_API_BASE_URL } from "../utils/api";
import { setAxiosLogoutCallback } from "../services/axiosConfig";

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
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token) {
          setUser(null);
          return;
        }

        if (isTokenExpired(token)) {
          checkAndCleanAuth();
          setUser(null);
          return;
        }

        // Restore cached user immediately so the UI doesn't flash unauthenticated
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // corrupted cache — will be overwritten below
          }
        }

        // Always validate the token with the backend to get the fresh role.
        // This prevents stale localStorage role (e.g. 'user') from blocking
        // a user whose DB role was changed to 'vendor'.
        try {
          const response = await fetch(`${VITE_API_BASE_URL}/User/validate-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              const freshUser = {
                role: data.user.user_type,
                email: data.user.email,
                user_id: data.user.uuid,
                first_name: data.user.first_name,
                last_name: data.user.last_name,
              };
              setUser(freshUser);
              localStorage.setItem("user", JSON.stringify(freshUser));
              localStorage.setItem("role", freshUser.role);
            } else {
              checkAndCleanAuth();
              setUser(null);
            }
          } else {
            checkAndCleanAuth();
            setUser(null);
          }
        } catch {
          // Network error — fall back to cached user so app still works offline
        }

      } catch (error) {
        console.error("Error in AuthProvider initialization:", error);
        checkAndCleanAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
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

  const logout = useCallback(() => {
    setUser(null);
    checkAndCleanAuth();
  }, []);

  // Register logout with the axios interceptor so 401 responses
  // use React Router navigation instead of a hard window.location redirect
  useEffect(() => {
    setAxiosLogoutCallback(logout);
    return () => setAxiosLogoutCallback(null);
  }, [logout]);

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