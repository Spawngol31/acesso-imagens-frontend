// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

// --- 1. ATUALIZAÇÃO DA ESTRUTURA DOS BANNERS ---
// Agora adicionamos um campo 'type' (image ou video) e a fonte (src).
const banners = [
    { 
        id: 1, 
        type: 'image', 
        srcDesktop: '/images/publi_1_pc.png',       // Imagem larga para PC
        srcMobile: '/images/publi_1_mobile.png',    // Imagem mais quadrada/alta para celular
        link: 'http://wa.me/559281637614?text=Olá!%20Vim%20através%20do%20site%20da%20Acesso%20Imagens.%20gostaria%20de%20mais%20informações.' // Pode ser um link externo
    },
    { 
        id: 2, 
        type: 'video', 
        srcDesktop: '/videos/publi_video_pc.mp4',   // Vídeo largo para PC
        srcMobile: '/videos/publi_video_mobile.mp4',// Vídeo vertical/quadrado para celular
        link: 'http://wa.me/559281637614?text=Olá!%20Vim%20através%20do%20site%20da%20Acesso%20Imagens.%20gostaria%20de%20mais%20informações.' 
    },
];

function HomePage() {
    const [latestAlbuns, setLatestAlbuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    useEffect(() => {
        const fetchLatestAlbuns = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/albuns/');
                if (Array.isArray(response.data)) {
                    setLatestAlbuns(response.data.slice(0, 4));
                } else {
                    setLatestAlbuns([]); 
                }
            } catch (error) {
                console.error("Erro ao buscar os últimos álbuns:", error);
                setLatestAlbuns([]); 
            } finally {
                setLoading(false);
            }
        };
        fetchLatestAlbuns();
    }, []);

    // Efeito para a rotação automática do banner
    // Aumentei o tempo para 8s se tiver vídeo, para dar tempo de assistir um pouco mais.
    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
            }, 8000); 
            return () => clearInterval(timer);
        }
    }, []);

    const goToPreviousBanner = () => {
        setCurrentBannerIndex(prevIndex => (prevIndex - 1 + banners.length) % banners.length);
    };

    const goToNextBanner = () => {
        setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
    };

    // 2. Atualize a função que desenha os banners
    const renderBannerContent = (banner) => {
        if (banner.type === 'video') {
            return (
                <>
                    {/* Vídeo do PC (Aparece só em telas grandes) */}
                    <video src={banner.srcDesktop} className="banner-media desktop-media" autoPlay loop muted playsInline></video>
                    {/* Vídeo do Celular (Aparece só em telas pequenas) */}
                    <video src={banner.srcMobile} className="banner-media mobile-media" autoPlay loop muted playsInline></video>
                </>
            );
        }
        
        // Padrão (Imagem)
        return (
            <>
                <img src={banner.srcDesktop} alt={`Publicidade ${banner.id}`} className="banner-media desktop-media" />
                <img src={banner.srcMobile} alt={`Publicidade ${banner.id}`} className="banner-media mobile-media" />
            </>
        );
    };

    return (
        <div className="homepage">
            <section className="hero-section">
                <div className="hero-overlay"></div>
            </section>

            <section className="category-section">
                <h2>Últimos álbuns</h2>
                {loading ? <p style={{textAlign: 'center'}}>A carregar álbuns...</p> : (
                    <div className="album-grid">
                        {Array.isArray(latestAlbuns) && latestAlbuns.length > 0 ? (
                            latestAlbuns.map(album => (
                                <Link to={`/album/${album.id}`} key={album.id} className="album-card">
                                    <div className="album-card-image" style={{ backgroundImage: `url(${album.capa_url})` }}></div>
                                    <div className="album-card-info">
                                        <h3>{album.titulo}</h3>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p style={{textAlign: 'center'}}>Nenhum álbum encontrado.</p>
                        )}
                    </div>
                )}
            </section>

            {banners.length > 0 && (
                <section className="banner-section">
                    <div className="banner-rotativo">
                        <div className="banner-slides-wrapper" style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}>
                            {banners.map(banner => (
                                <div key={banner.id} className="banner-slide">
                                    {/* Link envolvendo o conteúdo renderizado (vídeo ou imagem) */}
                                    <a href={banner.link} target="_blank" rel="noopener noreferrer">
                                        {renderBannerContent(banner)}
                                    </a>
                                </div>
                            ))}
                        </div>
                        {banners.length > 1 && (
                            <>
                                <button onClick={goToPreviousBanner} className="banner-nav prev">&#10094;</button>
                                <button onClick={goToNextBanner} className="banner-nav next">&#10095;</button>
                                <div className="banner-dots">
                                    {banners.map((_, index) => (
                                        <span 
                                            key={index} 
                                            className={`dot ${currentBannerIndex === index ? 'active' : ''}`}
                                            onClick={() => setCurrentBannerIndex(index)}
                                        ></span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

export default HomePage;