// src/components/InstagramWarning.jsx

import React, { useState, useEffect } from 'react';

function InstagramWarning() {
    const [isInstagramIOS, setIsInstagramIOS] = useState(false);
    const [safariUrl, setSafariUrl] = useState('');

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Verifica se é Instagram E se é dispositivo Apple (iOS)
        const isInstagram = userAgent.includes('Instagram');
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

        if (isInstagram && isIOS) {
            setIsInstagramIOS(true);
            
            // Pega a URL exata onde o cliente está e troca para o protocolo do Safari
            const currentUrl = window.location.href;
            const escapeUrl = currentUrl.replace(/^https?:\/\//, 'x-safari-https://');
            setSafariUrl(escapeUrl);
        }
    }, []);

    // Se não estiver no Instagram do iPhone, o componente fica invisível
    if (!isInstagramIOS) return null;

    return (
        <div className="noti-insta">
            <p className="noti-insta-aviso">
                ⚠️ <strong>Aviso Importante:</strong> O Instagram bloqueia carrinhos de compra e downloads. Para comprar e baixar as suas fotos, por favor clique no botão abaixo.
            </p>
            <a 
                href={safariUrl}
                className="noti-insta-aviso-link"
            >
                Abrir no Safari para comprar 🧭
            </a>
        </div>
    );
}

export default InstagramWarning;

<InstagramWarning />