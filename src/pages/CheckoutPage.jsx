// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

if (mpPublicKey) {
    initMercadoPago(mpPublicKey, { locale: 'pt-BR' });
}

function CheckoutPage() {
    const [preferenceId, setPreferenceId] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [total, setTotal] = useState(0.00); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentResult, setPaymentResult] = useState(null);
    
    // 🚀 Lemos o tema diretamente do HTML para garantir que bate certo com o fundo
    const [appTheme, setAppTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    });
    
    const location = useLocation();
    const { id: pedidoIdFromUrl } = useParams(); 
    const navigate = useNavigate();

    const { fetchCart } = useCart();

    useEffect(() => {
        // Escuta ativamente as mudanças de tema no documento (quando clica no Sol/Lua)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    setAppTheme(document.documentElement.getAttribute('data-theme') || 'light');
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        
        // Garante a leitura correta no momento da montagem
        setAppTheme(document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light');

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const initCheckout = async () => {
            try {
                setIsLoading(true);

                if (pedidoIdFromUrl) {
                    const response = await axiosInstance.get(`/compras/${pedidoIdFromUrl}/retomar/`); 
                    setPreferenceId(response.data.preference_id);
                    setOrderId(response.data.order_id || pedidoIdFromUrl);
                    setTotal(parseFloat(response.data.total));
                } 
                else {
                    const totalCarrinho = location.state?.total || 0.00;
                    if (totalCarrinho <= 0) {
                        setError("O total do carrinho não pode ser zero.");
                        setIsLoading(false);
                        return;
                    }
                    setTotal(totalCarrinho);
                    const response = await axiosInstance.post('/checkout/mp/');
                    setPreferenceId(response.data.preference_id);
                    setOrderId(response.data.order_id);
                }
            } catch (error) {
                console.error("Erro ao inicializar checkout:", error);
                setError("Não foi possível carregar os dados do pagamento.");
            } finally {
                setIsLoading(false);
            }
        };

        initCheckout();
    }, [pedidoIdFromUrl, location.state]);

    useEffect(() => {
        let interval;
        if (paymentResult) {
            interval = setInterval(() => {
                fetchCart();
            }, 3000);
        }
        return () => clearInterval(interval); 
    }, [paymentResult, fetchCart]);

    const initialization = { amount: total, preferenceId: preferenceId };
    
    // Configura o tema do Mercado Pago baseado na nossa variável de estado
    const customization = {
        paymentMethods: { bankTransfer: 'all', creditCard: 'all', debitCard: 'all', ticket: 'all' },
        visual: { 
            style: { 
                theme: appTheme === 'dark' ? 'dark' : 'default'
            } 
        },
    };

    const onSubmit = async ({ selectedPaymentMethod, formData }) => {
        return new Promise((resolve, reject) => {
            const dataToSend = {
                ...formData,
                external_reference: orderId 
            };

            axiosInstance.post('/checkout/mp/process/', dataToSend)
                .then((response) => {
                    resolve();
                    setPaymentResult(response.data);
                    window.scrollTo(0, 0);
                    fetchCart();
                })
                .catch((error) => {
                    console.error("MP: Erro", error);
                    reject();
                    setError("Erro ao processar o pagamento. Tente novamente.");
                });
        });
    };

    const onError = async (error) => { console.error("Erro Brick:", error); };
    const onReady = async () => { setIsLoading(false); };

    const handleCopiarPix = (codigoPix) => {
        if (!codigoPix) return;
        
        navigator.clipboard.writeText(codigoPix)
            .then(() => {
                toast.success("Código Pix copiado com sucesso! Abra o app do seu banco para pagar.");
            })
            .catch((err) => {
                console.error("Erro ao copiar o Pix: ", err);
                toast.error("Não foi possível copiar automaticamente.");
            });
    };

    if (paymentResult) {
        const isPix = paymentResult.payment_type_id === 'bank_transfer' || paymentResult.payment_method_id === 'pix';
        const isTicket = paymentResult.payment_type_id === 'ticket' || paymentResult.payment_method_id === 'bolbradesco' || paymentResult.payment_method_id === 'pec';
        const status = paymentResult.status;
        const qrCodeBase64 = paymentResult.point_of_interaction?.transaction_data?.qr_code_base64;
        const qrCodeCopy = paymentResult.point_of_interaction?.transaction_data?.qr_code;
        const ticketUrl = paymentResult.point_of_interaction?.transaction_data?.ticket_url;

        return (
            <div className="checkout-page-container">
                <div className="checkout-card success-checkout-card">
                    <h2 className="checkout-title">Pedido Recebido!</h2>
                    <div className="checkout-subtitle-box">
                        <p>Obrigado por sua compra.</p>
                        <p className="checkout-order-id">ID do Pedido: #{paymentResult.external_reference || paymentResult.id}</p>
                    </div>

                    {isPix && qrCodeBase64 && (
                        <div className="pix-container">
                            <h3 className="pix-title">Pagamento via Pix</h3>
                            <p className="pix-instruction">Abra o app do seu banco e escaneie o código:</p>
                            <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code Pix" className="pix-qrcode-img" />
                            
                            <p className="pix-instruction-bold">Ou copie e cole este código:</p>
                            <div className="pix-copy-wrapper">
                                <textarea 
                                    readOnly 
                                    value={qrCodeCopy} 
                                    className="pix-textarea"
                                />
                                <button 
                                    onClick={() => handleCopiarPix(qrCodeCopy)}
                                    className="create-button pix-copy-btn-large">
                                    Copiar código Pix
                                </button>
                            </div>
                        </div>
                    )}

                    {isTicket && ticketUrl && (
                        <div className="ticket-container">
                            <h3 className="ticket-title">Boleto Bancário</h3>
                            <p className="ticket-instruction">Clique no botão abaixo para visualizar e imprimir o seu boleto.</p>
                            <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="create-button ticket-btn">Abrir Boleto</a>
                        </div>
                    )}

                    {status === 'approved' && !isPix && !isTicket && (
                        <div className="payment-approved-box">
                            <h3 className="payment-approved-title">Pagamento Aprovado!</h3>
                            <p className="payment-approved-text">O seu pagamento foi confirmado. As suas fotos já estão disponíveis.</p>
                        </div>
                    )}

                    <div className="checkout-footer-actions">
                        <Link to="/minhas-compras" className="button-outline checkout-link-btn">Ir para Minhas compras</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page-container">
            <div className="checkout-card">
                <h2 className="checkout-title">Finalizar Compra</h2>
                <p className="checkout-total">Valor Total: <strong>R$ {total.toFixed(2)}</strong></p>
                {isLoading && !preferenceId && <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>A preparar o pagamento...</p>}
                {error && <p className="error-message">{error}</p>}
                {preferenceId && !error && (
                    <div className="payment-brick-container">
                        <Payment 
                            key={`mp-brick-${preferenceId}-${appTheme}`}
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