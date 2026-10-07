// src/pages/NewsListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; 

const BASE_URL = import.meta.env.VITE_WP_API_URL || '';
const WP_API_URL = `${BASE_URL.replace(/\/$/, '')}/posts?_embed`;

function NewsListPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DA PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const POSTS_PER_PAGE = 20;

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        // Adicionamos os parâmetros per_page e page na chamada à API do WordPress
        const response = await axios.get(`${WP_API_URL}&per_page=${POSTS_PER_PAGE}&page=${currentPage}`);
        
        setNoticias(response.data);
        
        // O WordPress envia o total de páginas neste cabeçalho (header) oculto
        const totalPagesHeader = response.headers['x-wp-totalpages'];
        if (totalPagesHeader) {
          setTotalPages(parseInt(totalPagesHeader, 10));
        }
        
        // Rola a página para o topo sempre que mudar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } catch (error) {
        console.error("Erro ao buscar notícias do WordPress:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, [currentPage]); 

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Notícias</h1>
      
      {loading ? (
        <p className="page-subtitle" style={{textAlign: 'center', marginTop: '2rem'}}>A carregar notícias...</p>
      ) : (
        <>
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
                  <p className="news-date-text">
                    {new Date(noticia.date).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* ========================================================= */}
          {/*           PAGINAÇÃO ESTILIZADA (Igual à imagem)           */}
          {/* ========================================================= */}
          {totalPages > 1 && (
            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem', padding: '1rem' }}>
              
              {/* Botão Voltar (<) - Sempre visível, mas desabilitado na página 1 */}
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-nav-btn"
                style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                &lt;
              </button>

              {/* Gera os números das páginas com o mesmo estilo do AlbumList */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page} 
                  onClick={() => handlePageChange(page)}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  style={{
                      width: '40px', height: '40px', border: 'none', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: currentPage === page ? 'bold' : 'normal',
                      fontSize: '1rem', transition: 'all 0.2s'
                  }}
                >
                  {page}
                </button>
              ))}

              {/* Botão Avançar (>) - Sempre visível, mas desabilitado na última página */}
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-nav-btn"
                style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NewsListPage;