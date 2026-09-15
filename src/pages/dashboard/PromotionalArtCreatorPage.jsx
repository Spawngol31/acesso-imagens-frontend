// src/pages/dashboard/PromotionalArtCreatorPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toJpeg } from 'html-to-image';
import { toast } from 'react-toastify'; 

// --- DEFINIÇÃO DOS TEMPLATES DISPONÍVEIS ---
const TEMPLATES = {
    CARD_FLOATING: { 
        id: 'card_floating', 
        name: 'Clássico (flutuante)', 
        bgUrl: '/images/fundo-arte.png', 
        overlayUrl: null 
    },
    PHONE_MOCKUP: { 
        id: 'phone_mockup', 
        name: 'Moldura celular', 
        bgUrl: '/images/fundo-arte.png', 
        overlayUrl: '/images/phone-frame.png' 
    },
    CAROUSEL_MIMIC: { 
        id: 'carousel_mimic', 
        name: 'Moldura quadrada', 
        bgUrl: '/images/fundo-arte.png', 
        overlayUrl: '/images/carousel-overlay.png' 
    }
};

function PromotionalArtCreatorPage() {
    const { id } = useParams(); 
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const cardRef = useRef(null);

    const corPrincipal = '#6c0464'; 
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

    const [activeTemplate, setActiveTemplate] = useState(TEMPLATES.CARD_FLOATING);

    const [customSettings, setCustomSettings] = useState({
        photoUrl: '', 
        title: '',
        dateText: '',
        locationText: '', 
        photographerName: ''
    });

    const [isPhotoPreloaded, setIsPhotoPreloaded] = useState(false);

    const fetchAlbumDetails = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/albuns/${id}/`);
            setAlbum(response.data);
            
            const dataEvento = response.data.data_evento ? new Date(response.data.data_evento).toLocaleDateString() : '';
            
            const fotografo = response.data.fotografo_nome || ''; 
            const local = response.data.local || ''; 

            setCustomSettings(prev => ({
                ...prev,
                title: response.data.titulo || '',
                dateText: dataEvento,
                locationText: local,
                photographerName: fotografo,
                photoUrl: response.data.fotos && response.data.fotos.length > 0 ? response.data.fotos[0].imagem_url : ''
            }));
        } catch (error) {
            console.error("Erro ao buscar detalhes do álbum:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAlbumDetails();
    }, [fetchAlbumDetails]);

    useEffect(() => {
        if (customSettings.photoUrl) {
            setIsPhotoPreloaded(false);
            const img = new Image();
            img.onload = () => setIsPhotoPreloaded(true);
            img.onerror = () => setIsPhotoPreloaded(true); 
            img.src = customSettings.photoUrl;
        }
    }, [customSettings.photoUrl]);

    const handleSettingChange = (e) => {
        const { name, value } = e.target;
        setCustomSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateImage = async () => {
        if (!cardRef.current || !isPhotoPreloaded) return;
        setIsGenerating(true);

        try {
            await new Promise(r => setTimeout(r, 150)); 

            const dataUrl = await toJpeg(cardRef.current, { 
                quality: 1.0, 
                pixelRatio: 3, 
                backgroundColor: '#ffffff',
                width: 320,
                height: 568,
                useCORS: true, 
                style: { margin: '0', transform: 'none' }
            });
            
            const link = document.createElement('a');
            link.download = `story-${activeTemplate.id}-${album.titulo.toLowerCase().replace(/ /g, '-')}.jpg`;
            link.href = dataUrl;
            link.click();
            
        } catch (err) {
            console.error('Erro ao gerar imagem:', err);
            toast.error('Ocorreu um erro técnico ao gerar a imagem. Verifique o console.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return <p className="page-subtitle" style={{ padding: '20px' }}>Carregando ferramenta...</p>;
    if (!album) return <p className="page-subtitle text-danger" style={{ padding: '20px' }}>Álbum não encontrado.</p>;

    const proxyPhotoUrl = customSettings.photoUrl 
        ? `${axiosInstance.defaults.baseURL}proxy-image/?url=${encodeURIComponent(customSettings.photoUrl)}`
        : '';

    const STORY_WIDTH = 320;
    const STORY_HEIGHT = 568;

    /* A informação escrita na foto (Canvas interno) mantém estilos inline para funcionar no toJpeg */
    const PhotoFooterInfo = () => (
        <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            padding: '30px 15px 15px 15px', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)', 
            color: '#fff', textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: '3px',
            zIndex: 2
        }}>
            {customSettings.photographerName && (
                <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500', opacity: 0.9 }}>
                    📷 {customSettings.photographerName}
                </div>
            )}
            <h3 style={{ margin: '1px 0 4px 0', color: '#fff', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1.2' }}>
                {customSettings.title}
            </h3>
            {customSettings.locationText && (
                <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
                    📍 {customSettings.locationText}
                </div>
            )}
            {customSettings.dateText && (
                <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
                    🗓️ {customSettings.dateText}
                </div>
            )}
        </div>
    );

    const selectedImageStyle = { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 };

    return (
        <div className="dashboard-page-content promo-art-wrapper">
            
            <div className="dash-header-box">
                <h2 className="dash-main-title">Criar arte de divulgação</h2>
                <Link to={`/dashboard/albuns/${id}`} className="button-outline">
                    Voltar para o Álbum
                </Link>
            </div>

            <div className="promo-layout-grid">
                
                {/* MENU LATERAL - OPÇÕES DE EDIÇÃO */}
                <div className="promo-options-card">
                    
                    <h3 className="promo-section-title">1. Escolher moldura (template)</h3>
                    <div className="promo-template-grid">
                        {Object.values(TEMPLATES).map(tmpl => (
                            <button 
                                key={tmpl.id}
                                onClick={() => setActiveTemplate(tmpl)}
                                className={`promo-template-btn ${activeTemplate.id === tmpl.id ? 'active' : ''}`}
                            >
                                {tmpl.name}
                            </button>
                        ))}
                    </div>

                    <h3 className="promo-section-title">2. Personalizar textos e foto</h3>
                    
                    <form className="promo-edit-form">
                        
                        <label className="promo-label">Título do álbum</label>
                        <input name="title" value={customSettings.title} onChange={handleSettingChange} placeholder="Ex: FUTEBOL 2026" className="promo-input" />
                        
                        <label className="promo-label">Fotógrafo(a)</label>
                        <input name="photographerName" value={customSettings.photographerName} onChange={handleSettingChange} placeholder="Ex: João Silva" className="promo-input" />

                        <label className="promo-label">Local do evento</label>
                        <input name="locationText" value={customSettings.locationText} onChange={handleSettingChange} placeholder="Ex: Estádio do Vale" className="promo-input" />

                        <label className="promo-label">Data / horário</label>
                        <input name="dateText" value={customSettings.dateText} onChange={handleSettingChange} placeholder="Ex: 31/01/2026" className="promo-input" />

                        <label className="promo-label" style={{ marginTop: '8px' }}>Escolher foto do álbum</label>
                        <div className="promo-photo-selector">
                            {album.fotos?.map(foto => (
                                <img 
                                    key={foto.id} 
                                    src={foto.imagem_url} 
                                    alt="Capa" 
                                    onClick={() => setCustomSettings(prev => ({...prev, photoUrl: foto.imagem_url}))}
                                    className={`promo-photo-thumb ${customSettings.photoUrl === foto.imagem_url ? 'selected' : ''}`}
                                />
                            ))}
                        </div>
                    </form>
                </div>

                {/* PREVIEW DO CANVAS */}
                <div className="promo-preview-section">
                    <h3 className="promo-preview-title">Pré-visualização ({activeTemplate.name})</h3>
                    
                    <div className="promo-canvas-container" style={{ width: `${STORY_WIDTH}px`, height: `${STORY_HEIGHT}px` }}>
                        
                        {/* ESTE É O BLOCO GERADOR DA IMAGEM - Usa estilos inline porque o toJpeg não lê CSS externo! */}
                        <div ref={cardRef} style={{ 
                            width: `${STORY_WIDTH}px`, height: `${STORY_HEIGHT}px`, position: 'relative', 
                            backgroundColor: '#f5f7fa', boxSizing: 'border-box',
                            backgroundImage: `url(${activeTemplate.bgUrl})`, 
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                            
                            {activeTemplate.id === TEMPLATES.PHONE_MOCKUP.id && (
                                <div style={{ position: 'absolute', top: '25px', left: '15px', right: '15px', bottom: '100px', zIndex: 1 }}>
                                    <div style={{ position: 'absolute', top: '40px', left: '60px', right: '60px', bottom: '40px', borderRadius: '25px', overflow: 'hidden', backgroundColor: '#eee' }}>
                                        {isPhotoPreloaded && <img src={proxyPhotoUrl} alt="Foto" style={selectedImageStyle} />}
                                        <PhotoFooterInfo /> 
                                    </div>
                                    <img src={TEMPLATES.PHONE_MOCKUP.overlayUrl} alt="Celular" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 3, objectFit: 'contain' }} />
                                </div>
                            )}

                            {activeTemplate.id === TEMPLATES.CAROUSEL_MIMIC.id && (
                                <div style={{ position: 'absolute', top: '120px', left: '30px', right: '30px', height: '280px', zIndex: 1, border: '10px solid #fff', borderRadius: '5px' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#eee', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                                        {isPhotoPreloaded && <img src={proxyPhotoUrl} alt="Foto" style={selectedImageStyle} />}
                                        <PhotoFooterInfo />
                                    </div>
                                    <img src={TEMPLATES.CAROUSEL_MIMIC.overlayUrl} alt="Carrossel" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 3, objectFit: 'contain' }} />
                                </div>
                            )}

                            {activeTemplate.id === TEMPLATES.CARD_FLOATING.id && (
                                <div style={{ 
                                    position: 'absolute', top: '40px', left: '20px', right: '20px', bottom: '110px',
                                    backgroundColor: '#eee', borderRadius: '16px', overflow: 'hidden', zIndex: 1,
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '4px solid #fff'
                                }}>
                                    {isPhotoPreloaded && <img src={proxyPhotoUrl} alt="Foto" style={selectedImageStyle} />}
                                    <PhotoFooterInfo />
                                </div>
                            )}
                            
                            <div style={{ position: 'absolute', bottom: '50px', width: '100%', textAlign: 'center', padding: '0 25px', boxSizing: 'border-box', zIndex: 10 }}>
                                <div style={{
                                    width: '100%', padding: '12px 10px', backgroundColor: 'transparent', 
                                    color: corPrincipal, border: `2px solid #fff`, 
                                    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase'
                                }}>
                                    LINK 
                                </div>
                            </div>

                        </div>
                    </div>

                    <button 
                        onClick={handleGenerateImage} 
                        disabled={isGenerating || !customSettings.photoUrl || !isPhotoPreloaded} 
                        className="promo-download-btn"
                    >
                        {isGenerating ? '⏳ Gerando...' : (!isPhotoPreloaded ? '⏳ Preparando...' : `📥 Baixar Arte (${activeTemplate.name})`)}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PromotionalArtCreatorPage;