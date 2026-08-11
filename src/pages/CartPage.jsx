// src/pages/CartPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance'; // <-- IMPORTANTE
import { toast } from 'react-toastify'; // <-- IMPORTANTE

function CartPage() {
    const { cart, removeFromCart, applyCoupon } = useCart();
    const { user } = useAuth(); 

    const [codigoCupom, setCodigoCupom] = useState('');
    const [cupomError, setCupomError] = useState('');

    // --- ESTADOS DO MODAL DE PROPOSTA ---
    const [isPropostaModalOpen, setIsPropostaModalOpen] = useState(false);
    const [propostaForm, setPropostaForm] = useState({ albumId: null, qtdFotos: 0, qtdVideos: 0, valor: '' });
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

    // --- LÓGICA DA PROPOSTA NO CARRINHO ---
    const abrirModalProposta = (albumId, qtdFotos, qtdVideos) => {
        setPropostaForm({ albumId: albumId, qtdFotos: qtdFotos, qtdVideos: qtdVideos, valor: '' });
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
                valor_oferecido: propostaForm.valor
            });
            toast.success("🤝 Proposta enviada com sucesso! Acompanhe em 'Minhas Propostas'.");
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
                <h1>🛒 Meu carrinho</h1>
                <div className="empty-state-container">
                    <p>O seu carrinho está vazio.</p>
                    <Link to="/eventos" className="create-button" style={{ textDecoration: 'none' }}>
                        Ver álbuns
                    </Link>
                </div>
            </div>
        );
    }

    // --- AGRUPAR MÍDIAS POR ÁLBUM ---
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
            <h1>🛒 Meu carrinho</h1>
            
            <div className="cart-layout">
                {/* Lado Esquerdo: Lista de Fotos Agrupadas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.values(itensAgrupados).map(grupo => (
                        <div key={grupo.albumId} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e1bce0', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            
                            {/* Cabeçalho do Grupo (Álbum) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #fbf0fa', paddingBottom: '15px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                <h3 style={{ margin: 0, color: '#6c0464', fontSize: '18px' }}>
                                    📸 {grupo.albumTitulo} ({grupo.itens.length} itens)
                                </h3>
                                
                                {/* O botão de proposta só aparece se houver pelo menos 2 itens do mesmo álbum */}
                                {grupo.itens.length >= 2 && user && (
                                    <button 
                                        onClick={() => abrirModalProposta(grupo.albumId, grupo.qtdFotos, grupo.qtdVideos)} 
                                        className="button-outline"
                                        style={{ padding: '6px 15px', fontSize: '13px' }}
                                    >
                                        🤝 Fazer Proposta
                                    </button>
                                )}
                            </div>

                            {/* Grid das Fotos dentro do Grupo */}
                            <div className="cart-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                                {grupo.itens.map(item => {
                                    const mediaVisual = item.foto || item.video; // Puxa a mídia correta
                                    return (
                                        <div key={item.id} className="purchase-card">
                                            <div className="purchase-card-image" style={{ position: 'relative', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            
                                            {/* Se tiver a imagem (ou miniatura do vídeo), mostra. Se não tiver, mostra um ícone */}
                                            {mediaVisual?.imagem_url || mediaVisual?.miniatura_url ? (
                                                <img 
                                                    src={mediaVisual.imagem_url || mediaVisual.miniatura_url} 
                                                    alt={mediaVisual.legenda || mediaVisual.titulo || 'Mídia'} 
                                                    style={{ transform: `rotate(${mediaVisual.rotacao || 0}deg)`, width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ color: '#aaa', fontSize: '30px' }}>
                                                    {item.video ? '🎥' : '📷'}
                                                </div>
                                            )}

                                            {/* Se for VÍDEO, coloca um selo de PLAY escuro por cima */}
                                            {item.video && (
                                                <div style={{
                                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '36px', height: '36px',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'
                                                }}>
                                                    <span style={{ color: 'white', fontSize: '16px', marginLeft: '4px' }}>▶</span>
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
                            
                            {/* Subtotal do Álbum */}
                            <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '14px', color: '#555' }}>
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
                        {!user && <p style={{fontSize: '0.8rem', color: '#777', marginTop: '-10px'}}>Faça login para adicionar cupons e propostas.</p>}
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
                                    className="create-button"
                                    style={{width: '100%', textAlign: 'center', textDecoration: 'none'}}
                                >
                                    Finalizar Compra
                                </Link>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="create-button"
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#6c0464', marginTop: 0, marginBottom: '15px' }}>🤝 Fazer uma Proposta</h3>
                        <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>
                            Você está a propor um novo valor para comprar as <strong>{propostaForm.qtd} fotos</strong> que selecionou deste álbum.
                        </p>
                        
                        <form onSubmit={handlePropostaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Itens Selecionados (Trancado)</label>
                                <input 
                                    type="text" 
                                    value={`${propostaForm.qtdFotos} Foto(s) e ${propostaForm.qtdVideos} Vídeo(s)`} 
                                    disabled 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#e9ecef', color: '#666' }} 
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Valor Oferecido (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    required 
                                    min="1" 
                                    placeholder="Ex: 150.00" 
                                    value={propostaForm.valor} 
                                    onChange={(e) => setPropostaForm({...propostaForm, valor: e.target.value})} 
                                    style={{ backgroundColor: '#fff', color: '#666', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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