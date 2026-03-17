// src/pages/CartPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

function CartPage() {
    const { cart, removeFromCart, applyCoupon } = useCart();
    const { user } = useAuth(); // Continuamos a usar para saber se está logado

    const [codigoCupom, setCodigoCupom] = useState('');
    const [cupomError, setCupomError] = useState('');

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

    // REMOVEMOS O BLOQUEIO if (!user) navigate('/login'); DAQUI!
    // Agora qualquer um pode ver a página.

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

    return (
        <div className='page-container'>
            <h1>Meu carrinho</h1>
            <div className="cart-layout">
                <div className="cart-grid">
                    {cart.itens.map(item => (
                        <div key={item.id} className="purchase-card">
                            <div className="purchase-card-image">
                                {/* O fallback "|| ''" previne erros se a foto não tiver sido carregada corretamente */}
                                <img 
                                    src={item.foto?.imagem_url || ''} 
                                    alt={item.foto?.legenda || 'Foto'} 
                                    style={{ transform: `rotate(${item.foto?.rotacao || 0}deg)` }}
                                />
                            </div>
                            <div className="purchase-card-info">
                                <p>R$ {parseFloat(item.preco_item || 0).toFixed(2)}</p>
                                <button onClick={() => removeFromCart(item.id)} className="delete-button-pill">
                                    Remover
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary-wrapper">
                    <div className="cart-summary">
                        <h2>Resumo do pedido</h2>
                        
                        {/* Se não tem login, avisamos que ele precisa logar para usar cupom */}
                        <form onSubmit={handleApplyCoupon} className="coupon-form">
                            <input 
                                type="text" 
                                placeholder="Código do cupom"
                                value={codigoCupom}
                                onChange={(e) => setCodigoCupom(e.target.value)}
                                disabled={!user} // Desativa o campo se não tiver logado
                            />
                            <button type="submit" disabled={!user}>Aplicar</button>
                        </form>
                        {!user && <p style={{fontSize: '0.8rem', color: '#777', marginTop: '-10px'}}>Faça login para adicionar cupons.</p>}
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
                            
                            {/* O GRANDE SEGREDO: Se tem login, vai pro Checkout. Se não tem, vai pro Login! */}
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
        </div>
    );
}

export default CartPage;