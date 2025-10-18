// src/pages/AlbumList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function AlbumList() {
  const [albuns, setAlbuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAlbuns = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/albuns/');
        setAlbuns(response.data);
      } catch (error) {
        console.error("Erro ao buscar os álbuns:", error);
      } finally {
        setLoading(false);
      }
    };
    getAlbuns();
  }, []);

  if (loading) return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar álbuns...</p>;

  return (
    // Usamos o page-container para manter o padding e a centralização
    <div className="page-container">
      <h1>Álbuns</h1>
      
      {/* Reutilizamos a mesma classe 'album-grid' da página inicial */}
      <div className='album-grid'>
        {albuns.map(album => (
          <Link to={`/album/${album.id}`} key={album.id} className="album-card">
            <div 
              className="album-card-image"
              style={{ backgroundImage: `url(${album.capa_url})` }}
            ></div>
            <div className="album-card-info">
              <h3>{album.titulo}</h3>
              {/* Adicionamos a data do evento para mais contexto */}
              <p style={{color: '#555', fontSize: '0.9rem', marginTop: '0.25rem'}}>
                {new Date(album.data_evento).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AlbumList;