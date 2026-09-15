// src/pages/SuccessPage.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function SuccessPage() {
    const { cart, fetchCart } = useCart();
    const [isFinalizing, setIsFinalizing] = useState(true);

    // Esta lógica de polling continua importante para limpar o carrinho no frontend
    useEffect(() => {
        const checkCartStatus = () => {
            if (!cart || cart.itens.length > 0) {
                fetchCart();
            } else {
                setIsFinalizing(false);
            }
        };
        checkCartStatus();
        const pollingInterval = setInterval(checkCartStatus, 3000);
        const timeout = setTimeout(() => {
            clearInterval(pollingInterval);
            setIsFinalizing(false);
        }, 30000);
        return () => {
            clearInterval(pollingInterval);
            clearTimeout(timeout);
        };
    }, [cart, fetchCart]);

    return (
        <div className="page-container success-container">
            <div className="success-card">
                <div className="success-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                
                <h2 className="page-title" style={{ marginTop: '1rem' }}>Pagamento Aprovado!</h2>

                {isFinalizing ? (
                    <p className="page-subtitle">Estamos finalizando o seu pedido, por favor aguarde...</p>
                ) : (
                    <p className="page-subtitle">O seu pedido foi processado. Já pode ver e baixar suas fotos na área "Minhas compras".</p>
                )}

                <div className="success-actions">
                    <Link to="/minhas-compras" className="create-button">Ver meus pedidos</Link>
                    <Link to="/eventos" className="button-outline">Continuar navegando</Link>
                </div>
            </div>
        </div>
    );
}

export default SuccessPage;