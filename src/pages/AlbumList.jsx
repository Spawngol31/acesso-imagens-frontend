import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; 
import axiosInstance from '../api/axiosInstance';

// --- COMPONENTE DE PAGINAÇÃO ---
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

function AlbumList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const termoDaHome = searchParams.get('q') || '';

  const [albuns, setAlbuns] = useState([]);
  const [fotografosLista, setFotografosLista] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros (já inicia com o termo pesquisado na HomePage, se existir)
  const [isFiltroAberto, setIsFiltroAberto] = useState(false);
  const [filtros, setFiltros] = useState({
      nome_album: termoDaHome,
      fotografo_id: '',
      local: '',
      data: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Sincroniza caso o parâmetro ?q= da URL mude
  useEffect(() => {
      const q = searchParams.get('q');
      if (q !== null) {
          setFiltros(prev => ({ ...prev, nome_album: q }));
          setCurrentPage(1);
      }
  }, [searchParams]);

  // Conta quantos filtros estão atualmente ativos para mostrar no "badge"
  const contarFiltrosAtivos = () => {
      let count = 0;
      if (filtros.nome_album) count++;
      if (filtros.fotografo_id) count++;
      if (filtros.local) count++;
      if (filtros.data) count++;
      return count;
  };

  // Carrega a lista de fotógrafos para a caixa de seleção
  useEffect(() => {
      const getFotografos = async () => {
          try {
              const response = await axiosInstance.get('/fotografos-ativos/');
              setFotografosLista(response.data);
          } catch (error) {
              console.error("Erro ao carregar fotógrafos", error);
          }
      };
      getFotografos();
  }, []);

  // Busca os álbuns enviando os filtros
  useEffect(() => {
    const getAlbuns = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        params.append('page', currentPage);
        
        // Os parâmetros que o Django espera
        if (filtros.nome_album) params.append('search', filtros.nome_album);
        if (filtros.fotografo_id) params.append('fotografo_id', filtros.fotografo_id);
        if (filtros.local) params.append('local', filtros.local);
        if (filtros.data) params.append('data', filtros.data);

        const response = await axiosInstance.get(`/albuns/?${params.toString()}`);
        
        setAlbuns(response.data.results || []);
        setTotalPages(Math.ceil((response.data.count || 0) / ITEMS_PER_PAGE));
        
      } catch (error) {
        console.error("Erro ao buscar os álbuns:", error);
        setAlbuns([]); 
      } finally {
        setLoading(false);
      }
    };
    
    // Pequeno atraso para não pesquisar enquanto o utilizador tecla rapidamente
    const timerId = setTimeout(() => { getAlbuns(); }, 400);
    return () => clearTimeout(timerId);
  }, [currentPage, filtros]);

  const handleFiltroChange = (e) => {
      const { name, value } = e.target;
      setFiltros(prev => ({
          ...prev,
          [name]: value
      }));
      // Se alterar o nome do álbum manualmente, atualiza ou limpa o ?q= da URL
      if (name === 'nome_album') {
          if (value.trim()) {
              setSearchParams({ q: value });
          } else {
              setSearchParams({});
          }
      }
      setCurrentPage(1);
  };

  const limparFiltros = () => {
      setFiltros({ nome_album: '', fotografo_id: '', local: '', data: '' });
      setSearchParams({}); // Remove o ?q= da barra de endereços
      setIsFiltroAberto(false);
      setCurrentPage(1);
  };

  const handlePageChange = (novaPagina) => {
      setCurrentPage(novaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      
      {/* CABEÇALHO COM TÍTULO E BOTÃO DE FILTRO */}
      <div className="filtros-header-bar">
          <h1 className="page-title" style={{ margin: 0, textAlign: 'left' }}>Álbuns</h1>
          
          <button 
              onClick={() => setIsFiltroAberto(!isFiltroAberto)}
              className={`btn-filtros-avancados ${isFiltroAberto ? 'aberto' : ''}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z"/>
              </svg>
              {isFiltroAberto ? 'Ocultar Filtros' : 'Pesquisar e Filtrar'}
              
              {/* Mostra um número de filtros ativos (ex: "2") */}
              {contarFiltrosAtivos() > 0 && (
                  <span className="filtros-badge-contador">{contarFiltrosAtivos()}</span>
              )}
          </button>
      </div>

      {/* PAINEL DE FILTROS AVANÇADOS */}
      {isFiltroAberto && (
          <div className="filtros-modal-box" style={{ flexDirection: 'column' }}>
              
              {/* LINHA 1: Nome do Álbum (Ocupa 100% da largura) */}
              <div style={{ width: '100%' }}>
                  <label className="filtros-label">Nome do Álbum</label>
                  <input 
                      type="text" 
                      name="nome_album"
                      placeholder="Ex: Jogo Final..." 
                      value={filtros.nome_album} 
                      onChange={handleFiltroChange}
                      className="filtros-input"
                  />
              </div>
              
              {/* LINHA 2: Fotógrafo, Local e Data */}
              <div className="filtros-grupo_principal">
                  
                  <div className="filtros-grupo">
                      <label className="filtros-label">Fotógrafo</label>
                      <select 
                          name="fotografo_id" 
                          value={filtros.fotografo_id} 
                          onChange={handleFiltroChange}
                          className="filtros-input"
                      >
                          <option value="">Todos os fotógrafos...</option>
                          {fotografosLista.map(fotografo => (
                              <option key={fotografo.id} value={fotografo.id}>
                                  {fotografo.nome_completo || fotografo.email}
                              </option>
                          ))}
                      </select>
                  </div>

                  <div className="filtros-grupo">
                      <label className="filtros-label">Local do Evento</label>
                      <input 
                          type="text" 
                          name="local"
                          placeholder="Ex: Estádio, Ginásio..." 
                          value={filtros.local} 
                          onChange={handleFiltroChange}
                          className="filtros-input"
                      />
                  </div>

                  <div className="filtros-grupo">
                      <label className="filtros-label">Data do Evento</label>
                      <input 
                          type="date" 
                          name="data"
                          value={filtros.data} 
                          onChange={handleFiltroChange}
                          className="filtros-input"
                      />
                  </div>

              </div>

              {/* LINHA 3: Botão de Limpar */}
              <div className="filtros-botoes-acao" style={{ marginTop: '0' }}>
                  <button onClick={limparFiltros} className="btn-limpar-filtros">
                      Limpar todos os filtros
                  </button>
              </div>
          </div>
      )}
      
      {/* GRELHA DE RESULTADOS */}
      {loading ? (
        <p className="page-subtitle" style={{textAlign: 'center', marginTop: '30px'}}>A carregar álbuns...</p>
      ) : (
        <>
          <div className='album-grid' style={{ marginTop: '30px' }}>
            {albuns.length > 0 ? (
              albuns.map(album => (
                <Link to={`/album/${album.id}`} key={album.id} className="album-card">
                  <div 
                    className="album-card-image"
                    style={{ backgroundImage: `url(${album.capa_url})` }}
                  ></div>
                  <div className="album-card-info">
                    <h3>{album.titulo}</h3>
                    
                    <div className="album-meta-info">
                      <span>{new Date(album.data_evento).toLocaleDateString('pt-BR')}</span>
                      {album.fotografo && <span> • {album.fotografo}</span>}
                    </div>
                    
                    {album.local && <p className="album-location">{album.local}</p>}
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
                  <p className="page-subtitle" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Nenhum álbum corresponde aos filtros selecionados.</p>
                  {contarFiltrosAtivos() > 0 && (
                      <button onClick={limparFiltros} className="button-outline">
                          Limpar pesquisas
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