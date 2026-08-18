// src/pages/admin/AdminLayout.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    
    // --- ESTADO DA NOTIFICAÇÃO ---
    const [saquesPendentesCount, setSaquesPendentesCount] = useState(0);

    useEffect(() => {
        const verificarSaquesPendentes = async () => {
            try {
                const response = await axiosInstance.get('/admin/saques/?status=PENDENTE');
                setSaquesPendentesCount(response.data.length);
            } catch (error) {
                console.error("Erro ao verificar saques pendentes", error);
            }
        };

        // Verifica na montagem da tela
        verificarSaquesPendentes();

        // 🔥 Escuta o sinal imediato emitido ao aprovar/recusar um saque
        window.addEventListener('atualizar_saques_badge', verificarSaquesPendentes);

        // Mantém a verificação periódica de fundo a cada 60 segundos
        const interval = setInterval(verificarSaquesPendentes, 60000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('atualizar_saques_badge', verificarSaquesPendentes);
        };
    }, [location.pathname]);

    return (
        <div className="dashboard-wrapper"> 
            <header className="dashboard-header">
                <div className="container">
                    <Link to="/" className="logo">
                        <img src="/images/icon_homepage.png" alt="Acesso Imagens Logo" />
                    </Link>
                    <nav className="dashboard-main-nav">
                        <NavLink to="/admin" end>Estatísticas</NavLink>
                        <NavLink to="/admin/vendas">Financeiro (Vendas)</NavLink>
                        
                        {/* --- ABA SAQUES COM O BADGE VERMELHO --- */}
                        <NavLink to="/admin/saques" style={{ position: 'relative' }}>
                            Saques
                            {saquesPendentesCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-8px', right: '-15px',
                                    backgroundColor: '#dc3545', color: 'white', borderRadius: '50%',
                                    padding: '2px 6px', fontSize: '10px', fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)', animation: 'pulse 2s infinite'
                                }}>
                                    {saquesPendentesCount}
                                </span>
                            )}
                        </NavLink>

                        <NavLink to="/admin/users">Usuários</NavLink>
                        <NavLink to="/admin/jornais">Jornais & FTP</NavLink>
                        <NavLink to="/admin/avaliacoes">Avaliações</NavLink>
                    </nav>
                    <div className="dashboard-user-actions">
                        <span style={{marginRight: '1rem'}}>Admin: {user?.nome_completo}</span>
                        <button onClick={logout} className='logout-button'>Sair</button>
                    </div>
                </div>
            </header>
            
            <main className="dashboard-content">
                <div className="container">
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;