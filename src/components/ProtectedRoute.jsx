// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, authToken, loading } = useAuth(); // Assumindo que seu AuthContext tenha um estado 'loading'

    if (!authToken) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <div className="loading-screen">Carregando permissões...</div>;
    }

    // Se terminou de carregar e o user ainda é nulo, o token provavelmente é inválido
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se o papel do usuário está na lista de permitidos, mostra a página.
    // Senão, redireciona para a página inicial.
    return allowedRoles.includes(user.papel) ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;