// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- Adicionado useNavigate
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';

const banners = [
    { 
        id: 1, 
        type: 'image', 
        srcDesktop: '/images/publi_1_pc.png',
        srcMobile: '/images/publi_1_mobile.jpeg',
        link: 'https://wa.me/5592981637614?text=Olá!%20Vim%20através%20do%20site%20da%20Acesso%20Imagens.%20Gostaria%20de%20mais%20informações.' 
    },
    { 
        id: 2, 
        type: 'video', 
        srcDesktop: '/videos/publi_video_pc.mp4',
        srcMobile: '/videos/publi_video_mobile.mp4',
        link: 'https://wa.me/5592981637614?text=Olá!%20Vim%20através%20do%20site%20da%20Acesso%20Imagens.%20Gostaria%20de%20mais%20informações.' 
    },
];

function HomePage() {
    const [latestAlbuns, setLatestAlbuns] = useState([]);
    const [latestNews, setLatestNews] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    
    // --- NOVO ESTADO PARA A BUSCA NA HOME ---
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Redireciona para a página de álbuns passando o termo de busca na URL
            navigate(`/eventos?q=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate(`/eventos`);
        }
    };
    // ----------------------------------------

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                try {
                    const albunsResponse = await axiosInstance.get('/albuns/');
                    if (Array.isArray(albunsResponse.data)) {
                        setLatestAlbuns(albunsResponse.data.slice(0, 4));
                    } else if (albunsResponse.data.results) {
                        setLatestAlbuns(albunsResponse.data.results.slice(0, 4));
                    }
                } catch (error) {
                    console.error("Erro ao buscar álbuns:", error);
                }

                try {
                    const wpUrl = 'https://portal.acessoimagens.com.br/wp-json/wp/v2/posts?_embed&per_page=4';
                    const newsResponse = await axios.get(wpUrl);
                    setLatestNews(newsResponse.data);
                } catch (error) {
                    console.error("Erro ao buscar notícias do WP:", error);
                }

            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const renderBannerContent = (banner) => {
        if (banner.type === 'video') {
            return (
                <>
                    <video src={banner.srcDesktop} className="banner-media desktop-media" autoPlay loop muted playsInline></video>
                    <video src={banner.srcMobile} className="banner-media mobile-media" autoPlay loop muted playsInline></video>
                </>
            );
        }
        return (
            <>
                <img src={banner.srcDesktop} alt={`Publicidade ${banner.id}`} className="banner-media desktop-media" />
                <img src={banner.srcMobile} alt={`Publicidade ${banner.id}`} className="banner-media mobile-media" />
            </>
        );
    };

    return (
        <div className="homepage">
            
            {/* --- SEÇÃO HERO RESPONSIVA --- */}
            <section className="hero-section">
                <div className="hero-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    
                    <h1 className="hero-title">
                        Encontre suas fotos
                    </h1>
                    
                    <div className="hero-search-container">
                        
                        {/* 1. BARRA DE PESQUISA */}
                        <form onSubmit={handleSearchSubmit} className="search-bar-wrapper">
                            <span style={{ color: '#b0b0b0', fontSize: '1.2rem', marginRight: '10px' }}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="Pesquise por álbuns..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} style={{color: 'rgb(109, 109, 109)'}}
                            />
                        </form>

                        {/* 2. DIVISOR "OU" */}
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '15px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }}></div>
                            <span style={{ color: 'white', fontSize: '16px', fontWeight: '500', textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
                                ou
                            </span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }}></div>
                        </div>

                        {/* 3. BOTÃO DE BUSCA FACIAL */}
                        <div onClick={() => navigate('/busca')} className="selfie-card">
                            <div className="selfie-icon">🤳🏻</div>
                            <div className="selfie-text-container" style={{ flex: 1 }}>
                                <h3>Encontre suas fotos com uma selfie</h3>
                                
                            </div>
                            <div style={{ color: '#313b53', fontSize: '1.5rem', marginLeft: '10px' }}>
                                &rarr;
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ------------------------------------------- */}
            {/* SEÇÃO 1: ÚLTIMOS ÁLBUNS */}
            <section className="category-section">
                <h2>🎞️ Últimos álbuns</h2>
                {loading ? <p style={{textAlign: 'center'}}>A carregar...</p> : (
                    <div className="album-grid">
                        {latestAlbuns.length > 0 ? (
                            latestAlbuns.map(album => (
                                <Link to={`/album/${album.id}`} key={album.id} className="album-card">
                                    <div className="album-card-image" style={{ backgroundImage: `url(${album.capa_url || album.capa})` }}></div>
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

            {/* SECÇÃO 2: ÚLTIMAS NOTÍCIAS */}
            {!loading && latestNews.length > 0 && (
                <section className="category-section" style={{ marginTop: '0.2rem', paddingTop: '0.5rem' }}>
                    <h2>📰 Últimas Notícias</h2>
                    <div className="album-grid"> 
                        {latestNews.map(noticia => {
                            const imagemUrl = noticia._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/capa-padrao.jpg';
                            
                            return (
                                <Link 
                                    to={`/noticias/${noticia.slug}`} 
                                    key={noticia.id} 
                                    className="album-card"
                                >
                                    <div className="album-card-image" style={{ backgroundImage: `url(${imagemUrl})` }}></div>
                                    <div className="album-card-info">
                                        <h3 dangerouslySetInnerHTML={{ __html: noticia.title.rendered }}></h3>
                                        <p style={{fontSize: '0.85rem', color: '#777', marginTop: '0.5rem', marginBottom: '0'}}>
                                            Ler notícia &rarr;
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* SEÇÃO 3: BANNER DE PUBLICIDADE */}
            {banners.length > 0 && (
                <section className="banner-section" style={{ marginTop: '3rem' }}>
                    <div className="banner-rotativo">
                        <div className="banner-slides-wrapper" style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}>
                            {banners.map(banner => (
                                <div key={banner.id} className="banner-slide">
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