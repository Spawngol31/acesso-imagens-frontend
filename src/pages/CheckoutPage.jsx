// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

if (mpPublicKey) {
    initMercadoPago(mpPublicKey, { locale: 'pt-BR' });
} else {
    console.error("Chave pública do Mercado Pago não encontrada.");
}

function CheckoutPage() {
    const [preferenceId, setPreferenceId] = useState(null);
    const [orderId, setOrderId] = useState(null); // Novo estado para o ID do Pedido
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentResult, setPaymentResult] = useState(null);
    
    const location = useLocation();
    const { total } = location.state || { total: 0.00 };

    useEffect(() => {
        const createPreference = async () => {
            if (total > 0) {
                try {
                    setIsLoading(true);
                    const response = await axiosInstance.post('/checkout/mp/');
                    setPreferenceId(response.data.preference_id);
                    // --- CORREÇÃO AQUI: GUARDAMOS O ID DO PEDIDO ---
                    console.log("Pedido criado com ID:", response.data.order_id);
                    setOrderId(response.data.order_id);
                    // -----------------------------------------------
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

    const initialization = { amount: total, preferenceId: preferenceId };
    const customization = {
        paymentMethods: { bankTransfer: 'all', creditCard: 'all', debitCard: 'all', ticket: 'all' },
        visual: { style: { theme: 'default' } },
    };

    const onSubmit = async ({ selectedPaymentMethod, formData }) => {
        return new Promise((resolve, reject) => {
            // --- CORREÇÃO AQUI: ENVIAMOS O ID DO PEDIDO DE VOLTA ---
            const dataToSend = {
                ...formData,
                external_reference: orderId // Adiciona o ID ao payload
            };
            // ------------------------------------------------------

            axiosInstance.post('/checkout/mp/process/', dataToSend)
                .then((response) => {
                    resolve();
                    setPaymentResult(response.data);
                    window.scrollTo(0, 0);
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

    // --- TELA DE SUCESSO ---
    if (paymentResult) {
        const isPix = paymentResult.payment_type_id === 'bank_transfer' || paymentResult.payment_method_id === 'pix';
        const isTicket = paymentResult.payment_type_id === 'ticket' || paymentResult.payment_method_id === 'bolbradesco' || paymentResult.payment_method_id === 'pec';
        const status = paymentResult.status;
        const qrCodeBase64 = paymentResult.point_of_interaction?.transaction_data?.qr_code_base64;
        const qrCodeCopy = paymentResult.point_of_interaction?.transaction_data?.qr_code;
        const ticketUrl = paymentResult.point_of_interaction?.transaction_data?.ticket_url;

        return (
            <div className="checkout-page-container">
                <div className="checkout-card" style={{ textAlign: 'center', maxWidth: '600px' }}>
                    <h2 className="checkout-title" style={{color: '#4bb543'}}>Pedido Recebido!</h2>
                    <div style={{margin: '20px 0', color: '#555'}}>
                        <p>Obrigado pela sua compra.</p>
                        <p style={{fontSize: '0.9rem', marginTop: '5px'}}>ID do Pedido: #{paymentResult.external_reference || paymentResult.id}</p>
                    </div>

                    {isPix && qrCodeBase64 && (
                        <div className="pix-container" style={{marginTop: '20px', padding: '25px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef'}}>
                            <h3 style={{color: '#333', marginBottom: '15px'}}>Pagamento via Pix</h3>
                            <p style={{marginBottom: '15px'}}>Abra o app do seu banco e escaneie o código:</p>
                            <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code Pix" style={{maxWidth: '220px', margin: '0 auto 20px', display: 'block', border: '1px solid #ddd', borderRadius: '8px'}} />
                            <p style={{fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold'}}>Ou copie e cole este código:</p>
                            <div style={{position: 'relative'}}>
                                <textarea readOnly value={qrCodeCopy} onClick={(e) => e.target.select()} style={{width: '100%', height: '60px', fontSize: '0.8rem', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none', backgroundColor: '#fff', color: '#555'}} />
                            </div>
                        </div>
                    )}

                    {isTicket && ticketUrl && (
                        <div style={{marginTop: '30px'}}>
                            <h3 style={{marginBottom: '15px'}}>Boleto Bancário</h3>
                            <p style={{marginBottom: '20px'}}>Clique no botão abaixo para visualizar e imprimir o seu boleto.</p>
                            <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="create-button" style={{textDecoration: 'none', display: 'inline-block', padding: '10px 20px'}}>Abrir Boleto</a>
                        </div>
                    )}

                    {status === 'approved' && !isPix && !isTicket && (
                        <div style={{marginTop: '30px', padding: '20px', background: '#e8f5e9', borderRadius: '8px'}}>
                            <h3 style={{color: '#2e7d32'}}>Pagamento Aprovado!</h3>
                            <p>O seu pagamento foi confirmado. As suas fotos já estão disponíveis.</p>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <Link to="/minhas-compras" className="button-outline" style={{textDecoration: 'none'}}>Ir para Meus Pedidos</Link>
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
                {isLoading && !preferenceId && <p style={{textAlign: 'center'}}>A preparar o pagamento...</p>}
                {error && <p className="error-message">{error}</p>}
                {preferenceId && !error && (
                    <div className="payment-brick-container">
                        <Payment initialization={initialization} customization={customization} onSubmit={onSubmit} onError={onError} onReady={onReady} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckoutPage;