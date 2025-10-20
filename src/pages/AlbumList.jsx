// src/pages/AlbumList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function AlbumList() {
  // --- 1. GARANTIA: O estado DEVE começar como um array vazio ---
  const [albuns, setAlbuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAlbuns = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/albuns/');
        // Garante que o que recebemos é um array
        if (Array.isArray(response.data)) {
            setAlbuns(response.data);
        } else {
            setAlbuns([]); // Define como array vazio em caso de resposta inesperada
        }
      } catch (error) {
        console.error("Erro ao buscar os álbuns:", error);
        setAlbuns([]); // Define como array vazio em caso de erro
      } finally {
        setLoading(false);
      }
    };
    getAlbuns();
  }, []);

  return (
    <div className="page-container">
      <h1>Álbuns</h1>
      
      {loading ? (
        <p style={{textAlign: 'center'}}>A carregar álbuns...</p>
      ) : (
        <div className='album-grid'>
          {/* --- 2. GARANTIA EXTRA: Verifica se é um array E se tem itens --- */}
          {Array.isArray(albuns) && albuns.length > 0 ? (
            albuns.map(album => (
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
            <p style={{textAlign: 'center'}}>Nenhum álbum foi encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AlbumList;