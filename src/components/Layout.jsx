// src/components/Layout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';

function Layout() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const cartItemCount = cart?.itens?.length || 0;
    const location = useLocation();
    const [hasPropostaUpdate, setHasPropostaUpdate] = useState(false);

    useEffect(() => {
        const verificarPropostasCliente = async () => {
            // Só verifica se for um cliente logado
            if (user && user.papel === 'CLIENTE') {
                try {
                    const response = await axiosInstance.get('/minhas-propostas/');
                    const propostas = response.data;
                    
                    if (propostas.length > 0) {
                        const ultima = propostas[0];
                        const chave = `proposta_cliente_${ultima.id}_status`;
                        const statusVisto = localStorage.getItem(chave);

                        // Se ele estiver na página de propostas, memoriza o status atual e esconde a bolinha
                        if (location.pathname === '/minhas-propostas') {
                            localStorage.setItem(chave, ultima.status);
                            setHasPropostaUpdate(false);
                        } 
                        // Se o status for diferente do que ele viu da última vez, e não for "PENDENTE" (pois pendente foi ele que acabou de criar)
                        else if (statusVisto !== ultima.status && ultima.status !== 'PENDENTE') {
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

    return (
        <div className="site-wrapper">
            <header className="main-header">
                <div className="container">
                    <Link to="/" className="logo">
                        <img src="/images/icon_homepage.png" alt="Acesso Imagens Logo" />
                    </Link>
                    
                    <nav className="main-nav">
                        {/*  LINKS PRINCIPAIS PUBLICO */}
                        <NavLink to="/busca">Procurar fotos</NavLink>
                        <NavLink to="/eventos">Álbuns</NavLink>
                        <NavLink to="/noticias">Notícias</NavLink>
                        <NavLink to="/solucoes">Serviços</NavLink>

                        {/* 2. ÁREA DE UTILIZADOR E CARRINHO */}
                        <div className="nav-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {user ? (
                                <>
                                    {/* Links específicos por papel */}
                                    {user.papel === 'ADMIN' && <NavLink to="/admin">Painel</NavLink>}
                                    {user.papel === 'FOTOGRAFO' && <NavLink to="/dashboard/albuns">Painel</NavLink>}
                                    {user.papel === 'CLIENTE' && <NavLink to="/minhas-compras">Compras</NavLink>}
                                    {user.papel === 'CLIENTE' && (
                                        <NavLink to="/minhas-propostas" onClick={() => setHasPropostaUpdate(false)} style={{ position: 'relative' }}>
                                            Propostas
                                            {hasPropostaUpdate && (
                                                <span style={{
                                                    position: 'absolute', top: '-5px', right: '-10px',
                                                    width: '10px', height: '10px', backgroundColor: '#dc3545',
                                                    borderRadius: '50%', border: '2px solid #333',
                                                    boxShadow: '0 0 5px rgba(220, 53, 69, 0.8)', animation: 'pulse 2s infinite'
                                                }}></span>
                                            )}
                                        </NavLink>
                                    )}

                                    {/* O Perfil é igual para Fotógrafo e Cliente */}
                                    {(user.papel === 'FOTOGRAFO' || user.papel === 'CLIENTE') && (
                                        <NavLink to="/perfil" className="nav-link">Perfil</NavLink>
                                    )}

                                    {/* Carrinho (Só aparece para clientes) */}
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

            {/* Links rodapé */}
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

                {/* --- INÍCIO DO AVISO DE COPYRIGHT --- */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)', // Linha sutil para separar
                    marginTop: '25px',
                    paddingTop: '20px',
                    paddingBottom: '10px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#fff',
                    width: '100%'
                }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                        &copy; {new Date().getFullYear()} Acesso Imagens. Todos os direitos reservados.
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, maxWidth: '800px', display: 'inline-block' }}>
                        É terminantemente proibida a cópia, reprodução, download não autorizado ou uso comercial e pessoal das fotografias desta plataforma sem a devida compra. Lei de Direitos Autorais (Lei nº 9.610/98).
                    </p>
                </div>
                {/* --- FIM DO AVISO DE COPYRIGHT --- */}

            </footer>
            {/* --- fim links rodapé --- */}

            {/* --- Whats flutuante --- */}
            <a 
                href="https://wa.me/5592984840065"
                className="whatsapp-fab"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
            >
                <img src="/images/icon_whatsapp.png" alt="Ícone do WhatsApp" />
            </a>
            {/* --- Fim Whats flutuante --- */}
        </div>
    );
}
export default Layout;