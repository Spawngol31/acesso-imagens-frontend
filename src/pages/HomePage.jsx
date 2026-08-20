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
    
    // Estados dos Índices dos Carrosséis
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0); 
    const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0); 
    const [currentAvaliacaoIndex, setCurrentAvaliacaoIndex] = useState(0); 

    // Estados de Pausa dos Carrosséis
    const [isPausedBanner, setIsPausedBanner] = useState(false);
    const [isPausedAlbuns, setIsPausedAlbuns] = useState(false);
    const [isPausedNews, setIsPausedNews] = useState(false);
    const [isPausedAvaliacoes, setIsPausedAvaliacoes] = useState(false);
    
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
                // Busca de Álbuns
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

                // Busca de Notícias
                try {
                    const wpUrl = 'https://portal.acessoimagens.com.br/wp-json/wp/v2/posts?_embed&per_page=4';
                    const newsResponse = await axios.get(wpUrl);
                    setLatestNews(newsResponse.data);
                } catch (error) {
                    console.error("Erro ao buscar notícias do WP:", error);
                }

                // Busca das Avaliações
                try {
                    const avResponse = await axiosInstance.get('/avaliacoes/destaques/');
                    const dadosAvaliacoes = avResponse.data.results || avResponse.data;
                    if(dadosAvaliacoes && dadosAvaliacoes.length > 0) {
                        setAvaliacoes(dadosAvaliacoes);
                    }
                } catch (error) {
                    console.error("Erro ao buscar avaliações da API:", error);
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
            const timer = setInterval(() => {
                setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
            }, 8000); 
            return () => clearInterval(timer);
        }
    }, [isPausedBanner]);

    useEffect(() => {
        if (latestNews.length > 1 && !isPausedNews) {
            const timer = setInterval(() => {
                setCurrentNewsIndex(prevIndex => (prevIndex + 1) % latestNews.length);
            }, 5000); 
            return () => clearInterval(timer);
        }
    }, [latestNews.length, isPausedNews]);

    useEffect(() => {
        if (latestAlbuns.length > 1 && !isPausedAlbuns) {
            const timer = setInterval(() => {
                setCurrentAlbumIndex(prevIndex => (prevIndex + 1) % latestAlbuns.length);
            }, 6000); 
            return () => clearInterval(timer);
        }
    }, [latestAlbuns.length, isPausedAlbuns]);

    useEffect(() => {
        if (avaliacoes.length > 1 && !isPausedAvaliacoes) {
            const timer = setInterval(() => {
                setCurrentAvaliacaoIndex(prevIndex => (prevIndex + 1) % avaliacoes.length);
            }, 7000); 
            return () => clearInterval(timer);
        }
    }, [avaliacoes.length, isPausedAvaliacoes]);

    // --- FUNÇÕES DE NAVEGAÇÃO DOS CARROSSÉIS ---

    const goToPreviousBanner = () => setCurrentBannerIndex(prev => (prev - 1 + banners.length) % banners.length);
    const goToNextBanner = () => setCurrentBannerIndex(prev => (prev + 1) % banners.length);

    const prevAlbum = () => setCurrentAlbumIndex(prev => (prev - 1 + latestAlbuns.length) % latestAlbuns.length);
    const nextAlbum = () => setCurrentAlbumIndex(prev => (prev + 1) % latestAlbuns.length);

    const prevNews = () => setCurrentNewsIndex(prev => (prev - 1 + latestNews.length) % latestNews.length);
    const nextNews = () => setCurrentNewsIndex(prev => (prev + 1) % latestNews.length);

    const prevReview = () => setCurrentAvaliacaoIndex(prev => (prev - 1 + avaliacoes.length) % avaliacoes.length);
    const nextReview = () => setCurrentAvaliacaoIndex(prev => (prev + 1) % avaliacoes.length);

    // ------------------------------------------

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
            <section className="home-hero-section hero-section">
                <div className="home-hero-overlay">
                    
                    <h1 className="home-hero-title">
                        Encontre suas fotos
                    </h1>
                    
                    <div className="home-hero-search-container">
                        
                        <form onSubmit={handleSearchSubmit} className="search-bar-wrapper" style={{ width: '100%' }}>
                            <span style={{ color: '#b0b0b0', fontSize: '1.2rem', marginRight: '10px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Pesquise por álbuns..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                style={{color: '#6d6d6d', width: '100%'}}
                            />
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '15px', margin: '15px 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }}></div>
                            <span style={{ color: 'white', fontSize: '16px', fontWeight: '500', textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
                                ou
                            </span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }}></div>
                        </div>

                        <div onClick={() => navigate('/busca')} className="selfie-card" style={{ width: '100%', margin: 0 }}>
                            
                            <div className="selfie-text-container" style={{ flex: 1 }}>
                                <h3 style={{textAlign: 'center'}}>Encontre suas fotos com uma selfie</h3>
                            </div>
                            <div style={{ color: '#313b53', fontSize: '1.5rem', marginLeft: '10px' }}>
                                &rarr;
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/*          SEÇÃO CHAMADA PARA AÇÃO (SOLUÇÕES)               */}
            {/* ========================================================= */}
            <section style={{ margin: '5rem 20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1000px',
                    textAlign: 'center',
                }}>
                    <h2 style={{ 
                        color: '#2b2b2b', 
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
                        fontWeight: '800', 
                        margin: '0 0 20px 0', 
                        letterSpacing: '-1px' 
                    }}>
                        <span style={{ color: corPrincipal }}>Agência de Comunicação</span> 360° no futebol
                    </h2>
                    <p style={{ 
                        color: '#888', 
                        fontSize: 'clamp(1rem, 2vw, 1.15rem)', 
                        fontWeight: '300', 
                        maxWidth: '850px', 
                        margin: '0 auto 40px auto', 
                        lineHeight: '1.7' 
                    }}>
                        Atuamos ao lado de clubes, atletas profissionais e staffs técnicos para construir imagem, fortalecer marcas e desenvolver uma comunicação estratégica dentro e fora de campo.
                    </p>
                    
                    <Link to="/solucoes" className="cta-solucoes-btn">
                        Conheça nossos serviços &rarr;
                    </Link>
                </div>
            </section>

            {/* ========================================================= */}
            {/*        CONTAINER LADO A LADO (ÁLBUNS + NOTÍCIAS)          */}
            {/* ========================================================= */}
            <div className="home-split-layout">
                
                {/* COLUNA 1: ÚLTIMOS ÁLBUNS */}
                <section className="split-section">
                    <h2 className="split-section-title">Últimos álbuns</h2>
                    
                    {loading ? <p style={{textAlign: 'center'}}>A carregar...</p> : (
                        <div 
                            style={{ width: '100%', maxWidth: '500px', margin: '0 auto', overflow: 'hidden', position: 'relative', paddingBottom: '20px' }}
                            /* Eventos para Pausar e Dar Play */
                            onMouseDown={() => setIsPausedAlbuns(true)}
                            onMouseUp={() => setIsPausedAlbuns(false)}
                            onMouseLeave={() => setIsPausedAlbuns(false)} // Previne que fique travado se o rato sair
                            onTouchStart={() => setIsPausedAlbuns(true)}
                            onTouchEnd={() => setIsPausedAlbuns(false)}
                        >
                            {latestAlbuns.length > 0 ? (
                                <>
                                    {/* Setas Laterais de Navegação */}
                                    <button onClick={prevAlbum} className="side-nav-btn left" title="Anterior">&#10094;</button>
                                    <button onClick={nextAlbum} className="side-nav-btn right" title="Próximo">&#10095;</button>

                                    <div style={{ display: 'flex', transition: 'transform 0.5s ease-in-out', transform: `translateX(-${currentAlbumIndex * 100}%)` }}>
                                        {latestAlbuns.map(album => (
                                            <div key={album.id} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '10px' }}>
                                                <div className="album-card" style={{ minHeight: '630px', height: '100%', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ width: '100%', height: '350px', flexShrink: 0, backgroundImage: `url(${album.capa_url || album.capa})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fdfbfe' }}></div>
                                                    
                                                    <div style={{ padding: '25px 20px 30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1, boxSizing: 'border-box' }}>
                                                        <h3 style={{ color: corPrincipal, margin: '0 0 10px 0', fontSize: '1.4rem', lineHeight: '1.3' }}>{album.titulo}</h3>
                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', color: '#888', fontSize: '0.85rem', marginBottom: '12px' }}>
                                                            {album.data_evento && (<span>{new Date(album.data_evento).toLocaleDateString()}</span>)}
                                                            {album.fotografo && (<span>{album.fotografo}</span>)}
                                                        </div>
                                                        {album.descricao && (
                                                            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 15px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {album.descricao}
                                                            </p>
                                                        )}
                                                        <Link to={`/album/${album.id}`} style={{ marginTop: 'auto', display: 'inline-block', backgroundColor: corPrincipal, color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', transition: '0.2s', width: '100%', boxSizing: 'border-box' }}>
                                                            Ver Fotos do Álbum
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Apenas os Dots Inferiores (Sem o botão de Play/Pause) */}
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                                        {latestAlbuns.map((_, index) => (
                                            <span key={index} onClick={() => setCurrentAlbumIndex(index)} style={{ width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s', backgroundColor: currentAlbumIndex === index ? corPrincipal : '#ccc' }}></span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p style={{textAlign: 'center', width: '100%'}}>Nenhum álbum encontrado.</p>
                            )}
                        </div>
                    )}
                </section>

                {/* COLUNA 2: ÚLTIMAS NOTÍCIAS */}
                <section className="split-section">
                    <h2 className="split-section-title">Últimas Notícias</h2>
                    
                    <div 
                        style={{ width: '100%', maxWidth: '500px', margin: '0 auto', overflow: 'hidden', position: 'relative', paddingBottom: '20px' }}
                        /* Eventos para Pausar e Dar Play */
                        onMouseDown={() => setIsPausedNews(true)}
                        onMouseUp={() => setIsPausedNews(false)}
                        onMouseLeave={() => setIsPausedNews(false)}
                        onTouchStart={() => setIsPausedNews(true)}
                        onTouchEnd={() => setIsPausedNews(false)}
                    >
                        {/* Setas Laterais de Navegação */}
                        <button onClick={prevNews} className="side-nav-btn left" title="Anterior">&#10094;</button>
                        <button onClick={nextNews} className="side-nav-btn right" title="Próximo">&#10095;</button>

                        <div style={{ display: 'flex', transition: 'transform 0.5s ease-in-out', transform: `translateX(-${currentNewsIndex * 100}%)` }}>
                            {latestNews.map(noticia => {
                                const imagemUrl = noticia._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/capa-padrao.jpg';
                                const resumoHtml = noticia.excerpt?.rendered || '';
                                
                                return (
                                    <div key={noticia.id} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '10px' }}>
                                        <div className="album-card" style={{ minHeight: '600px', height: '100%', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ width: '100%', height: '350px', flexShrink: 0, backgroundImage: `url(${imagemUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                            <div style={{ padding: '25px 20px 30px 20px', display: 'flex', flexDirection: 'column', flex: 1, boxSizing: 'border-box' }}>
                                                <h3 style={{ color: corPrincipal, margin: '0 0 15px 0', fontSize: '1.3rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: noticia.title.rendered }}></h3>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '15px', flex: 1, overflow: 'hidden' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={corPrincipal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                    </svg>
                                                    <div style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: resumoHtml }}></div>
                                                </div>
                                                <Link to={`/noticias/${noticia.slug}`} style={{ marginTop: 'auto', display: 'block', textAlign: 'center', backgroundColor: corPrincipal, color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', transition: '0.2s', width: '100%', boxSizing: 'border-box' }}>
                                                    Ler notícia completa
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Dots Inferiores */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                            {latestNews.map((_, index) => (
                                <span key={index} onClick={() => setCurrentNewsIndex(index)} style={{ width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s', backgroundColor: currentNewsIndex === index ? corPrincipal : '#ccc' }}></span>
                            ))}
                        </div>

                    </div>
                </section>
            </div>


            {/* ========================================================= */}
            {/*        SEÇÃO DE AVALIAÇÕES (GOOGLE REVIEWS - REAIS)       */}
            {/* ========================================================= */}
            {avaliacoes.length > 0 && (
                <section style={{ marginTop: '5rem', marginBottom: '2rem', padding: '0 20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#333', margin: '0 0 10px 0' }}>
                            O que dizem sobre nós
                        </h2>
                        <p style={{ color: '#888', fontSize: '1.1rem', margin: 0 }}>
                            Avaliações verificadas de clientes Acesso Imagens no Google
                        </p>
                    </div>
                    
                    <div 
                        style={{ width: '100%', maxWidth: '820px', margin: '0 auto', overflow: 'hidden', position: 'relative', paddingBottom: '30px' }}
                        /* Eventos para Pausar e Dar Play */
                        onMouseDown={() => setIsPausedAvaliacoes(true)}
                        onMouseUp={() => setIsPausedAvaliacoes(false)}
                        onMouseLeave={() => setIsPausedAvaliacoes(false)}
                        onTouchStart={() => setIsPausedAvaliacoes(true)}
                        onTouchEnd={() => setIsPausedAvaliacoes(false)}
                    >
                        
                        {/* Setas Laterais de Navegação */}
                        <button onClick={prevReview} className="side-nav-btn left" title="Anterior">&#10094;</button>
                        <button onClick={nextReview} className="side-nav-btn right" title="Próximo">&#10095;</button>

                        <div style={{ display: 'flex', transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)', transform: `translateX(-${currentAvaliacaoIndex * 100}%)` }}>
                            {avaliacoes.map((review) => (
                                <div key={review.id} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '10px' }}>
                                    <div className="album-card" style={{ borderRadius: '20px', padding: '40px 30px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '20px', fontSize: '1.4rem', color: '#FFD700' }}>
                                            {'★'.repeat(review.estrelas)}{'☆'.repeat(5 - review.estrelas)}
                                        </div>
                                        <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: '#444', fontStyle: 'italic', marginBottom: '30px', lineHeight: '1.6' }}>
                                            "{review.texto}"
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: corPrincipal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {review.autor.charAt(0)}
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '1.1rem' }}>{review.autor}</h4>
                                                <span style={{ fontSize: '0.9rem', color: '#888' }}>{review.papel}</span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Avaliação Google
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Dots Inferiores */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                            {avaliacoes.map((_, index) => (
                                <span key={index} onClick={() => setCurrentAvaliacaoIndex(index)} style={{ width: '12px', height: '12px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s', backgroundColor: currentAvaliacaoIndex === index ? corPrincipal : '#ddd' }}></span>
                            ))}
                        </div>
                    </div>
                </section>
            )}


            {/* SEÇÃO 3: BANNER DE PUBLICIDADE */}
            {banners.length > 0 && (
                <section className="banner-section" style={{ marginTop: '3rem', position: 'relative' }}>
                    <div 
                        className="banner-rotativo" 
                        style={{ overflow: 'hidden', position: 'relative' }}
                        /* Eventos para Pausar e Dar Play */
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

                        <div className="banner-slides-wrapper" style={{ transform: `translateX(-${currentBannerIndex * 100}%)`, display: 'flex', transition: 'transform 0.5s ease-in-out' }}>
                            {banners.map(banner => (
                                <div key={banner.id} className="banner-slide" style={{ minWidth: '100%' }}>
                                    <a href={banner.link} target="_blank" rel="noopener noreferrer">
                                        {renderBannerContent(banner)}
                                    </a>
                                </div>
                            ))}
                        </div>
                        
                        {banners.length > 1 && (
                            <div className="banner-dots" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px', paddingBottom: '15px' }}>
                                {banners.map((_, index) => (
                                    <span key={index} className={`dot ${currentBannerIndex === index ? 'active' : ''}`} onClick={() => setCurrentBannerIndex(index)} style={{ width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s', backgroundColor: currentBannerIndex === index ? corPrincipal : '#ccc' }}></span>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* --- ESTILOS CSS INJETADOS --- */}
            <style>{`
                /* Corrige o comportamento da Capa da Home */
                .home-hero-section {
                    width: 100%;
                    height: auto !important; 
                    min-height: 70vh; 
                    display: flex;
                }

                .home-hero-overlay {
                    width: 100%;
                    height: 100%;
                    min-height: 70vh;
                    background-color: rgba(0, 0, 0, 0.5); 
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 80px 20px; 
                    box-sizing: border-box;
                }

                .home-hero-title {
                    color: #fff;
                    text-align: center;
                    font-size: clamp(2rem, 5vw, 3.5rem);
                    text-shadow: 2px 2px 8px rgba(0,0,0,0.6);
                    margin: 0 0 20px 0;
                    font-weight: 800;
                }

                .home-hero-search-container {
                    width: 100%;
                    max-width: 600px; 
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .cta-solucoes-btn {
                    display: inline-block;
                    background-color: #6c0464;
                    color: white;
                    padding: 15px 40px;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    border: 2px solid #6c0464;
                    box-shadow: 0 4px 15px rgba(108, 4, 100, 0.2);
                }
                .cta-solucoes-btn:hover {
                    background-color: transparent;
                    color: #6c0464; 
                    border-color: #6c0464;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(108, 4, 100, 0.15);
                }

                .home-split-layout {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: flex-start;
                    gap: 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .split-section {
                    flex: 1; 
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .split-section-title {
                    align-self: center;
                    font-size: 2rem;
                    margin-bottom: 30px;
                    color: #333;
                }

                /* --- ESTILOS DAS SETAS LATERAIS TIPO LIGHTBOX --- */
                .side-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    cursor: pointer;
                    z-index: 10;
                    transition: background-color 0.3s, transform 0.2s;
                    
                }
                .side-nav-btn:hover {
                    background-color: #6c046305;
                    transform: translateY(-50%) scale(1.1);
                    border: 1px;
                }
                .side-nav-btn.left {
                    left: 10px;
                }
                .side-nav-btn.right {
                    right: 10px;
                }

                @media (max-width: 900px) {
                    .home-split-layout {
                        flex-direction: column;
                        gap: 10px;
                    }
                }
            `}</style>
            
        </div>
    );
}

export default HomePage;