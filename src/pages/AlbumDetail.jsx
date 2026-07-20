// src/pages/AlbumDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import Lightbox from '../components/Lightbox';
import { toast } from 'react-toastify';

// Coloque isto ANTES da função AlbumDetail()

const VideoPreviewCard = ({ video, user, handleAddToCartClick }) => {
    const videoRef = React.useRef(null);
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            // O play() retorna uma Promise, fazemos o catch para evitar erros no console
            videoRef.current.play().catch(error => console.log("Erro ao reproduzir:", error));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            // Retorna o vídeo ao início quando o cliente tira o rato de cima
            videoRef.current.currentTime = 0; 
        }
    };

    return (
        <div 
            className="photo-card" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {/* Se houver URL de preview, renderizamos o elemento de vídeo */}
            {video.preview_url ? (
                <video 
                    ref={videoRef}
                    src={video.preview_url}
                    poster={video.miniatura_url} /* A imagem estática fica aqui como capa */
                    muted /* É OBRIGATÓRIO estar sem som para os navegadores permitirem o autoplay */
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                /* Fallback de segurança: se não houver vídeo de preview, mostra só a foto */
                <img src={video.miniatura_url} alt={video.titulo} />
            )}
            
            {/* O ícone de play sobreposto (só aparece quando NÃO está com o hover) */}
            {!isHovered && video.preview_url && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '50px', height: '50px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'
                }}>
                    <span style={{ color: 'white', fontSize: '24px', marginLeft: '5px' }}>▶</span>
                </div>
            )}

            <div className="photo-overlay">
                <p>R$ {video.preco}</p>
                {(!user || user.papel === 'CLIENTE') && (
                    <button onClick={(e) => handleAddToCartClick(e, video)}>Adicionar ao carrinho</button>
                )}
            </div>
        </div>
    );
};

