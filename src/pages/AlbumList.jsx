// src/pages/AlbumList.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // <-- Adicionado useLocation
import axiosInstance from '../api/axiosInstance';

function AlbumList() {
  const [albuns, setAlbuns] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE BUSCA EM TEMPO REAL ---
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const buscaInicialUrl = queryParams.get('q') || ''; // Pega o que veio da HomePage
  
  const [searchTerm, setSearchTerm] = useState(buscaInicialUrl);
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

  // --- FILTRO LOCAL RÁPIDO ---
  // Apenas álbuns que contenham o que foi digitado no título (ignorando maiúsculas e minúsculas)
  const albunsFiltrados = albuns.filter(album => 
      album.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // ----------------------------

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
        <div className='album-grid'>
          {/* Mapeamos "albunsFiltrados" em vez de "albuns" */}
          {Array.isArray(albunsFiltrados) && albunsFiltrados.length > 0 ? (
            albunsFiltrados.map(album => (
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
      )}
    </div>
  );
}

export default AlbumList;