// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, authToken } = useAuth();

    // Se não há token, redireciona para o login
    if (!authToken) {
        return <Navigate to="/login" replace />;
    }

    // Se o usuário está carregando, podemos mostrar um loading
    if (!user) {
        return <div>Carregando...</div>;
    }

    // Se o papel do usuário está na lista de permitidos, mostra a página.
    // Senão, redireciona para a página inicial.
    return allowedRoles.includes(user.papel) ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;