// src/pages/admin/AdminLayout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';

// --- ÍCONES SVG DA BARRA INFERIOR ---
const IconChart = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="20" x2="21" y2="20"></line><line x1="3" y1="4" x2="3" y2="20"></line><polyline points="3 16 9 10 13 14 20 6"></polyline></svg>;
const IconFinance = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const IconUsers = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

// --- ÍCONES SVG DA LISTA DE MENU E TEMA ---
const IconChevronRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconSaques = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const IconNewspaper = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>;
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconLogout = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconSun = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const IconMoon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    
    const [saquesPendentesCount, setSaquesPendentesCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🚀 LÓGICA DO TEMA (CLARO/ESCURO)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        // Sincroniza o tema com o documento HTML para que o CSS global reaja
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

    useEffect(() => {
        const verificarSaquesPendentes = async () => {
            try {
                const response = await axiosInstance.get('/admin/saques/?status=PENDENTE');
                setSaquesPendentesCount(response.data.length);
            } catch (error) {
                console.error("Erro ao verificar saques pendentes", error);
            }
        };

        verificarSaquesPendentes();
        window.addEventListener('atualizar_saques_badge', verificarSaquesPendentes);
        const interval = setInterval(verificarSaquesPendentes, 60000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('atualizar_saques_badge', verificarSaquesPendentes);
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

    const MenuListItem = ({ to, icon, label, onClick, isDanger, badgeCount, isLast }) => {
        const content = (
            <div className={`menu-list-item ${isDanger ? 'menu-item-danger' : ''} ${isLast ? 'border-none' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="menu-item-icon">
                        {icon}
                    </div>
                    <span className="menu-item-text">
                        {label}
                    </span>
                    {badgeCount > 0 && (
                        <span className="menu-badge-pulse">
                            {badgeCount}
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
                            Admin: {user?.nome_completo?.split(' ')[0]}
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
                            <h2 className="admin-menu-title">Menu Administrativo</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="admin-menu-close">&times;</button>
                        </div>
                            
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <MenuListItem to="/admin/saques" icon={<IconSaques />} label="Gestão de Saques" badgeCount={saquesPendentesCount} onClick={() => setIsMenuOpen(false)} />
                            <MenuListItem to="/admin/jornais" icon={<IconNewspaper />} label="Jornais & Servidores FTP" onClick={() => setIsMenuOpen(false)} />
                            <MenuListItem to="/admin/avaliacoes" icon={<IconStar />} label="Avaliações do Sistema" onClick={() => setIsMenuOpen(false)} />
                            <MenuListItem onClick={logout} icon={<IconLogout />} label="Sair da Conta Admin" isDanger={true} isLast={true} />
                        </div>
                </div>
            )}

            {/* BARRA DE NAVEGAÇÃO INFERIOR PRINCIPAL */}
            <footer className="admin-footer">
                <nav className="admin-bottom-nav">
                    <BottomNavItem to="/admin" icon={<IconChart />} label="Estatísticas" exact={true} />
                    <BottomNavItem to="/admin/vendas" icon={<IconFinance />} label="Vendas" />
                    <BottomNavItem to="/admin/users" icon={<IconUsers />} label="Usuários" />
                        
                    {/* BOTÃO DE MENU (Abre a tela completa) */} 
                    <div onClick={() => setIsMenuOpen(!isMenuOpen)} className={`nav-item-link ${isMenuOpen ? 'nav-item-active' : ''}`}>
                        <div className="nav-item-icon-wrapper" style={{ position: 'relative' }}>
                            <IconMenu />
                            {(saquesPendentesCount > 0 && !isMenuOpen) && (
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

export default AdminLayout;