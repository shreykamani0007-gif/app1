import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, googleAuthUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('clubops_auth_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('clubops_auth_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Validate stored session token on application load / refresh
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('clubops_auth_token');

      if (!savedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await getCurrentUser();
        if (res && res.success && res.user) {
          setUser(res.user);
          setToken(savedToken);
          localStorage.setItem('clubops_auth_user', JSON.stringify(res.user));
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        // If unauthorized, clear session
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res && res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('clubops_auth_token', res.token);
      localStorage.setItem('clubops_auth_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Register handler
  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    return res;
  };

  // Google sign-in handler
  const loginWithGoogle = async (googlePayload = {}) => {
    const res = await googleAuthUser(googlePayload);
    if (res && res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('clubops_auth_token', res.token);
      localStorage.setItem('clubops_auth_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Google Sign-In failed');
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('clubops_auth_token');
      localStorage.removeItem('clubops_auth_user');
    } catch {
      // Ignore storage errors
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
