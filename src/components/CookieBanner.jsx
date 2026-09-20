// src/components/CookieBanner.jsx

import React, { useState, useEffect } from 'react';

function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verifica se o utilizador já respondeu ao aviso de cookies anteriormente
        const consent = localStorage.getItem('cookieConsent_AcessoImagens');
        
        // Se não houver registo (é a primeira visita), mostramos a gaveta
        if (!consent) {
            // Um pequeno delay de 1 segundo para a animação ficar mais natural
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent_AcessoImagens', 'accepted');
        setIsVisible(false);
        // NOTA FUTURA: Aqui é onde você ligará o Google Analytics ou Pixel do Facebook no futuro
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent_AcessoImagens', 'declined');
        setIsVisible(false);
        // O utilizador recusou o rastreamento, o site continua a funcionar normalmente
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner-overlay">
            <div className="cookie-banner-content">
                <div className="cookie-text-section">
                    <h4>Sua privacidade é importante</h4>
                    <p>
                        Usamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar a sua experiência. 
                        Ao clicar em "Aceitar e Continuar", você concorda com a nossa política de privacidade.
                    </p>
                </div>
                <div className="cookie-actions">
                    <button className="cookie-btn-decline" onClick={handleDecline}>Apenas Essenciais</button>
                    <button className="cookie-btn-accept" onClick={handleAccept}>Aceitar e Continuar</button>
                </div>
            </div>
        </div>
    );
}

export default CookieBanner;