// src/components/InstagramWarning.jsx

import React, { useState, useEffect } from 'react';

function InstagramWarning() {
    const [isInstagram, setIsInstagram] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Verifica se está dentro do navegador interno do Instagram (agora serve para iOS e Android)
        if (userAgent.includes('Instagram')) {
            setIsInstagram(true);
        }
    }, []);

    // Função para copiar o link atual para a área de transferência
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setCopied(true);
                // Volta o botão ao normal após 3 segundos
                setTimeout(() => setCopied(false), 3000);
            })
            .catch(err => console.error("Erro ao copiar o link", err));
    };

    // Se não estiver no Instagram, não mostra nada
    if (!isInstagram) return null;

    return (
        <div className="insta-modal-overlay">
            <div className="insta-modal-content">
                {/* Tracinho cinza no topo do modal (Estilo gaveta) */}
                <div className="insta-modal-drag-handle"></div>
                
                <h3 className="insta-modal-title">Copie o link para baixar</h3>
                <p className="insta-modal-subtitle">Siga os passos para baixar:</p>
                
                <div className="insta-steps-container">
                    <div className="insta-step-row">
                        <div className="insta-step-number">1</div>
                        <div className="insta-step-text">Copie o link clicando no botão ao lado</div>
                        <button 
                            className={`insta-copy-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopyLink}
                        >
                            {copied ? 'Copiado!' : 'Copiar link'}
                        </button>
                    </div>
                    
                    <div className="insta-step-row">
                        <div className="insta-step-number">2</div>
                        <div className="insta-step-text">Abra seu navegador</div>
                    </div>
                    
                    <div className="insta-step-row">
                        <div className="insta-step-number">3</div>
                        <div className="insta-step-text">Cole o link e baixe suas fotos</div>
                    </div>
                </div>
                
                <div className="insta-divider">
                    <span>ou</span>
                </div>

                {/* Como não temos um App, usamos o "ou" para permitir que o cliente feche o aviso se quiser apenas olhar as fotos */}
                <button className="insta-close-btn" onClick={() => setIsInstagram(false)}>
                    Continuar navegando no Instagram
                </button>
            </div>
        </div>
    );
}

export default InstagramWarning;