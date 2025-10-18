// src/pages/dashboard/DashboardLayout.jsx

import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = () => {
    const { logout } = useAuth();
    
    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <div className="container">
                    <Link to="/" className="logo">
                        <img src="/images/icon_homepage.png" alt="Acesso Imagens Logo" />
                    </Link>
                    <nav className="dashboard-main-nav">
                        <NavLink to="/dashboard/albuns">Meus álbuns</NavLink>
                        <NavLink to="/dashboard/vendas">Minhas vendas</NavLink>
                        <NavLink to="/dashboard/cupons">Meus cupons</NavLink>
                        <NavLink to="/dashboard/watermark-tool">Ferramentas</NavLink>
                    </nav>
                    <div className="dashboard-user-actions">
                        <button onClick={logout} className='logout-button'>Sair</button>
                    </div>
                </div>
            </header>
            
            <main className="dashboard-content">
                <div className="container">
                    <h1>Meu painel</h1>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;