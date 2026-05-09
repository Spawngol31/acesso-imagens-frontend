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

    if (loading) return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar...</p>;
    if (!noticia) return <p style={{textAlign: 'center', marginTop: '2rem'}}>Notícia não encontrada.</p>;

    // Atalho para facilitar a leitura da imagem de destaque
    const featuredMedia = noticia._embedded?.['wp:featuredmedia']?.[0];

    return (
        <div className="page-container">
            <div className="news-detail-container">
                <header className="news-header">
                    <h1 dangerouslySetInnerHTML={{ __html: noticia.title.rendered }} style={{ color: '#6c0464' }} />
                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
                        Publicado em {new Date(noticia.date).toLocaleDateString()}
                    </p>
                    
                    {/* 🚀 IMAGEM DE DESTAQUE COM CRÉDITOS */}
                    {featuredMedia?.source_url && (
                        <div style={{ marginBottom: '30px' }}>
                            <img 
                                src={featuredMedia.source_url} 
                                alt={noticia.title.rendered} 
                                className="news-featured-image" 
                                style={{ width: '100%', borderRadius: '8px', display: 'block' }}
                            />
                            {/* Puxa a legenda (créditos) direto do WordPress */}
                            {featuredMedia.caption?.rendered && (
                                <div 
                                    className="image-credits"
                                    style={{ fontSize: '13px', color: '#888', textAlign: 'right', marginTop: '8px', fontStyle: 'italic' }}
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

                <div className="back-link-wrapper" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <Link to="/noticias" className="button-outline">Voltar para Notícias</Link>
                </div>
            </div>
        </div>
    );
}

export default NewsDetailPage;