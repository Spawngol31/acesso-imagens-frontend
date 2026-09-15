// src/pages/dashboard/DashboardLayout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';

// --- ÍCONES SVG DA BARRA INFERIOR E BOTÃO FLUTUANTE ---
const IconHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconAlbum = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconFinance = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

// --- ÍCONES SVG DA LISTA DE MENU E TEMA ---
const IconChevronRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconCart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
const IconPropostas = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;
const IconSaques = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const IconTicket = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><line x1="12" y1="6" x2="12" y2="18"></line></svg>;
const IconTool = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconLogout = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconSun = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const IconMoon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const [hasSaqueUpdate, setHasSaqueUpdate] = useState(false);
    const [hasPropostaUpdate, setHasPropostaUpdate] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🚀 LÓGICA DO TEMA (CLARO/ESCURO)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // --- LÓGICA DE NOTIFICAÇÕES EM TEMPO REAL ---
    useEffect(() => {
        const verificarAtualizacoesSaque = async () => {
            try {
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
                    } else if (statusVisto !== ultimoSaque.status && ultimoSaque.status !== 'PENDENTE') {
                        setHasSaqueUpdate(true);
                    }
                }
            } catch (error) {
                console.error("Erro ao verificar atualizações de saques", error);
            }
        };

        const verificarPropostasFoto = async () => {
            try {
                const response = await axiosInstance.get(`/dashboard/propostas/?v=${new Date().getTime()}`);
                const propostas = response.data;
                let temNovidade = false;
                const acoesDoCliente = ['PENDENTE', 'CONTRAPROPOSTA_ACEITA', 'CONTRAPROPOSTA_RECUSADA', 'ACEITA', 'RECUSADA'];
                const isNaAbaPropostas = location.pathname.includes('/dashboard/propostas');

                propostas.forEach(proposta => {
                    const chave = `proposta_foto_${proposta.id}_status`;
                    const statusVisto = localStorage.getItem(chave);

                    if (isNaAbaPropostas) {
                        localStorage.setItem(chave, proposta.status);
                    } else {
                        if (!statusVisto || (statusVisto !== proposta.status && acoesDoCliente.includes(proposta.status))) {
                            temNovidade = true;
                        }
                    }
                });

                setHasPropostaUpdate(isNaAbaPropostas ? false : temNovidade);
            } catch (error) {
                console.error("Erro ao verificar propostas", error);
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

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const BottomNavItem = ({ to, icon, label, exact }) => {
        const isCurrent = exact ? location.pathname === to : location.pathname.includes(to);
        
        return (
            <Link to={to} className={`nav-item-link ${isCurrent ? 'nav-item-active' : ''}`}>
                <div className="nav-item-icon-wrapper">
                    {icon}
                </div>
                <span className="nav-item-label">{label}</span>
            </Link>
        );
    };

    const MenuListItem = ({ to, icon, label, onClick, isDanger, hasBadge, isLast }) => {
        const content = (
            <div className={`menu-list-item ${isDanger ? 'menu-item-danger' : ''} ${isLast ? 'border-none' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="menu-item-icon">
                        {icon}
                    </div>
                    <span className="menu-item-text">
                        {label}
                    </span>
                    {hasBadge && (
                        <span className="menu-badge-pulse">
                            Novo
                        </span>
                    )}
                </div>
                {!isDanger && <IconChevronRight />}
            </div>
        );
        return to ? <Link to={to} onClick={onClick} style={{ textDecoration: 'none' }}>{content}</Link> : <div onClick={onClick}>{content}</div>;
    };

    return (
        <div className="admin-layout-wrapper">
            
            {/* CABEÇALHO NO TOPO */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <Link to="/" title="Voltar para a página inicial pública" className="admin-logo-link">
                        <img src={theme === 'dark' ? "/images/icon_home_dark.PNG" : "/images/icon_homepage.png"} alt="Acesso Imagens Logo" className="header-logo-img" />
                    </Link>
                    
                    <div className="admin-header-actions">
                        <button onClick={toggleTheme} className="theme-toggle-btn" title="Alternar Tema">
                            {theme === 'dark' ? <IconSun /> : <IconMoon />}
                        </button>
                        <span className="admin-header-badge">
                            Olá, {user?.nome_completo?.split(' ')[0]}!
                        </span>
                    </div>
                </div>
            </header>

            {/* ÁREA DE CONTEÚDO PRINCIPAL */}
            <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <Outlet />
            </main>

            {/* OVERLAY DO MENU COMPLETO */}
            {isMenuOpen && (
                <div className="admin-menu-overlay">
                        <div className="admin-menu-header">
                            <div className="admin-header-content">
                                <h2 className="admin-menu-title">Menu</h2>
                                <button onClick={() => setIsMenuOpen(false)} className="admin-menu-close">&times;</button>
                            </div>
                        </div>
                            
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                            <MenuListItem to="/dashboard/carrinhos-ativos" icon={<IconCart />} label="Carrinhos" onClick={() => setIsMenuOpen(false)} />
                            <MenuListItem to="/dashboard/propostas" icon={<IconPropostas />} label="Propostas e Negociações" hasBadge={hasPropostaUpdate} onClick={() => { setIsMenuOpen(false); setHasPropostaUpdate(false); }} />
                            <MenuListItem to="/dashboard/saques" icon={<IconSaques />} label="Meus Saques" hasBadge={hasSaqueUpdate} onClick={() => { setIsMenuOpen(false); setHasSaqueUpdate(false); }} />
                            <MenuListItem to="/dashboard/cupons" icon={<IconTicket />} label="Cupons de Desconto" onClick={() => setIsMenuOpen(false)} />
                            <MenuListItem to="/dashboard/watermark-tool" icon={<IconTool />} label="Ferramenta de Marcas" onClick={() => setIsMenuOpen(false)} />
                            <MenuListItem onClick={logout} icon={<IconLogout />} label="Sair da Conta" isDanger={true} isLast={true} />
                        </div>
                </div>
            )}

            {/* BARRA DE NAVEGAÇÃO INFERIOR PRINCIPAL */}
            <footer className="admin-footer">
                <nav className="admin-bottom-nav">
                    <BottomNavItem to="/" icon={<IconHome />} label="Início" exact={true} />
                    <BottomNavItem to="/dashboard/albuns" icon={<IconAlbum />} label="Álbuns" />
                    <BottomNavItem to="/dashboard/vendas" icon={<IconFinance />} label="Financeiro" />
                        
                    {/* BOTÃO DE MENU (Abre a tela completa) */} 
                    <div onClick={() => setIsMenuOpen(!isMenuOpen)} className={`nav-item-link ${isMenuOpen ? 'nav-item-active' : ''}`}>
                        <div className="nav-item-icon-wrapper" style={{ position: 'relative' }}>
                            <IconMenu />
                            {((hasSaqueUpdate || hasPropostaUpdate) && !isMenuOpen) && (
                                <span className="nav-badge-indicator"></span>
                            )}
                        </div>
                        <span className="nav-item-label">Menu</span>
                    </div> 
                </nav>
            </footer>
        </div>
    );
};

export default DashboardLayout;