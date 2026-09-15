// src/pages/AlbumDetail.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import Lightbox from '../components/Lightbox';
import { toast } from 'react-toastify';

const VideoPreviewCard = ({ video, user, handleAddToCartClick }) => {
    const videoRef = React.useRef(null);
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(error => console.log("Erro ao reproduzir:", error));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
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
            {video.arquivo_preview_url ? (
                <video 
                    ref={videoRef}
                    src={video.arquivo_preview_url}
                    poster={video.miniatura_url} 
                    muted 
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <img src={video.miniatura_url} alt={video.titulo} />
            )}
            
            {!isHovered && video.arquivo_preview_url && (
                <div className="video-play-overlay">
                    <span className="video-play-icon">▶</span>
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
        <div className="pagination-container">
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
                        <span className="pagination-ellipsis">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page)}
                            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                            style={{ cursor: 'pointer', transition: 'all 0.2s', fontWeight: currentPage === page ? 'bold' : 'normal' }}
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

function AlbumDetail() {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(null);

  const [referenceImage, setReferenceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSearchingFaces, setIsSearchingFaces] = useState(false);
  const [faceSearchResults, setFaceSearchResults] = useState(null); 
  
  const [showUnidentifiedOnly, setShowUnidentifiedOnly] = useState(false);

  const [selectedTab, setSelectedTab] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const fotosPorPagina = 20;

  const [isPropostaModalOpen, setIsPropostaModalOpen] = useState(false);
  const [propostaForm, setPropostaForm] = useState({ qtdFotos: '', qtdVideos: '', valor: '', comentario: '' });
  const [isSendingProposta, setIsSendingProposta] = useState(false);

  const galleryRef = useRef(null);

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

  const handleAddToCartClick = async (e, media) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      
      try {
          await addToCart(media); 
      } catch (error) {
          console.error("Erro no carrinho:", error);
          toast.error("Erro ao adicionar ao carrinho. O servidor recusou o item.");
      }
  };

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
      setShowUnidentifiedOnly(false);
      setCurrentPage(1); 
  };

  const handleFaceSearchSubmit = async (e) => {
      e.preventDefault();
      if (!referenceImage) {
          toast.warning("Por favor, escolha uma selfie primeiro.");
          return;
      }

      setIsSearchingFaces(true);
      setShowUnidentifiedOnly(false);

      const formData = new FormData();
      formData.append('imagem_referencia', referenceImage);
      formData.append('album_id', id); 

      try {
          const response = await axiosInstance.post('/fotos/busca-facial/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setFaceSearchResults(response.data);
          setCurrentPage(1); 
          
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

  const handleUnidentifiedMediaClick = () => {
      setReferenceImage(null);
      setPreviewUrl('');
      setFaceSearchResults(null);
      
      setShowUnidentifiedOnly(true);
      setCurrentPage(1);

      if (galleryRef.current) {
          galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  const todasCategorias = new Set();
  if (album?.fotos) {
      album.fotos.forEach(f => {
          if (f.categoria && f.categoria.trim() !== '') todasCategorias.add(f.categoria.trim());
      });
  }
  if (album?.videos) {
      album.videos.forEach(v => {
          if (v.categoria && v.categoria.trim() !== '') todasCategorias.add(v.categoria.trim());
      });
  }
  const tabs = ['Todas', ...Array.from(todasCategorias).sort()];

  const handleTabChange = (tab) => {
      setSelectedTab(tab);
      setCurrentPage(1);
      setCurrentVideoPage(1);
  };

  let rawPhotoList = album?.fotos || [];
  if (faceSearchResults !== null) {
      rawPhotoList = faceSearchResults;
  } else if (showUnidentifiedOnly) {
      rawPhotoList = rawPhotoList.filter(f => f.tem_rostos === false || f.faces_detectadas === 0 || f.has_faces === false);
  }

  let rawVideoList = album?.videos || [];
  if (showUnidentifiedOnly) {
      rawVideoList = rawVideoList.filter(v => v.tem_rostos === false || v.faces_detectadas === 0 || v.has_faces === false);
  }

  const basePhotoList = selectedTab === 'Todas' 
      ? rawPhotoList 
      : rawPhotoList.filter(f => f.categoria?.trim() === selectedTab);

  const baseVideoList = selectedTab === 'Todas' 
      ? rawVideoList 
      : rawVideoList.filter(v => v.categoria?.trim() === selectedTab);

  const totalPages = Math.ceil(basePhotoList.length / fotosPorPagina);
  const indexOfLastPhoto = currentPage * fotosPorPagina;
  const indexOfFirstPhoto = indexOfLastPhoto - fotosPorPagina;
  const currentPhotos = basePhotoList.slice(indexOfFirstPhoto, indexOfLastPhoto);

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

  const handlePageChange = (novaPagina) => {
      setCurrentPage(novaPagina);
      if (galleryRef.current) {
          galleryRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const [currentVideoPage, setCurrentVideoPage] = useState(1);
  const videosPorPagina = 20;

  const totalVideoPages = Math.ceil(baseVideoList.length / videosPorPagina);
  const indexOfLastVideo = currentVideoPage * videosPorPagina;
  const indexOfFirstVideo = indexOfLastVideo - videosPorPagina;
  const currentVideos = baseVideoList.slice(indexOfFirstVideo, indexOfLastVideo);

  const handleVideoPageChange = (novaPagina) => {
      setCurrentVideoPage(novaPagina);
  };

  const handlePropostaSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
          toast.warning("Precisa iniciar sessão como cliente para enviar uma proposta.");
          return;
      }
      setIsSendingProposta(true);
      try {
          await axiosInstance.post('/propostas/criar/', {
              album: id,
              quantidade_fotos: propostaForm.qtdFotos || 0,
              quantidade_videos: propostaForm.qtdVideos || 0,
              valor_oferecido: propostaForm.valor,
              comentario: propostaForm.comentario
          });
          toast.success("🤝 Proposta enviada com sucesso! O fotógrafo analisará em breve.");
          setIsPropostaModalOpen(false);
          setPropostaForm({ qtdFotos: '', qtdVideos: '', valor: '', comentario: '' });
      } catch (error) {
          toast.error(error.response?.data?.error || "Erro ao enviar proposta.");
      } finally {
          setIsSendingProposta(false);
      }
  };

  if (loading) { return <p className="page-subtitle" style={{textAlign: 'center', marginTop: '2rem'}}>A carregar álbum...</p>; }
  if (!album) { return <p className="page-subtitle" style={{textAlign: 'center', marginTop: '2rem'}}>Álbum não encontrado.</p>; }

  return (
    <div className="page-container">
      <header className="album-detail-header page-header-detail">
        
        <div style={{ textAlign: 'center' }}>
            <h1 className="album-title">{album.titulo}</h1>
            {album.descricao && <p className="album-desc">{album.descricao}</p>}
            
            <p className="album-meta-text">
                <strong>Fotógrafo:</strong> {album.fotografo} | <strong>Data:</strong> {new Date(album.data_evento).toLocaleDateString()}
                {album.local && <> | <strong>Local:</strong> {album.local}</>}
            </p>
        </div>
        
        <div className="album-action-buttons">
            <button onClick={handleShareClick} className="button-outline">Compartilhar álbum</button>
            <button onClick={() => { setPropostaForm({ qtdFotos: '', qtdVideos: '', valor: '', comentario: '' }); setIsPropostaModalOpen(true); }} className="create-button">Proposta</button>
        </div>

      </header>

      <main>
        
        {(album.qtd_desconto_1 > 0 || album.qtd_desconto_2 > 0 || album.qtd_desconto_3 > 0) && (
            <div className="discount-promo-banner discount-box" style={{ textAlign: 'center' }}>
                <div className="discount-promo-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <h3 style={{ textAlign: 'center' }}>Aproveite nossos descontos!</h3>
                </div>
                <div className="discount-promo-list">
                    {album.qtd_desconto_1 > 0 && album.pct_desconto_1 > 0 && (
                        <div className="discount-item discount-row">
                            <span className="discount-check">✓</span>
                            <p>Compre <strong>{album.qtd_desconto_1} fotos</strong> e ganhe <strong>{parseFloat(album.pct_desconto_1)}% OFF</strong></p>
                        </div>
                    )}
                    {album.qtd_desconto_2 > 0 && album.pct_desconto_2 > 0 && (
                        <div className="discount-item discount-row">
                            <span className="discount-check">✓</span>
                            <p>Compre <strong>{album.qtd_desconto_2} fotos</strong> e ganhe <strong>{parseFloat(album.pct_desconto_2)}% OFF</strong></p>
                        </div>
                    )}
                    {album.qtd_desconto_3 > 0 && album.pct_desconto_3 > 0 && (
                        <div className="discount-item discount-row">
                            <span className="discount-check">✓</span>
                            <p>Compre <strong>{album.qtd_desconto_3} ou mais</strong> e ganhe <strong>{parseFloat(album.pct_desconto_3)}% OFF</strong></p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {album.fotos && album.fotos.length > 0 && (
            <div className="album-face-search-box">
                <h3 className="face-search-title">Encontre suas fotos por reconhecimento facial</h3>
                
                <form onSubmit={handleFaceSearchSubmit} className="face-search-form">
                    
                    <label htmlFor="album-face-upload" className="button-outline face-search-label">
                        {referenceImage ? 'Trocar Selfie' : 'Escolher Selfie'}
                    </label>
                    <input id="album-face-upload" type="file" accept="image/*" onChange={handleFaceFileChange} style={{ display: 'none' }} />

                    {previewUrl && (
                        <img 
                            src={previewUrl} 
                            alt="Selfie" 
                            className="face-search-preview"
                        />
                    )}

                    <button 
                        type="submit" 
                        className="create-button face-search-btn" 
                        disabled={!referenceImage || isSearchingFaces} 
                    >
                        {isSearchingFaces ? 'A procurar...' : 'Encontrar sua foto'}
                    </button>

                    {faceSearchResults !== null && (
                        <button type="button" onClick={clearFaceSearch} className="delete-button-pill" style={{ padding: '0.6rem 1.2rem', margin: '5px 0 0 0' }}>
                            Limpar Busca Facial
                        </button>
                    )}
                </form>

                <div style={{ marginTop: '25px' }}>
                    <button 
                        onClick={handleUnidentifiedMediaClick}
                        className="unidentified-btn"
                    >
                        Fotos ou vídeos não identificados
                    </button>
                </div>
            </div>
        )}

        {tabs.length > 1 && (
            <div className="album-tabs-container">
                {tabs.map(tab => {
                    const isActive = selectedTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`album-tab-btn ${isActive ? 'active' : ''}`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>
        )}

        <div ref={galleryRef} className="section-header">
          <h2>
             {faceSearchResults !== null 
                ? `Resultados da Busca (${basePhotoList.length})` 
                : showUnidentifiedOnly 
                    ? `Fotos Não Identificadas (${basePhotoList.length})`
                    : `Fotos (${basePhotoList.length})`
             }
          </h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {showUnidentifiedOnly && (
                <button onClick={() => setShowUnidentifiedOnly(false)} className="delete-button-pill" style={{ padding: '0.6rem 1rem', margin: 0 }}>
                    Todas
                </button>
            )}
            <Link to="/eventos" className="button-outline">Voltar</Link>
          </div>
        </div>

        <div className="photo-grid">
          {currentPhotos.map(foto => (
            <div key={foto.id} className="photo-card" onClick={() => setSelectedImage(foto)}>
              <img src={foto.imagem_url} alt={foto.legenda || `Foto ${foto.id}`} style={{ transform: `rotate(${foto.rotacao}deg)` }}/>
              <div className="photo-overlay">
                <p>R$ {foto.preco}</p>
                {(!user || user.papel === 'CLIENTE') && (
                  <button onClick={(e) => handleAddToCartClick(e, foto)}>Adicionar ao carrinho</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

        {faceSearchResults !== null && currentPhotos.length === 0 && (
            <div className="empty-state-message">
                <p>Não encontramos o seu rosto nestas fotos. Experimente usar uma selfie mais clara e com o rosto bem iluminado.</p>
                <button onClick={clearFaceSearch} className="button-outline" style={{ marginTop: '10px' }}>Ver todas as fotos do álbum</button>
            </div>
        )}

        {showUnidentifiedOnly && currentPhotos.length === 0 && (
            <div className="empty-state-message">
                <p>Ótimo! O sistema conseguiu identificar rostos em todas as fotos deste álbum.</p>
                <button onClick={() => setShowUnidentifiedOnly(false)} className="button-outline" style={{ marginTop: '10px' }}>Ver todas as fotos do álbum</button>
            </div>
        )}

        {faceSearchResults === null && baseVideoList.length > 0 && (
          <>
            <div className="section-header" style={{marginTop: '3rem'}}>
              <h2>Vídeos ({baseVideoList.length})</h2>
            </div>
            
            <div className="photo-grid">
              {currentVideos.map(video => (
                  <VideoPreviewCard key={video.id} video={video} user={user} handleAddToCartClick={handleAddToCartClick} />
              ))}
            </div>

            <CustomPagination currentPage={currentVideoPage} totalPages={totalVideoPages} onPageChange={handleVideoPageChange} />
          </>
        )}
      </main>

      {selectedImage && (
        <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} onNext={handleNextImage} onPrev={handlePrevImage} />
      )}
      
      {/* 🚀 MODAL DE PROPOSTA NO ÁLBUM */}
      {isPropostaModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content proposta-modal-box">
                  <h3>Fazer uma Proposta</h3>
                  <p className="modal-subtitle">Quer comprar um pacote de fotos? Diga ao fotógrafo quantas fotos quer e qual valor deseja pagar.</p>
                  
                  <form onSubmit={handlePropostaSubmit} className="proposta-form">
                      <div className="proposta-row">
                          <div className="proposta-col">
                              <label>Qtd. Fotos</label>
                              <input type="number" min="0" placeholder="Ex: 20" value={propostaForm.qtdFotos} onChange={(e) => setPropostaForm({...propostaForm, qtdFotos: e.target.value})} />
                          </div>
                          <div className="proposta-col">
                              <label>Qtd. Vídeos</label>
                              <input type="number" min="0" placeholder="Ex: 5" value={propostaForm.qtdVideos} onChange={(e) => setPropostaForm({...propostaForm, qtdVideos: e.target.value})} />
                          </div>
                      </div>
                      
                      <div className="proposta-col">
                          <label>Valor Oferecido (R$)</label>
                          <input type="number" step="0.01" required min="1" placeholder="Ex: 150.00" value={propostaForm.valor} onChange={(e) => setPropostaForm({...propostaForm, valor: e.target.value})} />
                      </div>

                      <div className="proposta-col">
                          <label>Enviar uma menssagem (Opcional)</label>
                          <textarea 
                              placeholder="Ex: Olá, amei as fotos! Consegue fazer esse valor se eu levar 10?" 
                              value={propostaForm.comentario} 
                              onChange={(e) => setPropostaForm({...propostaForm, comentario: e.target.value})} 
                              rows="3"
                          />
                      </div>

                      <div className="modal-actions-row">
                          <button type="button" onClick={() => setIsPropostaModalOpen(false)} className="button-outline">Cancelar</button>
                          <button type="submit" disabled={isSendingProposta} className="create-button">
                              {isSendingProposta ? 'A enviar...' : 'Enviar Proposta'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

export default AlbumDetail;