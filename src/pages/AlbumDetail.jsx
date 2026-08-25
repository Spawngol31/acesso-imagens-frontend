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
                                color: currentPage === page ? 'white' : '#333',
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
                }}
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

  // --- Estados para a Busca Facial ---
  const [referenceImage, setReferenceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSearchingFaces, setIsSearchingFaces] = useState(false);
  const [faceSearchResults, setFaceSearchResults] = useState(null); 
  
  // Estado para filtrar apenas as fotos sem reconhecimento facial
  const [showUnidentifiedOnly, setShowUnidentifiedOnly] = useState(false);
  // -----------------------------------

  // ESTADO DA ABA SELECIONADA
  const [selectedTab, setSelectedTab] = useState('Todas');

  const [currentPage, setCurrentPage] = useState(1);
  const fotosPorPagina = 20;

  const [isPropostaModalOpen, setIsPropostaModalOpen] = useState(false);
  const [propostaForm, setPropostaForm] = useState({ qtdFotos: '', qtdVideos: '', valor: '' });
  const [isSendingProposta, setIsSendingProposta] = useState(false);

  // Ref para ancorar a galeria e fazer scroll suave
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
      setShowUnidentifiedOnly(false); // Limpa também o filtro de "Não identificadas"
      setCurrentPage(1); 
  };

  const handleFaceSearchSubmit = async (e) => {
      e.preventDefault();
      if (!referenceImage) {
          toast.warning("Por favor, escolha uma selfie primeiro.");
          return;
      }

      setIsSearchingFaces(true);
      setShowUnidentifiedOnly(false); // Desativa as fotos não identificadas se for buscar um rosto

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

  // Função ativada ao clicar em "Fotos não identificadas"
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

  // EXTRAIR CATEGORIAS ÚNICAS 
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

  // APLICAR FILTROS (Busca Facial E Fotos Não Identificadas)
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

  // Filtragem por Aba
  const basePhotoList = selectedTab === 'Todas' 
      ? rawPhotoList 
      : rawPhotoList.filter(f => f.categoria?.trim() === selectedTab);

  const baseVideoList = selectedTab === 'Todas' 
      ? rawVideoList 
      : rawVideoList.filter(v => v.categoria?.trim() === selectedTab);

  // --- LÓGICA DE PAGINAÇÃO DE FOTOS ---
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

  // --- LÓGICA DE PAGINAÇÃO DE VÍDEOS ---
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
              valor_oferecido: propostaForm.valor
          });
          toast.success("🤝 Proposta enviada com sucesso! O fotógrafo analisará em breve.");
          setIsPropostaModalOpen(false);
          setPropostaForm({ qtdFotos: '', qtdVideos: '', valor: '' });
      } catch (error) {
          toast.error(error.response?.data?.error || "Erro ao enviar proposta.");
      } finally {
          setIsSendingProposta(false);
      }
  };

  if (loading) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>A carregar álbum...</p>; }
  if (!album) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>Álbum não encontrado.</p>; }

  return (
    <div className="page-container">
      {/* CABEÇALHO DO ÁLBUM */}
      <header className="page-header-detail" style={{ 
                backgroundColor: '#fff', border: '1px solid #e1bce0',
                borderRadius: '8px', padding: '20px', marginBottom: '2rem',
                boxShadow: '0 4px 10px rgba(108, 4, 100, 0.05)'
            }}>
        
        <div style={{ textAlign: 'center' }}>
            <h1 style={{ marginTop: 0, marginBottom: '10px' }}>{album.titulo}</h1>
            {album.descricao && <p style={{ marginBottom: '15px' }}>{album.descricao}</p>}
            
            <p style={{ color: '#555', margin: 0, fontSize: '0.95rem' }}>
                <strong>Fotógrafo:</strong> {album.fotografo} | <strong>Data:</strong> {new Date(album.data_evento).toLocaleDateString()}
                {album.local && <> | <strong>Local:</strong> {album.local}</>}
            </p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleShareClick} className="button-outline">Compartilhar álbum</button>
            <button onClick={() => setIsPropostaModalOpen(true)} className="create-button">Proposta</button>
        </div>

      </header>

      <main>
        
        {/* BLOCO DE DESCONTOS CENTRALIZADO */}
        {(album.qtd_desconto_1 > 0 || album.qtd_desconto_2 > 0 || album.qtd_desconto_3 > 0) && (
            <div className="discount-promo-banner" style={{ textAlign: 'center' }}>
                <div className="discount-promo-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <h3 style={{ textAlign: 'center' }}>Aproveite nossos descontos!</h3>
                </div>
                <div className="discount-promo-list">
                    {album.qtd_desconto_1 > 0 && album.pct_desconto_1 > 0 && (
                        <div className="discount-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span className="discount-check" style={{ marginRight: '8px' }}>✓</span>
                            <p style={{ margin: 0 }}>Compre <strong>{album.qtd_desconto_1} fotos</strong> e ganhe <strong>{parseFloat(album.pct_desconto_1)}% OFF</strong></p>
                        </div>
                    )}
                    {album.qtd_desconto_2 > 0 && album.pct_desconto_2 > 0 && (
                        <div className="discount-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span className="discount-check" style={{ marginRight: '8px' }}>✓</span>
                            <p style={{ margin: 0 }}>Compre <strong>{album.qtd_desconto_2} fotos</strong> e ganhe <strong>{parseFloat(album.pct_desconto_2)}% OFF</strong></p>
                        </div>
                    )}
                    {album.qtd_desconto_3 > 0 && album.pct_desconto_3 > 0 && (
                        <div className="discount-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span className="discount-check" style={{ marginRight: '8px' }}>✓</span>
                            <p style={{ margin: 0 }}>Compre <strong>{album.qtd_desconto_3} ou mais</strong> e ganhe <strong>{parseFloat(album.pct_desconto_3)}% OFF</strong></p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* 🚀 BLOCO DE BUSCA FACIAL */}
        {album.fotos && album.fotos.length > 0 && (
            <div style={{ 
                backgroundColor: '#fff', border: '1px solid #e1bce0', 
                borderRadius: '8px', padding: '30px 20px', marginBottom: '2rem',
                boxShadow: '0 4px 10px rgba(108, 4, 100, 0.05)',
                textAlign: 'center'
            }}>
                <h3 style={{ color: '#333', marginTop: '1.5rem', marginBottom: '20px', fontSize: '1.4rem' }}>Encontre suas fotos por reconhecimento facial</h3>
                
                <form onSubmit={handleFaceSearchSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    
                    {/* Botão de Escolher/Trocar Selfie */}
                    <label htmlFor="album-face-upload" className="button-outline" style={{ cursor: 'pointer', margin: 0, padding: '0.6rem 1.2rem', borderColor: '#ccc', color: '#555' }}>
                        {referenceImage ? 'Trocar Selfie' : 'Escolher Selfie'}
                    </label>
                    <input id="album-face-upload" type="file" accept="image/*" onChange={handleFaceFileChange} style={{ display: 'none' }} />

                    {/* 🚀 FOTO CENTRALIZADA ENTRE OS BOTÕES */}
                    {previewUrl && (
                        <img 
                            src={previewUrl} 
                            alt="Selfie" 
                            style={{ 
                                width: '70px', 
                                height: '70px', 
                                borderRadius: '50%', 
                                objectFit: 'cover', 
                                border: '3px solid #dc3545',
                                boxShadow: '0 4px 8px rgba(220,53,69,0.3)',
                                margin: '5px 0'
                            }} 
                        />
                    )}

                    {/* Botão de Encontrar Foto */}
                    <button 
                        type="submit" 
                        className="create-button" 
                        disabled={!referenceImage || isSearchingFaces} 
                        style={{ 
                            padding: '1rem', 
                            width: '100%', 
                            maxWidth: '250px', 
                            margin: 0, 
                            backgroundColor: '#dc3545', 
                            border: 'none', 
                            borderRadius: '25px', 
                            fontSize: '16px',
                            opacity: (!referenceImage || isSearchingFaces) ? 0.5 : 1,
                            cursor: (!referenceImage || isSearchingFaces) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSearchingFaces ? 'A procurar...' : 'Encontrar sua foto'}
                    </button>

                    {/* Botão de Limpar Busca (Aparece apenas quando há resultados ativos) */}
                    {faceSearchResults !== null && (
                        <button type="button" onClick={clearFaceSearch} className="delete-button-pill" style={{ padding: '0.6rem 1.2rem', margin: '5px 0 0 0' }}>
                            Limpar Busca Facial
                        </button>
                    )}
                </form>

                {/* LINK: Fotos não identificadas */}
                <div style={{ marginTop: '25px' }}>
                    <button 
                        onClick={handleUnidentifiedMediaClick}
                        style={{
                            background: 'none', border: 'none', color: '#666', 
                            textDecoration: 'underline', fontSize: '14px', cursor: 'pointer',
                            padding: '5px'
                        }}
                    >
                        Fotos ou vídeos não identificados
                    </button>
                </div>
            </div>
        )}

        {/* BARRA DE ABAS / CATEGORIAS DENTRO DO ÁLBUM */}
        {tabs.length > 1 && (
            <div style={{
                display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '10px',
                scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch'
            }}>
                {tabs.map(tab => {
                    const isActive = selectedTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            style={{
                                padding: '8px 20px', 
                                borderRadius: '25px', 
                                cursor: 'pointer', 
                                whiteSpace: 'nowrap', 
                                transition: 'all 0.2s',
                                border: isActive ? 'none' : '1px solid #e1bce0',
                                backgroundColor: isActive ? '#9427a5' : 'rgba(255, 255, 255, 0.05)',
                                color: isActive ? '#ffffff' : '#f794f7',
                                fontWeight: 'bold',
                                boxShadow: isActive ? '0 4px 10px rgba(184, 50, 206, 0.4)' : 'none',
                                textShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
                            }}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>
        )}

        {/* TÍTULOS DINÂMICOS DEPENDENDO DO FILTRO (Ref: galleryRef) */}
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
            {/* Botão para limpar o filtro de não identificadas e ver todas */}
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

        {/* Mensagens de estado vazio */}
        {faceSearchResults !== null && currentPhotos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
                <p>Não encontramos o seu rosto nestas fotos. Experimente usar uma selfie mais clara e com o rosto bem iluminado.</p>
                <button onClick={clearFaceSearch} className="button-outline" style={{ marginTop: '10px' }}>Ver todas as fotos do álbum</button>
            </div>
        )}

        {showUnidentifiedOnly && currentPhotos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
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
      
      {isPropostaModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                  <h3 style={{ color: '#6c0464', marginTop: 0, marginBottom: '15px' }}>Fazer uma Proposta</h3>
                  <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>Quer comprar um pacote de fotos? Diga ao fotógrafo quantas fotos quer e qual valor deseja pagar.</p>
                  
                  <form onSubmit={handlePropostaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Qtd. Fotos</label>
                              <input type="number" min="0" placeholder="Ex: 20" value={propostaForm.qtdFotos} onChange={(e) => setPropostaForm({...propostaForm, qtdFotos: e.target.value})} style={{ backgroundColor: '#fff', color: '#666', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Qtd. Vídeos</label>
                              <input type="number" min="0" placeholder="Ex: 5" value={propostaForm.qtdVideos} onChange={(e) => setPropostaForm({...propostaForm, qtdVideos: e.target.value})} style={{ backgroundColor: '#fff', color: '#666', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                          </div>
                      </div>
                      
                      <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Valor Oferecido (R$)</label>
                          <input type="number" step="0.01" required min="1" placeholder="Ex: 150.00" value={propostaForm.valor} onChange={(e) => setPropostaForm({...propostaForm, valor: e.target.value})} style={{ backgroundColor: '#fff', color: '#666', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button type="button" onClick={() => setIsPropostaModalOpen(false)} className="button-outline" style={{ flex: 1 }}>Cancelar</button>
                          <button type="submit" disabled={isSendingProposta} className="create-button" style={{ flex: 1 }}>
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