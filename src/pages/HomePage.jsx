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
    const [loading, setLoading] = useState(true);
    
    // Estados dos Carrosséis
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0); 
    const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0); 
    
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Cor temática do site
    const corPrincipal = '#6c0464'; 

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

            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Auto-play do Banner (8 segundos)
    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
            }, 8000); 
            return () => clearInterval(timer);
        }
    }, []);

    // Auto-play das Notícias (Muda a cada 5 segundos)
    useEffect(() => {
        if (latestNews.length > 1) {
            const timer = setInterval(() => {
                setCurrentNewsIndex(prevIndex => (prevIndex + 1) % latestNews.length);
            }, 5000); 
            return () => clearInterval(timer);
        }
    }, [latestNews.length]);

    // Auto-play dos Álbuns (Muda a cada 6 segundos)
    useEffect(() => {
        if (latestAlbuns.length > 1) {
            const timer = setInterval(() => {
                setCurrentAlbumIndex(prevIndex => (prevIndex + 1) % latestAlbuns.length);
            }, 6000); 
            return () => clearInterval(timer);
        }
    }, [latestAlbuns.length]);

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

            {/* SEÇÃO 1: ÚLTIMOS ÁLBUNS (CARROSSEL) */}
            <section className="category-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
                
                {/* --- TÍTULO CENTRALIZADO E MAIOR --- */}
                <h2 style={{ alignSelf: 'center', fontSize: '2rem', marginBottom: '30px', color: '#333' }}>🎞️ Últimos álbuns</h2>
                
                {loading ? <p style={{textAlign: 'center'}}>A carregar...</p> : (
                    <div style={{ width: '100%', maxWidth: '600px', overflow: 'hidden', position: 'relative', paddingBottom: '20px' }}>
                        {latestAlbuns.length > 0 ? (
                            <>
                                {/* Container Deslizante */}
                                <div style={{ display: 'flex', transition: 'transform 0.5s ease-in-out', transform: `translateX(-${currentAlbumIndex * 100}%)` }}>
                                    {latestAlbuns.map(album => (
                                        <div key={album.id} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '10px' }}>
                                            <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
                                                
                                                {/* Imagem Arredondada do Álbum */}
                                                <div style={{ width: '100%', height: '480px', backgroundImage: `url(${album.capa_url || album.capa})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fdfbfe' }}></div>
                                                
                                                {/* Conteúdo do Card do Álbum */}
                                                <div style={{ padding: '25px 20px', textAlign: 'center' }}>
                                                    <h3 style={{ color: corPrincipal, margin: '0 0 15px 0', fontSize: '1.4rem', lineHeight: '1.3' }}>{album.titulo}</h3>
                                                    
                                                    {/* Botão Largo */}
                                                    <Link to={`/album/${album.id}`} style={{ display: 'inline-block', backgroundColor: corPrincipal, color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', transition: '0.2s', width: '100%', boxSizing: 'border-box' }}>
                                                        Ver Fotos do Álbum
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Pontinhos de Navegação (Dots) dos Álbuns */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
                                    {latestAlbuns.map((_, index) => (
                                        <span 
                                            key={index} 
                                            onClick={() => setCurrentAlbumIndex(index)}
                                            style={{ 
                                                width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s',
                                                backgroundColor: currentAlbumIndex === index ? corPrincipal : '#ccc' 
                                            }}
                                        ></span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p style={{textAlign: 'center', width: '100%'}}>Nenhum álbum encontrado.</p>
                        )}
                    </div>
                )}
            </section>

            {/* SEÇÃO 2: ÚLTIMAS NOTÍCIAS (CARROSSEL) */}
            {!loading && latestNews.length > 0 && (
                <section className="category-section" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
                    
                    {/* --- TÍTULO CENTRALIZADO E MAIOR --- */}
                    <h2 style={{ alignSelf: 'center', fontSize: '2rem', marginBottom: '30px', color: '#333' }}>📰 Últimas Notícias</h2>
                    
                    <div style={{ width: '100%', maxWidth: '600px', overflow: 'hidden', position: 'relative', paddingBottom: '20px' }}>
                        
                        {/* Container Deslizante */}
                        <div style={{ display: 'flex', transition: 'transform 0.5s ease-in-out', transform: `translateX(-${currentNewsIndex * 100}%)` }}>
                            
                            {latestNews.map(noticia => {
                                const imagemUrl = noticia._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/capa-padrao.jpg';
                                const resumoHtml = noticia.excerpt?.rendered || '';
                                
                                return (
                                    <div key={noticia.id} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '10px' }}>
                                        <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
                                            
                                            {/* Imagem Arredondada */}
                                            <div style={{ width: '100%', height: '480px', backgroundImage: `url(${imagemUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                            
                                            {/* Conteúdo do Card */}
                                            <div style={{ padding: '25px 20px' }}>
                                                {/* Título Roxo */}
                                                <h3 style={{ color: corPrincipal, margin: '0 0 15px 0', fontSize: '1.4rem', lineHeight: '1.3' }} dangerouslySetInnerHTML={{ __html: noticia.title.rendered }}></h3>
                                                
                                                {/* Resumo com Ícone de Balão */}
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '25px' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={corPrincipal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                    </svg>
                                                    <div 
                                                        style={{ color: '#555', fontSize: '1rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} 
                                                        dangerouslySetInnerHTML={{ __html: resumoHtml }}
                                                    ></div>
                                                </div>
                                                
                                                {/* Botão Largo */}
                                                <Link to={`/noticias/${noticia.slug}`} style={{ display: 'block', textAlign: 'center', backgroundColor: corPrincipal, color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', transition: '0.2s', width: '100%', boxSizing: 'border-box' }}>
                                                    Ler notícia completa
                                                </Link>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Pontinhos de Navegação (Dots) das Notícias */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
                            {latestNews.map((_, index) => (
                                <span 
                                    key={index} 
                                    onClick={() => setCurrentNewsIndex(index)}
                                    style={{ 
                                        width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s',
                                        backgroundColor: currentNewsIndex === index ? corPrincipal : '#ccc' 
                                    }}
                                ></span>
                            ))}
                        </div>

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