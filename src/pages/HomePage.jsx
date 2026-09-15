// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0); 
    const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0); 
    const [currentAvaliacaoIndex, setCurrentAvaliacaoIndex] = useState(0); 

    const [isPausedBanner, setIsPausedBanner] = useState(false);
    const [isPausedAlbuns, setIsPausedAlbuns] = useState(false);
    const [isPausedNews, setIsPausedNews] = useState(false);
    const [isPausedAvaliacoes, setIsPausedAvaliacoes] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/eventos?q=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate(`/eventos`);
        }
    };

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

                try {
                    const avResponse = await axiosInstance.get('/avaliacoes/destaques/');
                    const dadosAvaliacoes = avResponse.data.results || avResponse.data;
                    if(dadosAvaliacoes && dadosAvaliacoes.length > 0) {
                        setAvaliacoes(dadosAvaliacoes);
                    }
                } catch (error) {
                    console.error("Erro ao buscar avaliações:", error);
                }

            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- AUTO-PLAYS COM PAUSA ---
    useEffect(() => {
        if (banners.length > 1 && !isPausedBanner) {
            const timer = setInterval(() => setCurrentBannerIndex(prev => (prev + 1) % banners.length), 8000); 
            return () => clearInterval(timer);
        }
    }, [isPausedBanner]);

    useEffect(() => {
        if (latestNews.length > 1 && !isPausedNews) {
            const timer = setInterval(() => setCurrentNewsIndex(prev => (prev + 1) % latestNews.length), 5000); 
            return () => clearInterval(timer);
        }
    }, [latestNews.length, isPausedNews]);

    useEffect(() => {
        if (latestAlbuns.length > 1 && !isPausedAlbuns) {
            const timer = setInterval(() => setCurrentAlbumIndex(prev => (prev + 1) % latestAlbuns.length), 6000); 
            return () => clearInterval(timer);
        }
    }, [latestAlbuns.length, isPausedAlbuns]);

    useEffect(() => {
        if (avaliacoes.length > 1 && !isPausedAvaliacoes) {
            const timer = setInterval(() => setCurrentAvaliacaoIndex(prev => (prev + 1) % avaliacoes.length), 7000); 
            return () => clearInterval(timer);
        }
    }, [avaliacoes.length, isPausedAvaliacoes]);

    // --- NAVEGAÇÃO ---
    const goToPreviousBanner = () => setCurrentBannerIndex(prev => (prev - 1 + banners.length) % banners.length);
    const goToNextBanner = () => setCurrentBannerIndex(prev => (prev + 1) % banners.length);

    const prevAlbum = () => setCurrentAlbumIndex(prev => (prev - 1 + latestAlbuns.length) % latestAlbuns.length);
    const nextAlbum = () => setCurrentAlbumIndex(prev => (prev + 1) % latestAlbuns.length);

    const prevNews = () => setCurrentNewsIndex(prev => (prev - 1 + latestNews.length) % latestNews.length);
    const nextNews = () => setCurrentNewsIndex(prev => (prev + 1) % latestNews.length);

    const prevReview = () => setCurrentAvaliacaoIndex(prev => (prev - 1 + avaliacoes.length) % avaliacoes.length);
    const nextReview = () => setCurrentAvaliacaoIndex(prev => (prev + 1) % avaliacoes.length);

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
            
            {/* --- SEÇÃO HERO --- */}
            <section className="home-hero-section">
                <div className="home-hero-overlay">
                    <h1 className="home-hero-title">Encontre suas fotos</h1>
                    
                    <div className="home-hero-search-container">
                        <form onSubmit={handleSearchSubmit} className="search-bar-wrapper">
                            <span className="search-bar-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Pesquise por álbuns..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="search-bar-input"
                            />
                        </form>

                        <div className="hero-separator">
                            <div className="hero-separator-line"></div>
                            <span className="hero-separator-text">ou</span>
                            <div className="hero-separator-line"></div>
                        </div>

                        <div onClick={() => navigate('/busca')} className="selfie-card hero-selfie-card">
                            <div className="selfie-text-container">
                                <h3>Encontre suas fotos com uma selfie</h3>
                            </div>
                            <div className="selfie-icon-arrow">&rarr;</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SEÇÃO SOLUÇÕES --- */}
            <section className="solucoes-section">
                <div className="solucoes-content">
                    <h2 className="solucoes-home-title">
                        <span className="text-highlight-purple">Agência de Comunicação</span> 360° no futebol
                    </h2>
                    <p className="solucoes-home-subtitle">
                        Atuamos ao lado de clubes, atletas profissionais e staffs técnicos para construir imagem, fortalecer marcas e desenvolver uma comunicação estratégica dentro e fora de campo.
                    </p>
                    <Link to="/solucoes" className="cta-solucoes-btn">
                        Conheça nossos serviços &rarr;
                    </Link>
                </div>
            </section>

            {/* --- SEÇÃO ÁLBUNS E NOTÍCIAS --- */}
            <div className="home-split-layout">
                
                {/* COLUNA 1: ÚLTIMOS ÁLBUNS */}
                <section className="split-section">
                    <h2 className="split-section-title">Últimos álbuns</h2>
                    
                    {loading ? <p className="loading-text">A carregar...</p> : (
                        <div 
                            className="carousel-container"
                            onMouseDown={() => setIsPausedAlbuns(true)}
                            onMouseUp={() => setIsPausedAlbuns(false)}
                            onMouseLeave={() => setIsPausedAlbuns(false)}
                            onTouchStart={() => setIsPausedAlbuns(true)}
                            onTouchEnd={() => setIsPausedAlbuns(false)}
                        >
                            {latestAlbuns.length > 0 ? (
                                <>
                                    <button onClick={prevAlbum} className="side-nav-btn left" title="Anterior">&#10094;</button>
                                    <button onClick={nextAlbum} className="side-nav-btn right" title="Próximo">&#10095;</button>

                                    <div className="carousel-track" style={{ transform: `translateX(-${currentAlbumIndex * 100}%)` }}>
                                        {latestAlbuns.map(album => (
                                            <div key={album.id} className="carousel-item">
                                                <div className="home-carousel-card">
                                                    <div className="carousel-image-bg" style={{ backgroundImage: `url(${album.capa_url || album.capa})`}}></div>
                                                    
                                                    <div className="carousel-content">
                                                        <h3>{album.titulo}</h3>
                                                        <div className="carousel-meta-text">
                                                            {album.data_evento && (<span>{new Date(album.data_evento).toLocaleDateString()}</span>)}
                                                            {album.fotografo && (<span>{album.fotografo}</span>)}
                                                        </div>
                                                        {album.descricao && (
                                                            <p className="carousel-desc-text">{album.descricao}</p>
                                                        )}
                                                        <Link to={`/album/${album.id}`} className="carousel-action-btn">
                                                            Ver Fotos do Álbum
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="carousel-dots">
                                        {latestAlbuns.map((_, index) => (
                                            <span key={index} onClick={() => setCurrentAlbumIndex(index)} className={`carousel-dot ${currentAlbumIndex === index ? 'active' : ''}`}></span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="loading-text">Nenhum álbum encontrado.</p>
                            )}
                        </div>
                    )}
                </section>

                {/* COLUNA 2: ÚLTIMAS NOTÍCIAS */}
                <section className="split-section">
                    <h2 className="split-section-title">Últimas Notícias</h2>
                    
                    <div 
                        className="carousel-container"
                        onMouseDown={() => setIsPausedNews(true)}
                        onMouseUp={() => setIsPausedNews(false)}
                        onMouseLeave={() => setIsPausedNews(false)}
                        onTouchStart={() => setIsPausedNews(true)}
                        onTouchEnd={() => setIsPausedNews(false)}
                    >
                        <button onClick={prevNews} className="side-nav-btn left" title="Anterior">&#10094;</button>
                        <button onClick={nextNews} className="side-nav-btn right" title="Próximo">&#10095;</button>

                        <div className="carousel-track" style={{ transform: `translateX(-${currentNewsIndex * 100}%)` }}>
                            {latestNews.map(noticia => {
                                const imagemUrl = noticia._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/capa-padrao.jpg';
                                const resumoHtml = noticia.excerpt?.rendered || '';
                                
                                return (
                                    <div key={noticia.id} className="carousel-item">
                                        <div className="home-carousel-card">
                                            <div className="carousel-image-bg" style={{ backgroundImage: `url(${imagemUrl})`, backgroundSize: 'cover' }}></div>
                                            <div className="carousel-content">
                                                <h3 dangerouslySetInnerHTML={{ __html: noticia.title.rendered }}></h3>
                                                <div className="carousel-meta-row">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="news-icon">
                                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                    </svg>
                                                    <div className="carousel-desc-text" dangerouslySetInnerHTML={{ __html: resumoHtml }}></div>
                                                </div>
                                                <Link to={`/noticias/${noticia.slug}`} className="carousel-action-btn">
                                                    Ler notícia completa
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="carousel-dots">
                            {latestNews.map((_, index) => (
                                <span key={index} onClick={() => setCurrentNewsIndex(index)} className={`carousel-dot ${currentNewsIndex === index ? 'active' : ''}`}></span>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* --- SEÇÃO AVALIAÇÕES --- */}
            {avaliacoes.length > 0 && (
                <section className="avaliacoes-section">
                    <div className="avaliacoes-header">
                        <h2 className="avaliacoes-title">O que dizem sobre nós</h2>
                        <p className="avaliacoes-subtitle">Avaliações verificadas de clientes Acesso Imagens no Google</p>
                    </div>
                    
                    <div 
                        className="avaliacoes-carousel-container"
                        onMouseDown={() => setIsPausedAvaliacoes(true)}
                        onMouseUp={() => setIsPausedAvaliacoes(false)}
                        onMouseLeave={() => setIsPausedAvaliacoes(false)}
                        onTouchStart={() => setIsPausedAvaliacoes(true)}
                        onTouchEnd={() => setIsPausedAvaliacoes(false)}
                    >
                        <button onClick={prevReview} className="side-nav-btn left" title="Anterior">&#10094;</button>
                        <button onClick={nextReview} className="side-nav-btn right" title="Próximo">&#10095;</button>

                        <div className="carousel-track" style={{ transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)', transform: `translateX(-${currentAvaliacaoIndex * 100}%)` }}>
                            {avaliacoes.map((review) => (
                                <div key={review.id} className="carousel-item">
                                    <div className="avaliacao-card-inner">
                                        <div className="avaliacao-estrelas">
                                            {'★'.repeat(review.estrelas)}{'☆'.repeat(5 - review.estrelas)}
                                        </div>
                                        <p className="avaliacao-texto">"{review.texto}"</p>
                                        <div className="avaliacao-autor-container">
                                            <div className="avaliacao-avatar">
                                                {review.autor.charAt(0)}
                                            </div>
                                            <div className="avaliacao-autor-info">
                                                <h4 className="avaliacao-autor">{review.autor}</h4>
                                                <span className="avaliacao-papel">{review.papel}</span>
                                            </div>
                                        </div>
                                        <div className="avaliacao-google-badge">
                                            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Avaliação Google
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="carousel-dots">
                            {avaliacoes.map((_, index) => (
                                <span key={index} onClick={() => setCurrentAvaliacaoIndex(index)} className={`carousel-dot ${currentAvaliacaoIndex === index ? 'active' : ''}`}></span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* --- BANNER DE PUBLICIDADE --- */}
            {banners.length > 0 && (
                <section className="banner-section" style={{ marginTop: '3rem', position: 'relative' }}>
                    <div 
                        className="banner-rotativo" 
                        onMouseDown={() => setIsPausedBanner(true)}
                        onMouseUp={() => setIsPausedBanner(false)}
                        onMouseLeave={() => setIsPausedBanner(false)}
                        onTouchStart={() => setIsPausedBanner(true)}
                        onTouchEnd={() => setIsPausedBanner(false)}
                    >
                        {banners.length > 1 && (
                            <>
                                <button onClick={goToPreviousBanner} className="side-nav-btn left" style={{zIndex: 20}} title="Anterior">&#10094;</button>
                                <button onClick={goToNextBanner} className="side-nav-btn right" style={{zIndex: 20}} title="Próximo">&#10095;</button>
                            </>
                        )}

                        <div className="banner-slides-wrapper" style={{ transform: `translateX(-${currentBannerIndex * 100}%)`}}>
                            {banners.map(banner => (
                                <div key={banner.id} className="banner-slide">
                                    <a href={banner.link} target="_blank" rel="noopener noreferrer">
                                        {renderBannerContent(banner)}
                                    </a>
                                </div>
                            ))}
                        </div>
                        
                        {banners.length > 1 && (
                            <div className="banner-dots" style={{ paddingBottom: '15px' }}>
                                {banners.map((_, index) => (
                                    <span key={index} className={`dot ${currentBannerIndex === index ? 'active' : ''}`} onClick={() => setCurrentBannerIndex(index)}></span>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

export default HomePage;