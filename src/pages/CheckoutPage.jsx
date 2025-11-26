// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

// 1. Inicializa o Mercado Pago
const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

if (mpPublicKey) {
    console.log("Inicializando Mercado Pago com chave:", mpPublicKey); // Log de debug
    initMercadoPago(mpPublicKey, {
        locale: 'pt-BR'
    });
} else {
    console.error("!!! ERRO CRÍTICO: Chave pública (VITE_MP_PUBLIC_KEY) não encontrada no .env !!!");
}

function CheckoutPage() {
    const [preferenceId, setPreferenceId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    
    const { total } = location.state || { total: 0.00 };

    useEffect(() => {
        const createPreference = async () => {
            if (total > 0) {
                try {
                    setIsLoading(true);
                    console.log("Pedindo preferência ao backend...");
                    const response = await axiosInstance.post('/checkout/mp/');
                    console.log("Preferência recebida:", response.data.preference_id);
                    setPreferenceId(response.data.preference_id);
                } catch (error) {
                    console.error("Erro ao criar preferência:", error);
                    setError("Não foi possível carregar o pagamento.");
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError("O total do carrinho não pode ser zero.");
                setIsLoading(false);
            }
        };
        createPreference();
    }, [total]);

    const initialization = {
        amount: total,
        preferenceId: preferenceId,
    };

    // --- CORREÇÃO AQUI ---
    const customization = {
        paymentMethods: {
            // 'pix' não é um parâmetro válido aqui. O Pix faz parte de 'bankTransfer'.
            bankTransfer: 'all', 
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all', // Boleto
        },
        visual: {
            style: {
                theme: 'default',
            },
        },
    };
    // ---------------------

    const onSubmit = async ({ selectedPaymentMethod, formData }) => {
        return new Promise((resolve) => {
            // O Mercado Pago trata do redirecionamento ou exibição do QR Code
            resolve();
        });
    };

    const onError = async (error) => {
        console.error("Erro no Payment Brick:", error);
    };

    const onReady = async () => {
        setIsLoading(false);
    };

    return (
        <div className="checkout-page-container">
            <div className="checkout-card">
                <h2>Finalizar Compra</h2>
                <p className="checkout-total">
                    Valor Total: <strong>R$ {total.toFixed(2)}</strong>
                </p>

                {isLoading && !preferenceId && <p>A preparar o pagamento...</p>}
                {error && <p className="error-message">{error}</p>}

                {preferenceId && !error && (
                    <div className="payment-brick-container">
                        <Payment
                            initialization={initialization}
                            customization={customization}
                            onSubmit={onSubmit}
                            onError={onError}
                            onReady={onReady}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckoutPage;