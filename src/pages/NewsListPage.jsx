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
  }, [currentPage]); // O useEffect roda de novo sempre que a currentPage mudar!

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="page-container">
      <h1>Notícias</h1>
      
      {loading ? (
        <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar notícias...</p>
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
                  <p style={{color: '#555', fontSize: '0.8rem', marginTop: '0.25rem'}}>
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
            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '50px', marginBottom: '20px' }}>
              
              {/* Botão Voltar (<) só aparece se não estivermos na página 1 */}
              {currentPage > 1 && (
                <button onClick={() => handlePageChange(currentPage - 1)} className="pagination-arrow">
                  &lt;
                </button>
              )}

              {/* Gera os números das páginas */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page} 
                  onClick={() => handlePageChange(page)}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}

              {/* Botão Avançar (>) só aparece se não estivermos na última página */}
              {currentPage < totalPages && (
                <button onClick={() => handlePageChange(currentPage + 1)} className="pagination-arrow">
                  &gt;
                </button>
              )}
            </div>
          )}

          {/* ESTILOS CSS INJETADOS SÓ PARA A PAGINAÇÃO DESTA PÁGINA */}
          <style>{`
            .pagination-number {
              background: transparent;
              border: none;
              color: #555;
              font-size: 1.1rem;
              font-weight: 500;
              cursor: pointer;
              width: 40px;
              height: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 8px; /* Arredondado igual à foto */
              transition: all 0.2s ease;
            }

            .pagination-number:hover {
              color: #a40b99;
            }

            /* Estilo para a página atual (O botão Roxo) */
            .pagination-number.active {
              background-color: #a40b99; /* Cor roxa da sua imagem */
              color: white;
              font-weight: bold;
            }

            .pagination-arrow {
              background: transparent;
              border: none;
              color: #a40b99; /* Cor roxa da sua imagem */
              font-size: 1.2rem;
              font-weight: bold;
              cursor: pointer;
              padding: 0 10px;
              transition: transform 0.2s ease;
            }

            .pagination-arrow:hover {
              transform: scale(1.2);
            }
          `}</style>
          
        </>
      )}
    </div>
  );
}

export default NewsListPage;