function AlbumDetail() {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(null);

  // --- Estados para a Busca Facial no Álbum ---
  const [referenceImage, setReferenceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSearchingFaces, setIsSearchingFaces] = useState(false);
  const [faceSearchResults, setFaceSearchResults] = useState(null); 
  // ---------------------------------------------

  // --- NOVO: ESTADO DA PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const fotosPorPagina = 20; // Quantas fotos mostrar por vez
  // ---------------------------------

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

  const handleShareClick = () => {
    let apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl.endsWith('/')) {
        apiUrl = apiUrl.slice(0, -1);
    }
    const cacheBuster = `?v=${new Date().getTime()}`;
    const shareLink = `${apiUrl}/share/album/${album.id}/${cacheBuster}`;

    navigator.clipboard.writeText(shareLink)
      .then(() => toast.success("Link copiado!"))
      .catch(err => {
        console.error("Erro ao copiar o link: ", err);
        toast.error("Erro ao copiar. Tente novamente.");
      });
  };

  const handleAddToCartClick = (e, foto) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    addToCart(foto);
    toast.success("Sucesso! Foto adicionada ao carrinho."); 
  };

  // --- Lógica da Busca Facial ---
  const handleFaceFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setReferenceImage(file);
          setPreviewUrl(URL.createObjectURL(file));
      } else {
          clearFaceSearch();
      }
  };

  const clearFaceSearch = () => {
      setReferenceImage(null);
      setPreviewUrl('');
      setFaceSearchResults(null);
      setCurrentPage(1); // Volta para a página 1 ao limpar a busca
  };

  const handleFaceSearchSubmit = async (e) => {
      e.preventDefault();
      if (!referenceImage) return;

      setIsSearchingFaces(true);

      const formData = new FormData();
      formData.append('imagem_referencia', referenceImage);
      formData.append('album_id', id); 

      try {
          const response = await axiosInstance.post('/fotos/busca-facial/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setFaceSearchResults(response.data);
          setCurrentPage(1); // Se buscou algo novo, começa na página 1
          
          if (response.data.length === 0) {
              toast.info("Nenhuma foto sua encontrada neste álbum.");
          } else {
              toast.success(`${response.data.length} foto(s) sua(s) encontrada(s)!`);
          }
      } catch (err) {
          console.error("Erro na busca facial no álbum:", err);
          toast.error("Ocorreu um erro ao realizar a busca. Tente novamente.");
      } finally {
          setIsSearchingFaces(false);
      }
  };
  // ------------------------------------

  // --- LÓGICA DE FATIAMENTO DA PAGINAÇÃO ---
  // A lista base: Se tem busca ativa, usa os resultados. Senão, as fotos do álbum.
  const basePhotoList = faceSearchResults !== null ? faceSearchResults : (album?.fotos || []);
  
  // Calcula o total de páginas possíveis
  const totalPages = Math.ceil(basePhotoList.length / fotosPorPagina);

  // Corta o array para pegar APENAS as fotos da página atual
  const indexOfLastPhoto = currentPage * fotosPorPagina;
  const indexOfFirstPhoto = indexOfLastPhoto - fotosPorPagina;
  const currentPhotos = basePhotoList.slice(indexOfFirstPhoto, indexOfLastPhoto);
  // -----------------------------------------

  // A navegação do Lightbox precisa respeitar a lista cortada (currentPhotos)
  const handleNextImage = () => {
    const currentIndex = currentPhotos.findIndex(f => f.id === selectedImage.id);
    if (currentIndex === currentPhotos.length - 1) {
      setSelectedImage(currentPhotos[0]); 
    } else {
      setSelectedImage(currentPhotos[currentIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    const currentIndex = currentPhotos.findIndex(f => f.id === selectedImage.id);
    if (currentIndex === 0) {
      setSelectedImage(currentPhotos[currentPhotos.length - 1]); 
    } else {
      setSelectedImage(currentPhotos[currentIndex - 1]);
    }
  };

  // Funções dos botões da páginação
  const irParaPaginaAnterior = () => {
      if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
          window.scrollTo({ top: 300, behavior: 'smooth' }); // Sobe um pouquinho a tela
      }
  };

  const irParaProximaPagina = () => {
      if (currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
          window.scrollTo({ top: 300, behavior: 'smooth' });
      }
  };

  if (loading) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar álbum...</p>; }
  if (!album) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>Álbum não encontrado.</p>; }

  return (
    <div className="page-container">
      <header className="page-header-detail" style={{ 
                backgroundColor: '#fff', border: '1px solid #e1bce0',
                borderRadius: '8px', padding: '20px', marginBottom: '2rem',
                boxShadow: '0 4px 10px rgba(108, 4, 100, 0.05)'
            }}>
        <h1>📸 {album.titulo}</h1>
        <p>{album.descricao}</p>
        <p><strong>Fotógrafo:</strong> {album.fotografo} | <strong>Data:</strong> {new Date(album.data_evento).toLocaleDateString()}</p>
        
        <button onClick={handleShareClick} className="button-outline" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          🔗 Compartilhar
        </button>
      </header>
      <main>
        
        {/* MINI BARRA DE BUSCA FACIAL */}
        {album.fotos && album.fotos.length > 0 && (
            <div style={{ 
                backgroundColor: '#fff', border: '1px solid #e1bce0', 
                borderRadius: '8px', padding: '20px', marginBottom: '2rem',
                boxShadow: '0 4px 10px rgba(108, 4, 100, 0.05)'
            }}>
                <h3 style={{ color: '#6c0464', marginTop: 0, marginBottom: '10px', fontSize: '1.2rem' }}>
                    🤳 Procurar minhas fotos neste álbum
                </h3>
                <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', marginTop: 0 }}>
                    Envie uma selfie e o nosso sistema encontrara sua foto.
                </p>
                <form onSubmit={handleFaceSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    
                    <label htmlFor="album-face-upload" className="button-outline" style={{ cursor: 'pointer', margin: 0, padding: '0.6rem 1.2rem' }}>
                        {referenceImage ? 'Trocar Imagem' : '📸 Escolher Selfie'}
                    </label>
                    <input id="album-face-upload" type="file" accept="image/*" onChange={handleFaceFileChange} style={{ display: 'none' }} />

                    {previewUrl && (
                        <img src={previewUrl} alt="Selfie" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6c0464' }} />
                    )}

                    {referenceImage && (
                        <button type="submit" className="create-button" disabled={isSearchingFaces} style={{ padding: '0.6rem 1.2rem', margin: 0 }}>
                            {isSearchingFaces ? 'A procurar...' : '🔍 Filtrar Fotos'}
                        </button>
                    )}

                    {faceSearchResults !== null && (
                        <button type="button" onClick={clearFaceSearch} className="delete-button-pill" style={{ padding: '0.6rem 1.2rem', margin: 0 }}>
                            ❌ Limpar Busca
                        </button>
                    )}
                </form>
            </div>
        )}

        <div className="section-header">
          <h2>
             📷 {faceSearchResults !== null ? `Resultados da Busca (${basePhotoList.length})` : `Fotos (${basePhotoList.length})`}
          </h2>
          <Link to="/eventos" className="button-outline">Voltar</Link>
        </div>

        {/* GRELHA DE FOTOS (Mostra apenas as da página atual) */}
        <div className="photo-grid">
          {currentPhotos.map(foto => (
            <div 
              key={foto.id} 
              className="photo-card" 
              onClick={() => setSelectedImage(foto)}
            >
              <img 
                src={foto.imagem_url} 
                alt={foto.legenda || `Foto ${foto.id}`} 
                style={{ transform: `rotate(${foto.rotacao}deg)` }}
              />
              <div className="photo-overlay">
                <p>R$ {foto.preco}</p>
                {(!user || user.papel === 'CLIENTE') && (
                  <button onClick={(e) => handleAddToCartClick(e, foto)}>Adicionar ao carrinho</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* --- CONTROLOS DE PAGINAÇÃO --- */}
        {totalPages > 1 && (
            <div style={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                gap: '20px', marginTop: '3rem', padding: '1rem', 
                backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'
            }}>
                <button 
                    onClick={irParaPaginaAnterior} 
                    disabled={currentPage === 1}
                    className="button-outline"
                    style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                    &laquo; Anterior
                </button>
                
                <span style={{ fontWeight: 'bold', color: '#555' }}>
                    Página {currentPage} de {totalPages}
                </span>

                <button 
                    onClick={irParaProximaPagina} 
                    disabled={currentPage === totalPages}
                    className="button-outline"
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                    Próxima &raquo;
                </button>
            </div>
        )}
        {/* -------------------------------- */}

        {faceSearchResults !== null && currentPhotos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
                <p>Não encontramos o seu rosto nestas fotos. Experimente usar uma selfie mais clara e com o rosto bem iluminado.</p>
                <button onClick={clearFaceSearch} className="button-outline" style={{ marginTop: '10px' }}>Ver todas as fotos do álbum</button>
            </div>
        )}

        {/* SECÇÃO DE VÍDEOS (Os vídeos não são paginados, aparecem todos de uma vez abaixo das fotos) */}
        {/* SECÇÃO DE VÍDEOS */}
        {faceSearchResults === null && album.videos && album.videos.length > 0 && (
          <>
            <div className="section-header" style={{marginTop: '3rem'}}>
              <h2>🎥 Vídeos</h2>
            </div>
            
            <div className="photo-grid">
              {album.videos.map(video => (
                  <VideoPreviewCard 
                      key={video.id} 
                      video={video} 
                      user={user} 
                      handleAddToCartClick={handleAddToCartClick} 
                  />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedImage && (
        <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} onNext={handleNextImage} onPrev={handlePrevImage} />
      )}
    </div>
  );
}

export default AlbumDetail;