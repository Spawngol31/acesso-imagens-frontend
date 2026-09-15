// src/components/Layout.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import InstagramWarning from './InstagramWarning';

// --- ÍCONES INLINE ---
const IconUser = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const IconGear = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const IconCart = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>);
const IconPaperclip = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>);
const IconImage = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>);
const IconShield = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const IconNews = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>);
const IconLogOut = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const IconMenu = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const IconSun = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const IconMoon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);

function Layout() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const cartItemCount = cart?.itens?.length || 0;
    const location = useLocation();
    const navigate = useNavigate();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [hasPropostaUpdate, setHasPropostaUpdate] = useState(false);

    // 🚀 TEMA
    const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fechar menus ao mudar de página
    useEffect(() => {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Verificar Propostas Pendentes
    useEffect(() => {
        const verificarPropostasCliente = async () => {
            if (user && user.papel === 'CLIENTE') {
                try {
                    const response = await axiosInstance.get('/minhas-propostas/');
                    const propostas = response.data;
                    
                    if (propostas.length > 0) {
                        const ultima = propostas[0];
                        const chave = `proposta_cliente_${ultima.id}_status`;
                        const statusVisto = localStorage.getItem(chave);

                        if (location.pathname === '/minhas-propostas') {
                            localStorage.setItem(chave, ultima.status);
                            setHasPropostaUpdate(false);
                        } else if (statusVisto !== ultima.status && ultima.status !== 'PENDENTE') {
                            setHasPropostaUpdate(true);
                        }
                    }
                } catch (e) {}
            }
        };

        verificarPropostasCliente();
        const interval = setInterval(verificarPropostasCliente, 60000);
        return () => clearInterval(interval);
    }, [location.pathname, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="site-wrapper">
            
            <header className="main-header">
                <div className="container header-container">
                    
                    <Link to="/" className="logo">
                        <img src={theme === 'dark' ? "/images/icon_home_dark.PNG" : "/images/icon_homepage.png"} alt="Acesso Imagens Logo" className="header-logo-img" />
                    </Link>
                    
                    <nav className={`public-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                        <NavLink to="/busca">Procurar fotos</NavLink>
                        <NavLink to="/eventos">Álbuns</NavLink>
                        <NavLink to="/solucoes">Serviços</NavLink>
                        <NavLink to="/noticias">Notícias</NavLink>
                        <NavLink to="/imprensa">Na Mídia</NavLink>
                    </nav>

                    <div className="header-actions">
                        
                        <button onClick={toggleTheme} className="theme-toggle-btn" title="Alternar Tema">
                            {theme === 'light' ? <IconMoon /> : <IconSun />}
                        </button>

                        {(!user || user.papel === 'CLIENTE') && (
                            <Link to="/carrinho" className="cart-link">
                                <IconCart />
                                {cartItemCount > 0 && (
                                    <span className="cart-badge">{cartItemCount}</span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="dropdown-wrapper" ref={userMenuRef}>
                                
                                <button className="conta-trigger-clean" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                                    <span className="dark-icon"><IconUser /></span>
                                    <span className="hide-mobile">Minha Conta</span>
                                    <span className="menu-arrow">▼</span>

                                    {hasPropostaUpdate && (<span className="dropdown-notification-dot"></span>)}
                                </button>

                                {isUserMenuOpen && (
                                    <div className="dropdown-menu-box">
                                        <div className="dropdown-greeting-box">
                                            <p className="dropdown-greeting-text">Olá, <strong>{user.nome_completo.split(' ')[0]}</strong></p>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        
                                        {user.papel === 'CLIENTE' && (
                                            <>
                                                <Link to="/minhas-compras" className="dark-dropdown-item"><span className="dark-icon"><IconImage /></span>Minhas compras</Link>
                                                <Link to="/minhas-compras-abertas" className="dark-dropdown-item"><span className="dark-icon"><IconCart /></span>Compras em aberto</Link>
                                                <Link to="/minhas-propostas" className="dark-dropdown-item dropdown-relative">
                                                    <span className="dark-icon"><IconPaperclip /></span>Minhas propostas
                                                    {hasPropostaUpdate && <span className="dropdown-badge-nova">● Nova!</span>}
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.papel === 'FOTOGRAFO' && (
                                            <Link to="/dashboard/albuns" className="dark-dropdown-item"><span className="dark-icon"><IconGear /></span>Painel do Fotógrafo</Link>
                                        )}
                                        {user.papel === 'ADMIN' && (
                                            <Link to="/admin" className="dark-dropdown-item"><span className="dark-icon"><IconShield /></span>Painel Admin</Link>
                                        )}
                                        {['JORNALISTA', 'ASSESSOR_IMPRENSA', 'ASSESSOR_COMUNICACAO'].includes(user.papel) && (
                                            <Link to="/dashboard/imprensa" className="dark-dropdown-item"><span className="dark-icon"><IconNews /></span>Painel do Editor</Link>
                                        )}

                                        {user.papel !== 'ADMIN' && (
                                            <Link to="/perfil" className="dark-dropdown-item"><span className="dark-icon"><IconUser /></span>Meu Perfil</Link>
                                        )}
                                        
                                        <div className="dropdown-divider"></div>
                                        
                                        <div className="dropdown-logout-box">
                                            <button onClick={handleLogout} className="logout-btn-clean">
                                                <span className="dark-icon"><IconLogOut /></span>Sair da Conta
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="login-btn-clean">Entrar</Link>
                        )}

                        <div 
                            className="mobile-menu-btn" 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            role="button"
                            tabIndex={0}
                        >
                            <IconMenu />
                        </div>

                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="container">
                    <Outlet />
                </div>
            </main>

            <footer className="main-footer">
                <div className="container">
                    <div className="footer-social">
                        <div className="social-item">
                            <img src="/images/instagram.png" alt="Instagram" />
                            <a href="https://www.instagram.com/acessoimagens?igsh=OWN0MW51anJyczI=" target="_blank" rel="noopener noreferrer">@acessoimagens</a>
                        </div>
                    </div>
                    <Link to="/quem-somos" className="footer-main-link">Quem somos</Link>
                    <div className="footer-links"><Link to="/contato">Contato</Link></div>
                    <div className="footer-links"><Link to="/privacidade">Política de Privacidade</Link></div>
                </div>
                <div className="footer-bottom">
                    <p className="footer-copyright">&copy; {new Date().getFullYear()} Acesso Imagens. Todos os direitos reservados.</p>
                    <p className="footer-disclaimer">É terminantemente proibida a cópia, reprodução, download não autorizado ou uso comercial e pessoal das fotografias desta plataforma sem a devida compra. Lei de Direitos Autorais (Lei nº 9.610/98).</p>
                </div>
            </footer>

            <a href="https://wa.me/5592984840065?text=Olá!%20Vim%20através%20do%20site%20da%20Acesso%20Imagens.%20Estou%20tendo%20algumas%20dificuldades,%20pode%20me%20ajudar?" className="whatsapp-fab" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp">
                <img src="/images/icon_whatsapp.png" alt="Ícone do WhatsApp" />
            </a>
        </div>
    );
}

export default Layout;