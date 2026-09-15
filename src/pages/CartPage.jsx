// src/pages/CartPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance'; 
import { toast } from 'react-toastify'; 

function CartPage() {
    const { cart, removeFromCart, applyCoupon } = useCart();
    const { user } = useAuth(); 

    const [codigoCupom, setCodigoCupom] = useState('');
    const [cupomError, setCupomError] = useState('');

    // --- ESTADOS DO MODAL DE PROPOSTA ---
    const [isPropostaModalOpen, setIsPropostaModalOpen] = useState(false);
    // 🚀 NOVO: Adicionado 'comentario' ao estado inicial
    const [propostaForm, setPropostaForm] = useState({ albumId: null, qtdFotos: 0, qtdVideos: 0, valor: '', comentario: '' });
    const [isSendingProposta, setIsSendingProposta] = useState(false);
    // ------------------------------------

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCupomError('');
        try {
            await applyCoupon(codigoCupom);
        } catch (error) {
            setCupomError(error.message);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            await applyCoupon(null);
            setCodigoCupom('');
            setCupomError('');
        } catch (error) {
            console.error("Erro ao remover cupom:", error);
            setCupomError("Não foi possível remover o cupom.");
        }
    };

    const abrirModalProposta = (albumId, qtdFotos, qtdVideos) => {
        // 🚀 Limpa o comentário ao abrir
        setPropostaForm({ albumId: albumId, qtdFotos: qtdFotos, qtdVideos: qtdVideos, valor: '', comentario: '' });
        setIsPropostaModalOpen(true);
    };

    const handlePropostaSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.warning("Inicie a sessão para enviar uma proposta.");
        
        setIsSendingProposta(true);
        try {
            await axiosInstance.post('/propostas/criar/', {
                album: propostaForm.albumId,
                quantidade_fotos: propostaForm.qtdFotos,
                quantidade_videos: propostaForm.qtdVideos,
                valor_oferecido: propostaForm.valor,
                // 🚀 NOVO: Envia o comentário para o backend
                comentario: propostaForm.comentario 
            });
            toast.success("Proposta enviada com sucesso! Acompanhe em 'Minhas Propostas'.");
            setIsPropostaModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao enviar proposta.");
        } finally {
            setIsSendingProposta(false);
        }
    };

    if (cart === null) {
        return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar carrinho...</p>;
    }

    if (cart.itens.length === 0) {
        return (
            <div className='page-container' style={{ textAlign: 'center' }}>
                <h1>Meu carrinho</h1>
                <div className="empty-state-container">
                    <p>O seu carrinho está vazio.</p>
                    <Link to="/eventos" className="create-button" style={{ textDecoration: 'none' }}>
                        Ver álbuns
                    </Link>
                </div>
            </div>
        );
    }

    const itensAgrupados = cart.itens.reduce((acc, item) => {
        const mediaVisual = item.foto || item.video;
        const albumId = mediaVisual?.album || 'avulso';
        const albumTitulo = mediaVisual?.album_titulo || 'Álbuns Diversos';

        if (!acc[albumId]) {
            acc[albumId] = { albumId, albumTitulo, itens: [], total: 0, qtdFotos: 0, qtdVideos: 0 };
        }
        acc[albumId].itens.push(item);
        acc[albumId].total += parseFloat(item.preco_item || 0);
        
        if (item.foto) acc[albumId].qtdFotos += 1;
        if (item.video) acc[albumId].qtdVideos += 1;
        
        return acc;
    }, {});

    return (
        <div className='page-container'>
            <h1>Meu carrinho</h1>
            
            <div className="cart-layout">
                {/* Lado Esquerdo: Lista de Fotos Agrupadas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.values(itensAgrupados).map(grupo => (
                        <div key={grupo.albumId} className="cart-album-group">
                            
                            {/* Cabeçalho do Grupo (Álbum) */}
                            <div className="cart-album-header">
                                <h3 className="cart-album-title">
                                    📸 {grupo.albumTitulo} ({grupo.itens.length} itens)
                                </h3>
                                
                                {grupo.itens.length >= 2 && user && (
                                    <button 
                                        onClick={() => abrirModalProposta(grupo.albumId, grupo.qtdFotos, grupo.qtdVideos)} 
                                        className="button-outline"
                                        style={{ padding: '6px 15px', fontSize: '13px' }}
                                    >
                                        Fazer Proposta
                                    </button>
                                )}
                            </div>

                            <div className="cart-grid cart-grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                                {grupo.itens.map(item => {
                                    const mediaVisual = item.foto || item.video; 
                                    return (
                                        <div key={item.id} className="purchase-card">
                                            <div className="purchase-card-image purchase-card-image-styled" style={{ position: 'relative', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            
                                            {mediaVisual?.imagem_url || mediaVisual?.miniatura_url ? (
                                                <img 
                                                    src={mediaVisual.imagem_url || mediaVisual.miniatura_url} 
                                                    alt={mediaVisual.legenda || mediaVisual.titulo || 'Mídia'} 
                                                    style={{ transform: `rotate(${mediaVisual.rotacao || 0}deg)`, width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="purchase-card-fallback-icon" style={{ color: '#aaa', fontSize: '30px' }}>
                                                    {item.video ? '🎥' : '📷'}
                                                </div>
                                            )}

                                            {item.video && (
                                                <div className="video-play-overlay" style={{
                                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '36px', height: '36px',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'
                                                }}>
                                                    <span className="video-play-icon" style={{ color: 'white', fontSize: '16px', marginLeft: '4px' }}>▶</span>
                                                </div>
                                            )}
                                        </div>
                                            <div className="purchase-card-info">
                                                <p>R$ {parseFloat(item.preco_item || 0).toFixed(2)}</p>
                                                <button onClick={() => removeFromCart(item.id)} className="delete-button-pill">
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="cart-album-subtotal">
                                Subtotal deste álbum: <strong>R$ {grupo.total.toFixed(2)}</strong>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lado Direito: Resumo */}
                <div className="cart-summary-wrapper">
                    <div className="cart-summary">
                        <h2>Resumo do pedido</h2>
                        
                        <form onSubmit={handleApplyCoupon} className="coupon-form">
                            <input 
                                type="text" 
                                placeholder="Código do cupom"
                                value={codigoCupom}
                                onChange={(e) => setCodigoCupom(e.target.value)}
                                disabled={!user} 
                            />
                            <button type="submit" disabled={!user}>Aplicar</button>
                        </form>
                        {!user && <p className="login-prompt-text" style={{fontSize: '0.8rem', color: '#777', marginTop: '-10px'}}>Faça login para adicionar cupons e propostas.</p>}
                        {cupomError && <p className="error-message" style={{color: 'red'}}>{cupomError}</p>}
                        
                        <hr />

                        <div className="summary-row">
                            <span>Subtotal ({cart.itens.length} itens)</span>
                            <span>R$ {parseFloat(cart.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Desconto</span>
                            <span>- R$ {parseFloat(cart.desconto).toFixed(2)}</span>
                        </div>
                        
                        {cart.cupom && (
                            <div className="summary-row coupon-applied">
                                <span>Cupom: {cart.cupom.codigo}</span>
                                <button onClick={handleRemoveCoupon} className='remove-coupon-button'>Remover</button>
                            </div>
                        )}
                        
                        <hr />
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>R$ {parseFloat(cart.total).toFixed(2)}</span>
                        </div>
                        <div className="checkout-button-wrapper">
                            {user ? (
                                <Link 
                                    to="/checkout" 
                                    state={{ total: cart.total }} 
                                    className="create-button btn-full-width no-underline"
                                    style={{width: '100%', textAlign: 'center', textDecoration: 'none'}}
                                >
                                    Finalizar Compra
                                </Link>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="create-button btn-full-width no-underline"
                                    style={{width: '100%', textAlign: 'center', textDecoration: 'none'}}
                                >
                                    Fazer Login para Comprar
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🚀 MODAL DE PROPOSTA NO CARRINHO */}
            {isPropostaModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" >
                        <h3 className="modal-title" >Fazer uma Proposta</h3>
                        <p className="modal-description">
                            Você está a propor um novo valor para comprar as <strong>{propostaForm.qtdFotos + propostaForm.qtdVideos} mídias</strong> que selecionou deste álbum.
                        </p>
                        
                        <form onSubmit={handlePropostaSubmit} className="modal-form">
                            <div>
                                <label className="modal-label">Itens Selecionados</label>
                                <input 
                                    type="text" 
                                    value={`${propostaForm.qtdFotos} Foto(s) e ${propostaForm.qtdVideos} Vídeo(s)`} 
                                    disabled 
                                    className="modal-input modal-input-disabled"
                                />
                            </div>
                            
                            <div>
                                <label className="modal-label">Valor Oferecido (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    required 
                                    min="1" 
                                    placeholder="Ex: 150.00" 
                                    value={propostaForm.valor} 
                                    onChange={(e) => setPropostaForm({...propostaForm, valor: e.target.value})} 
                                    className="modal-input"
                                />
                            </div>

                            {/* 🚀 NOVO CAMPO: COMENTÁRIO */}
                            <div>
                                <label className="modal-label">Enviar uma menssagem (Opcional)</label>
                                <textarea 
                                    placeholder="Ex: Olá, amei as fotos! Consegue fazer esse valor se eu levar 10?" 
                                    value={propostaForm.comentario} 
                                    onChange={(e) => setPropostaForm({...propostaForm, comentario: e.target.value})} 
                                    rows="3"
                                    className="modal-textarea"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsPropostaModalOpen(false)} className="button-outline" style={{ flex: 1 }}>Cancelar</button>
                                <button type="submit" disabled={isSendingProposta} className="create-button" style={{ flex: 1 }}>
                                    {isSendingProposta ? 'A enviar...' : 'Enviar Oferta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default CartPage;