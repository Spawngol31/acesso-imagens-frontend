// src/pages/admin/AdminLayout.jsx

import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    
    return (
        // Reutilizamos a classe principal do painel do fotógrafo
        <div className="dashboard-wrapper"> 
            <header className="dashboard-header">
                <div className="container">
                    <Link to="/" className="logo">
                        <img src="/images/icon_homepage.png" alt="Acesso Imagens Logo" />
                    </Link>
                    <nav className="dashboard-main-nav">
                        <NavLink to="/admin" end>Estatísticas</NavLink>
                        <NavLink to="/admin/users">Gerir utilizadores</NavLink>
                    </nav>
                    <div className="dashboard-user-actions">
                        <span style={{marginRight: '1rem'}}>Admin: {user?.nome_completo}</span>
                        <button onClick={logout} className='logout-button'>Sair</button>
                    </div>
                </div>
            </header>
            
            <main className="dashboard-content">
                <div className="container">
                    <Outlet /> {/* As páginas de admin serão renderizadas aqui */}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;