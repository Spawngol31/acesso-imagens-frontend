// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, authToken, loading } = useAuth();

    if (!authToken) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <div className="loading-screen">Carregando permissões...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return allowedRoles.includes(user.papel) ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;