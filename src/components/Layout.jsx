// src/components/Layout.jsx

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
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
                        <Link to="/busca">Procurar fotos</Link>
                        <Link to="/eventos">Álbuns</Link>
                        <Link to="/noticias">Notícias</Link>
                        
                        {/* A lógica do carrinho foi agrupada corretamente num Fragmento (<>) 
                            se você quiser que ele fique alinhado com os outros links, ou 
                            apenas mantida como estava se o CSS já tratar o display flex. 
                            Deixei como estava para não quebrar o seu CSS. */}
                        {(!user || user.papel === 'CLIENTE') && (
                            <Link to="/carrinho" className="cart-link" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                                <img src="/images/carrinho.png" alt="Carrinho de Compras" className="cart-icon" />
                                {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                            </Link>
                        )}

                        {user ? (
                            <div className="nav-user-menu">
                                {user.papel === 'ADMIN' && <Link to="/admin">Painel admin</Link>}
                                {user.papel === 'FOTOGRAFO' && <Link to="/dashboard/albuns">Meu painel</Link>}
                                {user.papel === 'CLIENTE' && <Link to="/minhas-compras">Minhas compras</Link>}
                                
                                <button onClick={logout}>Sair</button>
                            </div>
                        ) : (
                            <Link to="/login">Entrar</Link>
                        )}
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