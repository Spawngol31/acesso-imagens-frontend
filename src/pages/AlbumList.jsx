// src/pages/AlbumList.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import axiosInstance from '../api/axiosInstance';

// --- COMPONENTE DE PAGINAÇÃO NUMÉRICA (ADAPTADO AO DARK MODE) ---
const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPaginationRange = () => {
        const delta = 1;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        if (currentPage - delta > 2) range.unshift("...");
        if (currentPage + delta < totalPages - 1) range.push("...");

        range.unshift(1);
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    const pages = getPaginationRange();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem', padding: '1rem' }}>
            <button 
                onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                className="pagination-nav-btn"
                style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
            >
                &lt;
            </button>

            {pages.map((page, index) => (
                <React.Fragment key={index}>
                    {page === "..." ? (
                        <span style={{ padding: '5px', color: 'var(--text-muted)', letterSpacing: '2px' }}>...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page)}
                            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                            style={{
                                width: '40px', height: '40px', border: 'none', borderRadius: '8px',
                                cursor: 'pointer', fontWeight: currentPage === page ? 'bold' : 'normal',
                                fontSize: '1rem', transition: 'all 0.2s'
                            }}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                className="pagination-nav-btn"
                style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
                &gt;
            </button>
        </div>
    );
};
// ------------------------------------------------------------------

function AlbumList() {
  const [albuns, setAlbuns] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE BUSCA EM TEMPO REAL ---
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const buscaInicialUrl = queryParams.get('q') || ''; 
  
  const [searchTerm, setSearchTerm] = useState(buscaInicialUrl);
  
  // --- ESTADOS DA PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  // -------------------------------------

  useEffect(() => {
    const getAlbuns = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/albuns/');
        if (Array.isArray(response.data)) {
            setAlbuns(response.data);
        } else {
            setAlbuns([]); 
        }
      } catch (error) {
        console.error("Erro ao buscar os álbuns:", error);
        setAlbuns([]); 
      } finally {
        setLoading(false);
      }
    };
    getAlbuns();
  }, []);

  // Sempre que o utilizador digitar algo na barra de pesquisa, volta para a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- FILTRO LOCAL RÁPIDO ---
  const albunsFiltrados = albuns.filter(album => 
      album.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LÓGICA DE CORTE PARA PAGINAÇÃO ---
  const totalPages = Math.ceil(albunsFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  const albunsPaginados = albunsFiltrados.slice(startIndex, endIndex);

  const handlePageChange = (novaPagina) => {
      setCurrentPage(novaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="page-container">
      
      {/* CABEÇALHO E BARRA DE PESQUISA */}
      <div className="album-list-header-wrapper">
          <h1 className="page-title" style={{ margin: 0, textAlign: 'left' }}>Álbuns</h1>
          
          <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
              <input 
                  type="text" 
                  placeholder="Pesquisar pelo nome do álbum..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="album-search-input"
              />
              <span className="album-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </span>
          </div>
      </div>
      
      {loading ? (
        <p className="page-subtitle" style={{textAlign: 'center'}}>A carregar álbuns...</p>
      ) : (
        <>
          <div className='album-grid'>
            {Array.isArray(albunsPaginados) && albunsPaginados.length > 0 ? (
              albunsPaginados.map(album => (
                <Link to={`/album/${album.id}`} key={album.id} className="album-card">
                  <div 
                    className="album-card-image"
                    style={{ backgroundImage: `url(${album.capa_url})` }}
                  ></div>
                  <div className="album-card-info">
                    <h3>{album.titulo}</h3>
                    
                    <div className="album-meta-info">
                      <span>{new Date(album.data_evento).toLocaleDateString()}</span>
                      {album.fotografo && <span> • {album.fotografo}</span>}
                    </div>
                    
                    {album.local && <p className="album-location">{album.local}</p>}
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
                  <p className="page-subtitle" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Nenhum álbum encontrado.</p>
                  {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="button-outline">
                          Ver todos os álbuns
                      </button>
                  )}
              </div>
            )}
          </div>

          <CustomPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
          />
        </>
      )}
    </div>
  );
}

export default AlbumList;