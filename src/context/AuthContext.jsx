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

      // Check if session is a local/demo offline token
      if (savedToken.startsWith('mock_demo_jwt_token_')) {
        const cached = localStorage.getItem('clubops_auth_user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
            setToken(savedToken);
          } catch {
            logout();
          }
        }
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
        console.warn('Session verification failed, checking local cache:', err.message);
        // If deployed and backend is unreachable, keep cached user session
        const cached = localStorage.getItem('clubops_auth_user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
            setToken(savedToken);
          } catch {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      if (res && res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('clubops_auth_token', res.token);
        localStorage.setItem('clubops_auth_user', JSON.stringify(res.user));
        return res;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      // Fallback for deployed static hosting (GitHub Pages/Vercel) when backend is offline
      const normalizedEmail = email.trim().toLowerCase();
      const localUsers = JSON.parse(localStorage.getItem('clubops_local_users') || '[]');
      const matchedLocalUser = localUsers.find(
        (u) => u.email === normalizedEmail && u.password === password
      );

      const isDemoAccount =
        (normalizedEmail === 'alex.chen@clubops.org' ||
         normalizedEmail === 'admin@clubops.org' ||
         normalizedEmail === 'demo@clubops.org') &&
        (password === 'Password123!' || password.length >= 6);

      if (matchedLocalUser || isDemoAccount) {
        const loggedUser = matchedLocalUser
          ? { id: matchedLocalUser.id || 'usr_' + Date.now(), name: matchedLocalUser.name, email: matchedLocalUser.email, role: 'organizer' }
          : { id: 'usr_demo_alex', name: 'Alex Chen', email: normalizedEmail, role: 'organizer' };

        const demoToken = 'mock_demo_jwt_token_' + Date.now();
        setToken(demoToken);
        setUser(loggedUser);
        localStorage.setItem('clubops_auth_token', demoToken);
        localStorage.setItem('clubops_auth_user', JSON.stringify(loggedUser));
        return { success: true, token: demoToken, user: loggedUser };
      }

      // If backend network error and credentials didn't match local demo
      if (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error('Backend server is unreachable. You can sign in using the Demo Account (alex.chen@clubops.org / Password123!)');
      }
      throw err;
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const res = await registerUser({ name, email, password });
      return res;
    } catch (err) {
      // Fallback for deployed static hosting when backend is offline
      const normalizedEmail = email.trim().toLowerCase();
      const localUsers = JSON.parse(localStorage.getItem('clubops_local_users') || '[]');
      if (localUsers.some((u) => u.email === normalizedEmail)) {
        throw new Error('An account with this email already exists.');
      }
      const newUser = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password,
      };
      localUsers.push(newUser);
      localStorage.setItem('clubops_local_users', JSON.stringify(localUsers));
      return { success: true, message: 'Account created successfully! Please sign in with your credentials.' };
    }
  };

  // Google sign-in handler
  const loginWithGoogle = async (googlePayload = {}) => {
    try {
      const res = await googleAuthUser(googlePayload);
      if (res && res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('clubops_auth_token', res.token);
        localStorage.setItem('clubops_auth_user', JSON.stringify(res.user));
        return res;
      }
      throw new Error(res.message || 'Google Sign-In failed');
    } catch (err) {
      // Offline / deployed fallback
      const googleUser = {
        id: 'usr_google_' + Date.now(),
        name: googlePayload.name || 'Google User',
        email: googlePayload.email || 'alex.chen.google@clubops.org',
        role: 'organizer',
      };
      const demoToken = 'mock_demo_jwt_token_' + Date.now();
      setToken(demoToken);
      setUser(googleUser);
      localStorage.setItem('clubops_auth_token', demoToken);
      localStorage.setItem('clubops_auth_user', JSON.stringify(googleUser));
      return { success: true, token: demoToken, user: googleUser };
    }
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
