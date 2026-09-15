// src/pages/NewsDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const WP_API_URL = import.meta.env.VITE_WP_API_URL;

function NewsDetailPage() {
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const { slug } = useParams();

    useEffect(() => {
        const fetchNoticia = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${WP_API_URL}/posts?slug=${slug}&_embed`);
                setNoticia(response.data[0]);
            } catch (error) {
                console.error("Erro ao buscar a notícia:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNoticia();
    }, [slug]);

    if (loading) return <p className="page-subtitle" style={{textAlign: 'center', marginTop: '2rem'}}>A carregar...</p>;
    if (!noticia) return <p className="page-subtitle" style={{textAlign: 'center', marginTop: '2rem'}}>Notícia não encontrada.</p>;

    // Atalho para facilitar a leitura da imagem de destaque
    const featuredMedia = noticia._embedded?.['wp:featuredmedia']?.[0];

    return (
        <div className="page-container">
            <div className="news-detail-container">
                <header className="news-header">
                    <h1 className="news-detail-title" dangerouslySetInnerHTML={{ __html: noticia.title.rendered }} />
                    <p className="news-detail-date">
                        Publicado em {new Date(noticia.date).toLocaleDateString()}
                    </p>
                    
                    {/* 🚀 IMAGEM DE DESTAQUE COM CRÉDITOS */}
                    {featuredMedia?.source_url && (
                        <div style={{ marginBottom: '30px' }}>
                            <img 
                                src={featuredMedia.source_url} 
                                alt={noticia.title.rendered} 
                                className="news-featured-image" 
                            />
                            {/* Puxa a legenda (créditos) direto do WordPress */}
                            {featuredMedia.caption?.rendered && (
                                <div 
                                    className="image-credits"
                                    dangerouslySetInnerHTML={{ __html: featuredMedia.caption.rendered }} 
                                />
                            )}
                        </div>
                    )}
                </header>

                <div 
                    className="news-content"
                    dangerouslySetInnerHTML={{ __html: noticia.content.rendered }} 
                />

                <div className="back-link-wrapper">
                    <Link to="/noticias" className="button-outline">Voltar para Notícias</Link>
                </div>
            </div>
        </div>
    );
}

export default NewsDetailPage;