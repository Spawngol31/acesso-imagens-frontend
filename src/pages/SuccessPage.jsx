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
        <div className="page-container">
            <div className="success-page">
                <h2>Pagamento Aprovado!</h2>

                {isFinalizing ? (
                    <p>Estamos finalizando o seu pedido, por favor aguarde...</p>
                ) : (
                    <p>O seu pedido foi processado. Já pode ver e baixar suas fotos na área "Minhas compras".</p>
                )}

                {/* --- BOTÕES ESTILIZADOS --- */}
                <div className="success-actions">
                    <Link to="/minhas-compras" className="create-button">Ver meus pedidos</Link>
                    <Link to="/eventos" className="button-outline">Continuar navegando</Link>
                </div>
            </div>
        </div>
    );
}

export default SuccessPage;