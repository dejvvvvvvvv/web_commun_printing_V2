import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // You can render a loading spinner here if you want
    return null; 
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
