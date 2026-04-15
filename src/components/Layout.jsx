// src/components/Layout.jsx

import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Layout() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const cartItemCount = cart?.itens?.length || 0;

    return (
        <div className="site-wrapper">
            <header className="main-header">
                <div className="container">
                    <Link to="/" className="logo">
                        <img src="/images/icon_homepage.png" alt="Acesso Imagens Logo" />
                    </Link>
                    
                    <nav className="main-nav">
                        {/* 1. LINKS PRINCIPAIS (Esquerda) */}
                        <NavLink to="/busca">Procurar fotos</NavLink>
                        <NavLink to="/eventos">Álbuns</NavLink>
                        <NavLink to="/noticias">Notícias</NavLink>

                        {/* 2. ÁREA DE UTILIZADOR E CARRINHO (Direita) */}
                        <div className="nav-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            
                            {user ? (
                                <>
                                    {/* Links específicos por papel */}
                                    {user.papel === 'ADMIN' && <NavLink to="/admin">Painel admin</NavLink>}
                                    {user.papel === 'FOTOGRAFO' && <NavLink to="/dashboard/albuns">Meu painel</NavLink>}
                                    {user.papel === 'CLIENTE' && <NavLink to="/minhas-compras">Minhas compras</NavLink>}
                                    
                                    {/* O Perfil é igual para Fotógrafo e Cliente */}
                                    {(user.papel === 'FOTOGRAFO' || user.papel === 'CLIENTE') && (
                                        <NavLink to="/perfil" className="nav-link">Meu Perfil</NavLink>
                                    )}

                                    {/* Carrinho (Só aparece para clientes ou quem não é Admin/Fotógrafo) */}
                                    {user.papel === 'CLIENTE' && (
                                        <Link to="/carrinho" className="cart-link" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                                            <img src="/images/carrinho.png" alt="Carrinho de Compras" className="cart-icon" />
                                            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                                        </Link>
                                    )}

                                    {/* Botão Sair - Fica no extremo direito */}
                                    <button onClick={logout}>Sair</button>
                                </>
                            ) : (
                                <>
                                    {/* Se não estiver logado, vê o carrinho e o botão Entrar */}
                                    <Link to="/carrinho" className="cart-link" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                                        <img src="/images/carrinho.png" alt="Carrinho de Compras" className="cart-icon" />
                                        {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                                    </Link>
                                    <Link to="/login">Entrar</Link>
                                </>
                            )}

                        </div>
                    </nav>
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
                            <a href="https://www.instagram.com/acessoimagens?igsh=OWN0MW51anJyczI=" target="_blank" rel="noopener noreferrer">
                                @acessoimagens
                            </a>
                        </div>
                    </div>
                    
                    <Link to="/quem-somos" className="footer-main-link">Quem somos</Link>

                    <div className="footer-links">
                        <Link to="/contato">Contato</Link>                        
                    </div>

                    <div className="footer-links">
                        <Link to="/privacidade">Política de Privacidade</Link>
                    </div>
                </div>
            </footer>
            <a 
                href="https://wa.me/5592984840065"
                className="whatsapp-fab"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
            >
                <img src="/images/icon_whatsapp.png" alt="Ícone do WhatsApp" />
            </a>
        </div>
    );
}
export default Layout;