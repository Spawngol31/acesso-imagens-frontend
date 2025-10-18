// src/pages/CartPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

function CartPage() {
    const { cart, removeFromCart, applyCoupon } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

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
            // Chamamos a mesma função, mas com 'null' para indicar remoção
            await applyCoupon(null);
            setCodigoCupom(''); // Limpa o campo de texto
            setCupomError('');
        } catch (error) {
            console.error("Erro ao remover cupom:", error);
            setCupomError("Não foi possível remover o cupom.");
        }
    };

    if (!user) {
        // Redireciona para o login se o utilizador tentar aceder sem estar logado
        navigate('/login');
        return null;
    }

    // Mostra 'a carregar' enquanto o carrinho não foi buscado pela primeira vez
    if (cart === null) {
        return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar carrinho...</p>;
    }

    if (cart.itens.length === 0) {
        return (
            <div className='page-container' style={{ textAlign: 'center' }}>
                <h1>Meu carrinho</h1>
                <div className="empty-state-container">
                    <p>O seu carrinho está vazio.</p>
                    <Link 
                        to="/eventos" 
                        className="create-button" 
                        style={{ textDecoration: 'none' }}
                    >
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
                                <img 
                                    src={item.foto.imagem_url} 
                                    alt={item.foto.legenda} 
                                    style={{ transform: `rotate(${item.foto.rotacao}deg)` }}
                                />
                            </div>
                            <div className="purchase-card-info">
                                <p>R$ {parseFloat(item.preco_item).toFixed(2)}</p>
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
                        <form onSubmit={handleApplyCoupon} className="coupon-form">
                            <input 
                                type="text" 
                                placeholder="Código do cupom"
                                value={codigoCupom}
                                onChange={(e) => setCodigoCupom(e.target.value)}
                            />
                            <button type="submit">Aplicar</button>
                        </form>
                        {cupomError && <p className="error-message">{cupomError}</p>}
                        
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
                            <Link to="/checkout" className="create-button">
                                Finalizar compras
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;