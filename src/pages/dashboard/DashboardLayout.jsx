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
    const [hasPropostaUpdate, setHasPropostaUpdate] = useState(false);

    useEffect(() => {
        const verificarAtualizacoesSaque = async () => {
            try {
                // 🚀 CACHE-BUSTER: O "?v=" com o tempo atual impede o navegador de ler dados antigos!
                const response = await axiosInstance.get(`/dashboard/saques/?v=${new Date().getTime()}`); 
                const saques = response.data;
                
                if (saques.length > 0) {
                    const ultimoSaque = saques[0]; 
                    const chaveMemoria = `saque_${ultimoSaque.id}_status`;
                    const statusVisto = localStorage.getItem(chaveMemoria);
                    
                    const isNaAbaSaques = location.pathname.includes('/dashboard/saques');

                    if (isNaAbaSaques) {
                        localStorage.setItem(chaveMemoria, ultimoSaque.status);
                        setHasSaqueUpdate(false);
                    } 
                    else if (statusVisto !== ultimoSaque.status && ultimoSaque.status !== 'PENDENTE') {
                        setHasSaqueUpdate(true);
                    }
                }
            } catch (error) {
                console.error("Erro ao verificar atualizações de saques", error);
            }
        };

        const verificarPropostasFoto = async () => {
            try {
                // 🚀 CACHE-BUSTER APLICADO AQUI TAMBÉM
                const response = await axiosInstance.get(`/dashboard/propostas/?v=${new Date().getTime()}`);
                const propostas = response.data;
                
                let temNovidade = false;
                
                // Adicionamos TODAS as possíveis respostas do cliente para evitar falhas
                const acoesDoCliente = ['PENDENTE', 'CONTRAPROPOSTA_ACEITA', 'CONTRAPROPOSTA_RECUSADA', 'ACEITA', 'RECUSADA'];
                const isNaAbaPropostas = location.pathname.includes('/dashboard/propostas');

                propostas.forEach(proposta => {
                    const chave = `proposta_foto_${proposta.id}_status`;
                    const statusVisto = localStorage.getItem(chave);

                    if (isNaAbaPropostas) {
                        localStorage.setItem(chave, proposta.status);
                    } 
                    else {
                        // Se for uma proposta 100% nova (!statusVisto) OU se teve alteração pelo cliente, é novidade!
                        if (!statusVisto) {
                            temNovidade = true;
                        } else if (statusVisto !== proposta.status && acoesDoCliente.includes(proposta.status)) {
                            temNovidade = true;
                        }
                    }
                });

                if (isNaAbaPropostas) {
                    setHasPropostaUpdate(false);
                } else if (temNovidade) {
                    setHasPropostaUpdate(true);
                }

            } catch (error) {
                console.error("Erro ao verificar atualizações de propostas", error);
            }
        };

        verificarAtualizacoesSaque();
        verificarPropostasFoto();
        
        const intervalSaque = setInterval(verificarAtualizacoesSaque, 60000);
        const intervalProposta = setInterval(verificarPropostasFoto, 60000);

        return () => {
            clearInterval(intervalSaque);
            clearInterval(intervalProposta);
        };

    }, [location.pathname]); 

    const handleSaquesClick = () => setHasSaqueUpdate(false);

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
                        <NavLink 
                            to="/dashboard/propostas" 
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={() => setHasPropostaUpdate(false)}
                            style={{ position: 'relative' }}
                        >
                            Negociações
                            {hasPropostaUpdate && (
                                <span style={{
                                    position: 'absolute', top: '0', right: '-10px',
                                    width: '10px', height: '10px', backgroundColor: '#dc3545',
                                    borderRadius: '50%', border: '2px solid #333',
                                    boxShadow: '0 0 5px rgba(220, 53, 69, 0.8)', animation: 'pulse 2s infinite'
                                }}></span>
                            )}
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