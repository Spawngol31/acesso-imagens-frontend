// src/pages/AlbumDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import Lightbox from '../components/Lightbox';

function AlbumDetail() {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(null);

  const getAlbumDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/albuns/${id}/?timestamp=${new Date().getTime()}`);
      setAlbum(response.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do álbum:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getAlbumDetail();
  }, [getAlbumDetail]);

  // --- NOVA FUNÇÃO DE COMPARTILHAMENTO ---
  const handleShareClick = () => {
    // 1. Pegamos a URL da API do arquivo .env (ex: https://api.acessoimagens.com.br/api)
    // Se a URL terminar em '/api', nós removemos para não duplicar, ou mantemos dependendo de como está seu .env
    const rawApiUrl = import.meta.env.VITE_API_URL;
    
    // Como a rota que criamos no urls.py fica dentro do namespace 'api/', 
    // o caminho final correto para o compartilhamento é /api/share/album/ID/
    // Vamos garantir que a URL base esteja correta:
    const baseUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
    
    // Se o seu VITE_API_URL já incluir '/api', não precisamos adicionar de novo.
    // Se não incluir, precisamos adicionar. Vamos montar a URL de forma segura:
    let shareLink = "";
    if (baseUrl.endsWith('/api')) {
        shareLink = `${baseUrl.replace('/api', '')}/api/share/album/${album.id}/`;
    } else {
        shareLink = `${baseUrl}/share/album/${album.id}/`;
    }

    // 2. Copia o link para a área de transferência
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        alert("Link copiado");
      })
      .catch(err => {
        console.error("Erro ao copiar o link: ", err);
        alert("Não foi possível copiar o link. Tente copiar a URL do navegador.");
      });
  };
  // ----------------------------------------

  if (loading) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar álbum...</p>; }
  if (!album) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>Álbum não encontrado.</p>; }

  const handleAddToCartClick = (e, fotoId) => {
    e.stopPropagation();
    addToCart(fotoId);
  };

  return (
    <div className="page-container">
      <header className="page-header-detail">
        <h1>{album.titulo}</h1>
        <p>{album.descricao}</p>
        <p><strong>Fotógrafo:</strong> {album.fotografo} | <strong>Data:</strong> {new Date(album.data_evento).toLocaleDateString()}</p>
        
        {/* --- NOVO BOTÃO DE COMPARTILHAR --- */}
        <button onClick={handleShareClick} className="button-outline" style={{ marginTop: '1rem' }}>
          {/* Se você tiver um ícone do whatsapp na pasta images, ele vai aparecer aqui */}
          Compartilhar
        </button>
        {/* ---------------------------------- */}
      </header>
      <main>
        <div className="section-header">
          <h2>Fotos</h2>
          <Link to="/eventos" className="button-outline">Voltar para a lista de álbuns</Link>
        </div>

        <div className="photo-grid">
          {album.fotos?.map(foto => (
            <div 
              key={foto.id} 
              className="photo-card" 
              onClick={() => setSelectedImage({ url: foto.imagem_url, rotacao: foto.rotacao })}
            >
              <img 
                src={foto.imagem_url} 
                alt={foto.legenda || `Foto ${foto.id}`} 
                style={{ transform: `rotate(${foto.rotacao}deg)` }}
              />
              <div className="photo-overlay">
                <p>R$ {foto.preco}</p>
                {user && user.papel === 'CLIENTE' && (
                  <button onClick={(e) => handleAddToCartClick(e, foto.id)}>Adicionar ao carrinho</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {album.videos && album.videos.length > 0 && (
          <>
            <div className="section-header" style={{marginTop: '3rem'}}>
              <h2>Vídeos</h2>
            </div>
            <div className="photo-grid">
              {album.videos.map(video => (
                <div key={video.id} className="photo-card">
                  <img src={video.miniatura_url} alt={video.titulo} />
                  <div className="photo-overlay">
                    <p>R$ {video.preco}</p>
                    {user && user.papel === 'CLIENTE' && (
                  <button onClick={(e) => handleAddToCartClick(e, video.id)}>Adicionar ao carrinho</button>
                )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {selectedImage && (
        <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

export default AlbumDetail;