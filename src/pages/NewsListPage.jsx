// src/pages/NewsListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Usamos o axios base, pois é um domínio diferente

const WP_API_URL = `${import.meta.env.VITE_WP_API_URL}/posts?_embed`;

function NewsListPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        const response = await axios.get(WP_API_URL);
        setNoticias(response.data);
      } catch (error) {
        console.error("Erro ao buscar notícias do WordPress:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, []);

  if (loading) return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar notícias...</p>;

  return (
    <div className="page-container">
      <h1>Notícias</h1>
      <div className='album-grid'>
        {noticias.map(noticia => (
          <Link to={`/noticias/${noticia.slug}`} key={noticia.id} className="album-card">
            <div 
              className="album-card-image"
              style={{ 
                backgroundImage: `url(${noticia._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/default-image.png'})` 
              }}
            ></div>
            <div className="album-card-info">
              <h3 dangerouslySetInnerHTML={{ __html: noticia.title.rendered }} />
              <p style={{color: '#555', fontSize: '0.8rem', marginTop: '0.25rem'}}>
                {new Date(noticia.date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
export default NewsListPage;