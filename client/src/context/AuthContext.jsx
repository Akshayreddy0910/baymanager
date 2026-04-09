import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context object for Authentication
const AuthContext = createContext();

// Provider component that wraps the app and provides auth state
export const AuthProvider = ({ children }) => {
  // 1. Initialize user from the browser's local storage if it exists
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    // Convert the string back to a JSON object
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Initialize token from the browser's local storage
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Function to log in the user and save their session
  const login = (userData, userToken) => {
    // Save to state
    setUser(userData);
    setToken(userToken);

    // Persist to local storage so the session survives page refreshes
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  // Function to log out the user and clear their session
  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);

    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Provide the user, token, login, and logout functions to the context
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
