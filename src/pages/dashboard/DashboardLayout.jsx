// src/pages/dashboard/DashboardLayout.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const DashboardLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();

    // --- ESTADO DA NOTIFICAÇÃO ---
    const [hasSaqueUpdate, setHasSaqueUpdate] = useState(false);

    useEffect(() => {
        const verificarAtualizacoesSaque = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/saques/'); 
                const saques = response.data;
                
                if (saques.length > 0) {
                    const ultimoSaque = saques[0]; // O saque mais recente
                    const chaveMemoria = `saque_${ultimoSaque.id}_status`;
                    const statusVisto = localStorage.getItem(chaveMemoria);
                    
                    // 1. Se o fotógrafo já está na página de saques AGORA, memoriza o status e esconde a bolinha
                    if (location.pathname === '/dashboard/saques') {
                        localStorage.setItem(chaveMemoria, ultimoSaque.status);
                        setHasSaqueUpdate(false);
                    } 
                    // 2. Se ele está noutra página, a memória está diferente do status atual E o status não é 'PENDENTE' (pois PENDENTE significa que ele acabou de pedir)
                    else if (statusVisto !== ultimoSaque.status && ultimoSaque.status !== 'PENDENTE') {
                        setHasSaqueUpdate(true);
                    }
                }
            } catch (error) {
                console.error("Erro ao verificar atualizações de saques", error);
            }
        };

        verificarAtualizacoesSaque();
        
        // Verifica a cada 60 segundos
        const interval = setInterval(verificarAtualizacoesSaque, 60000);
        return () => clearInterval(interval);

    }, [location.pathname]); // Atualiza sempre que o utilizador navega no painel

    // Removemos a chamada à API do onClick, porque o useEffect já trata disso maravilhosamente quando o pathname muda!
    const handleSaquesClick = () => {
        setHasSaqueUpdate(false);
    };

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <div className="container">
                    <Link to="/" className="logo">
                        <img src="/images/icon_homepage.png" alt="Acesso Imagens Logo" />
                    </Link>
                    <nav className="dashboard-main-nav">
                        <NavLink to="/dashboard/albuns">Álbuns</NavLink>
                        <NavLink to="/dashboard/vendas">Vendas</NavLink>
                        
                        {/* --- ABA SAQUES COM PONTO VERMELHO DE NOTIFICAÇÃO --- */}
                        <NavLink 
                            to="/dashboard/saques" 
                            onClick={handleSaquesClick}
                            style={{ position: 'relative' }}
                        >
                            Saques
                            {hasSaqueUpdate && (
                                <span style={{
                                    position: 'absolute', top: '0', right: '-10px',
                                    width: '10px', height: '10px', backgroundColor: '#dc3545',
                                    borderRadius: '50%', border: '2px solid #333',
                                    boxShadow: '0 0 5px rgba(220, 53, 69, 0.8)', animation: 'pulse 2s infinite'
                                }}></span>
                            )}
                        </NavLink>

                        <NavLink to="/dashboard/cupons">Cupons</NavLink>
                        <NavLink to="/dashboard/carrinhos-ativos" className={({ isActive }) => isActive ? 'active' : ''}>
                            Carrinhos em aberto
                        </NavLink>
                        <NavLink to="/dashboard/propostas" className={({ isActive }) => isActive ? 'active' : ''}>
                            Negociações
                        </NavLink>
                        <NavLink to="/dashboard/watermark-tool">Ferramenta</NavLink>
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