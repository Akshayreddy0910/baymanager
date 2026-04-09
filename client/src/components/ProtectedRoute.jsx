import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Component to protect routes based on authentication and user roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // 1. If the user is not logged in, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If specific roles are required, check if the user has one of them
  if (allowedRoles) {
    let hasPermission = false;

    // Use a for loop to check if the user's role is in the allowedRoles array
    for (let i = 0; i < allowedRoles.length; i++) {
        if (user.role === allowedRoles[i]) {
            hasPermission = true;
            break; // Found a match, user is authorized
        }
    }

    // 3. If the user doesn't have the required role, redirect to login (or an unauthorized page)
    if (hasPermission === false) {
      return <Navigate to="/login" replace />;
    }
  }

  // 4. If everything is fine, render the protected content
  return children;
};

export default ProtectedRoute;
