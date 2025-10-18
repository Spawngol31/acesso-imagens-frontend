// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const banners = [
    { id: 1, img: '/images/publi_1.png', link: '#' },
    { id: 2, img: '/images/publi_2.png', link: '#' },
    { id: 3, img: '/images/publi_3.png', link: '#' },
    // Adicione um terceiro banner se desejar, por exemplo:
    // { id: 3, img: '/images/outro-banner.jpg', link: '/outro-link' },
];

function HomePage() {
    const [latestAlbuns, setLatestAlbuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    

    useEffect(() => {
        const fetchLatestAlbuns = async () => {
            try {
                setLoading(true);
                // Busca os álbuns da API (eles já vêm ordenados por data de criação)
                const response = await axiosInstance.get('/albuns/');
                // Pega apenas os 5 mais recentes para exibir na página inicial
                setLatestAlbuns(response.data.slice(0, 4));
            } catch (error) {
                console.error("Erro ao buscar os últimos álbuns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestAlbuns();
    }, []);

    useEffect(() => {
        // A cada 5 segundos, avança para o próximo banner
        const timer = setInterval(() => {
            setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
        }, 5000);

        // Limpa o timer quando o componente é desmontado para evitar memory leaks
        return () => clearInterval(timer);
    }, []);

    const goToPreviousBanner = () => {
        setCurrentBannerIndex(prevIndex => (prevIndex - 1 + banners.length) % banners.length);
    };

    const goToNextBanner = () => {
        setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
    };

    return (
        <div className="homepage">
            {/* Secção da capa, sem texto por cima */}
            <section className="hero-section" style={{ backgroundImage: `url(/images/capa_site.jpg)` }}>
                <div className="hero-overlay">
                    {/* Vazio, como solicitado */}
                </div>
            </section>

            {/* Secção dos Últimos Álbuns */}
            <section className="category-section">
                <h2>Últimos álbuns</h2>
                {loading ? (
                    <p>A carregar álbuns...</p>
                ) : (
                    <div className="album-grid">
                        {latestAlbuns.map(album => (
                            <Link to={`/album/${album.id}`} key={album.id} className="album-card">
                                <div 
                                    className="album-card-image"
                                    style={{ backgroundImage: `url(${album.capa_url})` }}
                                ></div>
                                <div className="album-card-info">
                                    <h3>{album.titulo}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {banners.length > 0 && (
                <section className="banner-section">
                    <div className="banner-rotativo">
                        <div className="banner-slides-wrapper" style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}>
                            {banners.map(banner => (
                                <div key={banner.id} className="banner-slide">
                                    <Link to={banner.link}>
                                        <img src={banner.img} alt={`Publicidade ${banner.id}`} />
                                    </Link>
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