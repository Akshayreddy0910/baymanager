import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    let hasPermission = false;

    for (let i = 0; i < allowedRoles.length; i++) {
        if (user.role === allowedRoles[i]) {
            hasPermission = true;
            break;
        }
    }

    if (hasPermission === false) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
