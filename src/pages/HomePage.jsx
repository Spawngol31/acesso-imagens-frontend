// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const banners = [
    { id: 1, img: '/images/publi_1.png', link: '#' },
    { id: 2, img: '/images/publi_2.png', link: '#' },
];

function HomePage() {
    // 1. Garantia: O estado DEVE começar como um array vazio
    const [latestAlbuns, setLatestAlbuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    useEffect(() => {
        const fetchLatestAlbuns = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/albuns/');
                // Garante que o que recebemos é um array antes de o definir
                if (Array.isArray(response.data)) {
                    setLatestAlbuns(response.data.slice(0, 4));
                } else {
                    setLatestAlbuns([]); // Se a API falhar, define como array vazio
                }
            } catch (error) {
                console.error("Erro ao buscar os últimos álbuns:", error);
                setLatestAlbuns([]); // Em caso de erro, define como array vazio
            } finally {
                setLoading(false);
            }
        };
        fetchLatestAlbuns();
    }, []);

    // Efeito para a rotação automática do banner
    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, []); // Array de dependência vazio está correto

    const goToPreviousBanner = () => {
        setCurrentBannerIndex(prevIndex => (prevIndex - 1 + banners.length) % banners.length);
    };

    const goToNextBanner = () => {
        setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
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
                        {/* 2. Garantia EXTRA: Verifica se é um array E se tem itens */}
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