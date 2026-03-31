// src/pages/dashboard/PromotionalArtCreatorPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toJpeg } from 'html-to-image';
import { toast } from 'react-toastify'; 

// --- DEFINIÇÃO DOS TEMPLATES DISPONÍVEIS ---
// Certifique-se de colocar estas imagens PNG na sua pasta 'public'
const TEMPLATES = {
    CARD_FLOATING: { 
        id: 'card_floating', 
        name: 'Clássico (Flutuante)', 
        bgUrl: '/images/fundo-arte.png', 
        overlayUrl: null 
    },
    PHONE_MOCKUP: { 
        id: 'phone_mockup', 
        name: 'Moldura Celular', 
        bgUrl: '/images/fundo-arte.png', 
        overlayUrl: '/images/phone-frame.png' 
    },
    CAROUSEL_MIMIC: { 
        id: 'carousel_mimic', 
        name: 'Moldura Quadrada', 
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

    // --- COR PADRÃO DO SITE ATUALIZADA ---
    const corPrincipal = '#6c0464'; 
    // -------------------------------------
    
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

    const [activeTemplate, setActiveTemplate] = useState(TEMPLATES.CARD_FLOATING);

    // --- STATE SIMPLIFICADO: CORES E CTA AGORA SÃO FIXOS ---
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
            
            // --- AGORA ESTÁ PERFEITO! O React lê exatamente o que o Django mandou ---
            const fotografo = response.data.fotografo_nome || ''; 
            const local = response.data.local || ''; 
            // -------------------------------------------------------------------------

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

    const publicAlbumLink = `${frontendUrl}/album/${id}`;

    if (loading) return <p style={{ padding: '20px' }}>Carregando ferramenta...</p>;
    if (!album) return <p style={{ padding: '20px', color: 'red' }}>Álbum não encontrado.</p>;

    const proxyPhotoUrl = customSettings.photoUrl 
        ? `${axiosInstance.defaults.baseURL}/proxy-image/?url=${encodeURIComponent(customSettings.photoUrl)}`
        : '';

    const STORY_WIDTH = 320;
    const STORY_HEIGHT = 568;

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
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            <div className="page-header" style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <h2 style={{ color: corPrincipal, margin: 0, fontSize: '24px' }}>🎨 Criar Arte de Divulgação</h2>
                <Link to={`/dashboard/albuns/${id}`} className="button-outline" style={{ textDecoration: 'none' }}>
                    Voltar para o Álbum
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                
                <div style={{ flex: '1 1 350px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    
                    <h3 style={{ marginTop: 0, color: corPrincipal, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>1. Escolher Moldura (Template)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px', marginBottom: '25px' }}>
                        {Object.values(TEMPLATES).map(tmpl => (
                            <button 
                                key={tmpl.id}
                                onClick={() => setActiveTemplate(tmpl)}
                                style={{
                                    padding: '10px',
                                    backgroundColor: activeTemplate.id === tmpl.id ? corPrincipal : '#f0f0f0',
                                    color: activeTemplate.id === tmpl.id ? '#fff' : '#333',
                                    border: `2px solid ${activeTemplate.id === tmpl.id ? corPrincipal : '#ddd'}`,
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tmpl.name}
                            </button>
                        ))}
                    </div>

                    <h3 style={{ marginTop: 0, color: corPrincipal, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>2. Personalizar Textos e Foto</h3>
                    
                    <form className="auth-form" style={{ marginTop: '20px', gap: '12px' }}>
                        
                        <label style={{fontWeight: 'bold', fontSize: '12px', color: '#555'}}>Título do Álbum</label>
                        <input name="title" value={customSettings.title} onChange={handleSettingChange} placeholder="Ex: FUTEBOL 2026" style={{padding: '8px'}} />
                        
                        <label style={{fontWeight: 'bold', fontSize: '12px', color: '#555'}}>Fotógrafo(a)</label>
                        <input name="photographerName" value={customSettings.photographerName} onChange={handleSettingChange} placeholder="Ex: João Silva" style={{padding: '8px'}} />

                        <label style={{fontWeight: 'bold', fontSize: '12px', color: '#555'}}>Local do Evento</label>
                        <input name="locationText" value={customSettings.locationText} onChange={handleSettingChange} placeholder="Ex: Estádio do Vale" style={{padding: '8px'}} />

                        <label style={{fontWeight: 'bold', fontSize: '12px', color: '#555'}}>Data / Horário</label>
                        <input name="dateText" value={customSettings.dateText} onChange={handleSettingChange} placeholder="Ex: 31/01/2026" style={{padding: '8px'}} />

                        {/* --- CAMPOS DE CORES E TEXTO CTA REMOVIDOS DAQUI --- */}

                        <label style={{fontWeight: 'bold', fontSize: '12px', color: '#555', marginTop: '8px'}}>Escolher Foto do Álbum</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '5px', border: '1px solid #eee', borderRadius: '8px' }}>
                            {album.fotos?.map(foto => (
                                <img 
                                    key={foto.id} 
                                    src={foto.imagem_url} 
                                    alt="Capa" 
                                    onClick={() => setCustomSettings(prev => ({...prev, photoUrl: foto.imagem_url}))}
                                    style={{ 
                                        width: '100%', aspectRatio: '1/1', objectFit: 'cover', cursor: 'pointer', borderRadius: '4px',
                                        // A Borda de seleção usa a cor fixa
                                        border: customSettings.photoUrl === foto.imagem_url ? `3px solid ${corPrincipal}` : '2px solid transparent',
                                        transition: 'all 0.1s'
                                    }} 
                                />
                            ))}
                        </div>
                    </form>
                </div>

                <div style={{ flex: '2 1 500px', textAlign: 'center' }}>
                    <h3 style={{ color: '#666', marginBottom: '20px', fontWeight: 'normal' }}>Pré-visualização ({activeTemplate.name})</h3>
                    
                    <div style={{ 
                        width: `${STORY_WIDTH}px`, height: `${STORY_HEIGHT}px`, margin: '0 auto', 
                        borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', overflow: 'hidden' 
                    }}>
                        
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
                            
                            {/* --- ESPAÇO RESERVADO PARA A FIGURINHA DE LINK (TEXTO E COR FIXOS) --- */}
                            <div style={{ position: 'absolute', bottom: '50px', width: '100%', textAlign: 'center', padding: '0 25px', boxSizing: 'border-box', zIndex: 10 }}>
                                <div style={{
                                    width: '100%', padding: '12px 10px', 
                                    backgroundColor: 'transparent', 
                                    color: corPrincipal, // Usa corPrincipal fixa
                                    border: `2px solid #fff`, // Usa corPrincipal fixa
                                    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px',
                                    textTransform: 'uppercase'
                                }}>
                                    LINK {/* Texto fixo */}
                                </div>
                            </div>
                            {/* ---------------------------------------------------------------- */}

                        </div>
                    </div>

                    <button 
                        onClick={handleGenerateImage} 
                        disabled={isGenerating || !customSettings.photoUrl || !isPhotoPreloaded} 
                        style={{ 
                            marginTop: '25px', padding: '12px 25px', 
                            backgroundColor:'#ffffff', 
                            color: '#6c0464', 
                            border: '2px solid #6c0464', borderRadius: '50px', fontWeight: 'bold', fontSize: '15px', 
                            cursor: (!isPhotoPreloaded) ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s',
                            opacity: (isGenerating || !customSettings.photoUrl || !isPhotoPreloaded) ? 0.6 : 1
                        }}
                    >
                        {isGenerating ? '⏳ Gerando...' : (!isPhotoPreloaded ? '⏳ Preparando...' : `📥 Baixar Arte (${activeTemplate.name})`)}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PromotionalArtCreatorPage;