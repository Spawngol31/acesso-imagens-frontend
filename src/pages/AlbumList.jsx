import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import axiosInstance from '../api/axiosInstance';

// --- COMPONENTE DE PAGINAÇÃO NUMÉRICA (IDÊNTICO AO ALBUMDETAIL) ---
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
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            gap: '8px', marginTop: '3rem', padding: '1rem' 
        }}>
            <button 
                onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                style={{ 
                    border: 'none', background: 'transparent', fontSize: '1.2rem', padding: '5px 10px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1,
                    color: '#6c0464', fontWeight: 'bold'
                }}
            >
                &lt;
            </button>

            {pages.map((page, index) => (
                <React.Fragment key={index}>
                    {page === "..." ? (
                        <span style={{ padding: '5px', color: '#888', letterSpacing: '2px' }}>...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page)}
                            style={{
                                width: '40px', height: '40px', border: 'none', borderRadius: '8px',
                                backgroundColor: currentPage === page ? '#6c0464' : 'transparent',
                                color: currentPage === page ? 'white' : '#6c0464',
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
                style={{ 
                    border: 'none', background: 'transparent', fontSize: '1.2rem', padding: '5px 10px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1,
                    color: '#6c0464', fontWeight: 'bold'
                }}
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
  
  // Estes são os 20 álbuns exatos que vão aparecer na página atual
  const albunsPaginados = albunsFiltrados.slice(startIndex, endIndex);

  // --- FUNÇÃO PARA MUDAR A PÁGINA COM SCROLL SUAVE ---
  const handlePageChange = (novaPagina) => {
      setCurrentPage(novaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a página ao mudar
  };

  return (
    <div className="page-container">
      
      {/* CABEÇALHO E BARRA DE PESQUISA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, textAlign: 'left' }}>🎞️ Álbuns</h1>
          
          <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
              <input 
                  type="text" 
                  placeholder="Pesquisar pelo nome do álbum..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                      backgroundColor: '#fff', width: '100%', padding: '12px 20px', paddingLeft: '40px', borderRadius: '50px', 
                      border: '1px solid #e1bce0', fontSize: '15px', outline: 'none',
                      boxShadow: '0 2px 8px rgba(108, 4, 100, 0.05)', color: '#333'
                  }}
              />
              <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                🔍
              </span>
          </div>
      </div>
      
      {loading ? (
        <p style={{textAlign: 'center'}}>A carregar álbuns...</p>
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
                    <p style={{color: '#555', fontSize: '0.9rem', marginTop: '0.25rem'}}>
                      {new Date(album.data_evento).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: '#666' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Nenhum álbum encontrado.</p>
                  {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="button-outline">
                          Ver todos os álbuns
                      </button>
                  )}
              </div>
            )}
          </div>

          {/* --- NOVA BARRA DE PAGINAÇÃO NUMÉRICA --- */}
          <CustomPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
          />
          {/* ---------------------------------------- */}
        </>
      )}
    </div>
  );
}

export default AlbumList;