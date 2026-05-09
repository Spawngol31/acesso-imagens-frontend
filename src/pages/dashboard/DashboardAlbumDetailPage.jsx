// src/pages/dashboard/DashboardAlbumDetailPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// --- Componente de Formulário para Edição Individual ---
function MediaEditForm({ media, mediaType, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        legenda: media.legenda || media.titulo || '',
        preco: media.preco || '0.00',
        rotacao: media.rotacao || 0,
    });

    useEffect(() => {
        setFormData({
            legenda: media.legenda || media.titulo || '',
            preco: media.preco || '0.00',
            rotacao: media.rotacao || 0,
        });
    }, [media]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRotate = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            rotacao: (prevFormData.rotacao + 90) % 360
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(media.id, formData);
    };

    // Estilo blindado para os inputs (Evita modo escuro do navegador)
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#fff', color: '#333', colorScheme: 'light' };

    return (
        <div className="inline-edit-form">
            <h3 style={{ color: '#6c0464', marginTop: 0 }}>Editar {mediaType === 'foto' ? 'Foto' : 'Vídeo'}</h3>
            <form onSubmit={handleSubmit}>
                {mediaType === 'foto' && media.imagem_url && (
                    <div className="rotation-preview-wrapper" style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <img 
                            src={media.imagem_url} 
                            alt="Pré-visualização da Foto" 
                            className="rotation-preview-image"
                            style={{ transform: `rotate(${formData.rotacao}deg)`, maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }}
                        />
                    </div>
                )}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>{mediaType === 'foto' ? 'Legenda' : 'Título'}</label>
                    <input name="legenda" value={formData.legenda} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Preço (R$)</label>
                    <input name="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} required style={inputStyle} />
                </div>
                {mediaType === 'foto' && (
                    <div className="rotation-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>Rotação: {formData.rotacao}°</label>
                        <button type="button" onClick={handleRotate} style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #6c0464', backgroundColor: 'white', color: '#6c0464', fontWeight: 'bold', cursor: 'pointer' }}>Girar ↺</button>
                    </div>
                )}
                <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f8f9fa', cursor: 'pointer', fontWeight: 'bold', color: '#555' }}>Cancelar</button>
                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#6c0464', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Salvar</button>
                </div>
            </form>
        </div>
    );
}

// --- Componente Principal da Página ---
function DashboardAlbumDetailPage() {
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    
    // Controla qual janela global está aberta
    const [activeGlobalModal, setActiveGlobalModal] = useState(null); 

    // Estados para Upload de Fotos
    const [fotoFiles, setFotoFiles] = useState([]);
    const [meusJornais, setMeusJornais] = useState([]); 
    const [selectedJornais, setSelectedJornais] = useState([]);
    const [fotoPreco, setFotoPreco] = useState('15.00');
    const [fotoLegenda, setFotoLegenda] = useState('');
    const [isUploadingFotos, setIsUploadingFotos] = useState(false);
    const [uploadStatusMsg, setUploadStatusMsg] = useState('');

    // Estados para Upload de Vídeos
    const [stagedVideos, setStagedVideos] = useState([]);
    const [isUploadingVideos, setIsUploadingVideos] = useState(false);
    const [uploadProgressVideos, setUploadProgressVideos] = useState(0);
    
    // Outros estados
    const [isPolling, setIsPolling] = useState(false);
    const [editingMedia, setEditingMedia] = useState(null);
    const [mediaType, setMediaType] = useState('');
    const [newPhotoPrice, setNewPhotoPrice] = useState('');
    const [newVideoPrice, setNewVideoPrice] = useState('');

    // Estados para o Menu de Opções da Mídia
    const [actionModalMedia, setActionModalMedia] = useState(null);
    const [actionModalType, setActionModalType] = useState(''); 

    // Estados dos Modais de Confirmação
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fotoParaMudar, setFotoParaMudar] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState(null);

    const corPrincipal = '#6c0464';

    // 🚀 ESTILOS PADRÃO BLINDADOS (Rosado e Inputs brancos)
    const overlayRosado = 'rgba(108, 4, 100, 0.4)';
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#fff', color: '#333', colorScheme: 'light' };
    
    const globalModalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: overlayRosado, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, backdropFilter: 'blur(3px)' };
    const globalModalContent = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
    const globalModalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #fbf0fa', paddingBottom: '15px', marginBottom: '20px' };


    const fetchAlbumDetails = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/albuns/${id}/?timestamp=${new Date().getTime()}`);
            setAlbum(response.data);
        } catch (error) {
            console.error("Erro ao buscar detalhes do álbum:", error);
            toast.error("Erro ao carregar os detalhes do álbum.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAlbumDetails();
    }, [fetchAlbumDetails]);

    useEffect(() => {
        const fetchJornais = async () => {
            try {
                const resJornais = await axiosInstance.get('/admin/jornais-parceiros/meus_jornais/');
                setMeusJornais(resJornais.data);
            } catch (error) {
                console.error("Erro ao buscar jornais:", error);
            }
        };
        fetchJornais();
    }, []);

    const toggleJornal = (jornalId) => {
        setSelectedJornais(prev => 
            prev.includes(jornalId) 
            ? prev.filter(id => id !== jornalId) 
            : [...prev, jornalId] 
        );
    };

    const pollingIntervalRef = useRef(null);

    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        setIsPolling(true);
        let pollCount = 0;
        const maxPolls = 24; 
        
        pollingIntervalRef.current = setInterval(() => {
            fetchAlbumDetails();
            pollCount++;
            if (pollCount >= maxPolls) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
                setIsPolling(false);
            }
        }, 5000);
    }, [fetchAlbumDetails]);

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const handlePhotoSubmit = async (e) => {
        e.preventDefault();
        if (fotoFiles.length === 0) { toast.info("Por favor, selecione pelo menos um ficheiro de foto."); return; }
        
        setIsUploadingFotos(true);
        let fotosEnviadasComSucesso = 0;
        let fotosComErro = 0;

        for (let i = 0; i < fotoFiles.length; i++) {
            const file = fotoFiles[i];
            setUploadStatusMsg(`A enviar a foto ${i + 1} de ${fotoFiles.length}...`);
            
            const formData = new FormData();
            formData.append('album', id);
            formData.append('imagem', file);
            formData.append('preco', fotoPreco);
            formData.append('legenda', fotoLegenda);

            if (selectedJornais.length > 0) formData.append('jornais', selectedJornais.join(','));
            
            try {
                await axiosInstance.post('/fotos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                fotosEnviadasComSucesso++;
            } catch (error) { 
                fotosComErro++;
            }
        }
        
        setIsUploadingFotos(false);
        setUploadStatusMsg('');
        
        if (fotosComErro > 0) {
            toast.error(`${fotosEnviadasComSucesso} fotos enviadas. ${fotosComErro} fotos falharam.`);
        } else {
            toast.success(`Sucesso! ${fotosEnviadasComSucesso} foto(s) enviadas e em processamento.`);
            setActiveGlobalModal(null); 
        }
        
        setFotoFiles([]);
        fetchAlbumDetails();
        startPolling();
    };

    const handleVideoSelect = (e) => {
        const files = Array.from(e.target.files);
        const newStagedVideos = files.map(file => ({ id: Date.now() + Math.random(), videoFile: file, titulo: '', preco: '50.00' }));
        setStagedVideos(prev => [...prev, ...newStagedVideos]);
    };

    const handleStagedVideoChange = (id, field, value) => { setStagedVideos(prev => prev.map(video => (video.id === id ? { ...video, [field]: value } : video))); };
    const removeStagedVideo = (id) => { setStagedVideos(prev => prev.filter(video => video.id !== id)); };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        if (stagedVideos.length === 0) { toast.info("Nenhum vídeo selecionado para envio."); return; }
        
        for (const video of stagedVideos) {
            if (!video.titulo) { toast.error(`Por favor, adicione um título para o vídeo: ${video.videoFile.name}`); return; }
        }
        
        setIsUploadingVideos(true);
        setUploadProgressVideos(0);
        
        for (let i = 0; i < stagedVideos.length; i++) {
            const video = stagedVideos[i];
            setUploadProgressVideos(i + 1);
            const formData = new FormData();
            formData.append('album', id);
            formData.append('titulo', video.titulo);
            formData.append('preco', video.preco);
            formData.append('arquivo_video', video.videoFile);
            
            try {
                await axiosInstance.post('/dashboard/videos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } catch (error) { 
                toast.error(`Erro ao enviar o vídeo ${video.videoFile.name}`);
            }
        }
        
        setIsUploadingVideos(false);
        toast.success(`${stagedVideos.length} vídeo(s) enviados com sucesso!`);
        
        setStagedVideos([]);
        setActiveGlobalModal(null); 
        fetchAlbumDetails();
        startPolling();
    };

    const handleToggleArchivePhotoClick = (foto) => {
        setFotoParaMudar(foto);
        setIsConfirmModalOpen(true);
    };

    const confirmarArquivamentoFoto = async () => {
        if (!fotoParaMudar) return;
        const acao = fotoParaMudar.is_arquivado ? 'desarquivar' : 'arquivar';
        try {
            await axiosInstance.post(`/dashboard/fotos/${fotoParaMudar.id}/${acao}/`);
            fetchAlbumDetails();
            toast.success(`Foto ${fotoParaMudar.is_arquivado ? 'restaurada' : 'arquivada'} com sucesso.`);
        } catch (error) {
            toast.error(`Erro ao tentar ${acao} a foto.`);
        } finally {
            setIsConfirmModalOpen(false);
            setFotoParaMudar(null);
        }
    };

    const handleSetCover = async (fotoId) => {
        const toastId = toast.loading("A definindo nova capa...");
        try {
            await axiosInstance.post(`/dashboard/albuns/${id}/definir_capa/`, { foto_id: fotoId });
            toast.update(toastId, { render: "⭐ Capa do álbum atualizada com sucesso!", type: "success", isLoading: false, autoClose: 3000 });
            fetchAlbumDetails();
        } catch (error) {
            toast.update(toastId, { render: "Erro ao definir a foto como capa.", type: "error", isLoading: false, autoClose: 4000 });
        }
    };
    
    const handleDeleteMediaClick = (mediaId, type) => {
        setMediaToDelete({ id: mediaId, type });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteMedia = async () => {
        if (!mediaToDelete) return;
        const { id: mediaId, type } = mediaToDelete;
        try {
            await axiosInstance.delete(`/dashboard/${type}s/${mediaId}/`);
            fetchAlbumDetails();
            toast.success(`${type === 'foto' ? 'Foto apagada' : 'Vídeo apagado'} com sucesso.`);
        } catch (error) {
            if (error.response?.status === 500) {
                toast.error(`Erro: ${type === 'foto' ? 'Esta foto' : 'Este vídeo'} não pode ser apagado pois já faz parte de um pedido de cliente. Por favor, use a opção 'Arquivar'.`);
            } else {
                toast.error(`Erro ao apagar ${type}.`);
            }
        } finally {
            setIsDeleteModalOpen(false);
            setMediaToDelete(null);
        }
    };

    const handleEditSubmit = async (mediaId, formData) => {
        try {
            const dataToSubmit = mediaType === 'video' ? { titulo: formData.legenda, preco: formData.preco } : formData;
            await axiosInstance.patch(`/dashboard/${mediaType}s/${mediaId}/`, dataToSubmit);
            setEditingMedia(null);
            fetchAlbumDetails();
            toast.success("Mídia atualizada com sucesso!");
        } catch (error) { 
            toast.error("Erro ao salvar alterações.");
        }
    };

    const openEditForm = (media, type) => {
        setEditingMedia(media);
        setMediaType(type);
    };

    const handleBulkUpdatePhotos = async (e) => {
        e.preventDefault();
        if (!newPhotoPrice || parseFloat(newPhotoPrice) < 0) { toast.info("Por favor, insira um preço válido."); return; }
        try {
            const response = await axiosInstance.post(`/dashboard/albuns/${id}/bulk_update_photos/`, { preco: newPhotoPrice });
            toast.success(response.data.status);
            fetchAlbumDetails();
            setNewPhotoPrice('');
            setActiveGlobalModal(null); 
        } catch (error) {
            toast.error("Erro ao atualizar preços.");
        }
    };

    const handleBulkUpdateVideos = async (e) => {
        e.preventDefault();
        if (!newVideoPrice || parseFloat(newVideoPrice) < 0) { toast.info("Por favor, insira um preço válido."); return; }
        try {
            const response = await axiosInstance.post(`/dashboard/albuns/${id}/bulk_update_videos/`, { preco: newVideoPrice });
            toast.success(response.data.status);
            fetchAlbumDetails();
            setNewVideoPrice('');
            setActiveGlobalModal(null); 
        } catch (error) {
            toast.error("Erro ao atualizar preços.");
        }
    };

    if (loading) return <p>Carregando...</p>;
    if (!album) return <p>Álbum não encontrado ou falha ao carregar.</p>;

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            <div className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', color: corPrincipal, margin: '0 0 10px 0' }}>🖼️ {album.titulo}</h1>
                    <p style={{ color: '#555', margin: 0 }}>{album.descricao}</p>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    <Link to="/dashboard/albuns" className="button-outline" style={{ textDecoration: 'none' }}>⬅️ Voltar</Link>
                    <button onClick={() => setActiveGlobalModal('uploadFotos')} className="create-button">➕ Adicionar Fotos</button>
                    <button onClick={() => setActiveGlobalModal('uploadVideos')} className="create-button">➕ Adicionar Vídeos</button>
                    <button onClick={() => setActiveGlobalModal('bulkEditFotos')} className="button-outline">💲 Editar Preço (Fotos)</button>
                    <button onClick={() => setActiveGlobalModal('bulkEditVideos')} className="button-outline">💲 Editar Preço (Vídeos)</button>
                    <Link to={`/dashboard/albuns/${id}/arte-promocional`} className="create-button" style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8', textDecoration: 'none' }}>🔗 Click & Share</Link>
                </div>
            </div>           
            
            <h3 style={{ color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '10px' }}>📷 Galeria de Fotos ({album.fotos?.length || 0})</h3>
            <div className="media-grid">
                {album.fotos?.map(foto => (
                    <div key={foto.id} className={`dashboard-media-card ${foto.is_arquivado ? 'archived' : ''}`}>
                        <div className="dashboard-media-image">
                           <img src={foto.imagem_url} alt={foto.legenda} style={{ transform: `rotate(${foto.rotacao}deg)` }} />
                        </div>
                        <div className="dashboard-media-info">
                            <p>R$ {parseFloat(foto.preco).toFixed(2)}</p>
                            {foto.is_arquivado && <span className="status-archived-small">Arquivado</span>}
                            
                            <div className="media-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                <button onClick={() => { setActionModalMedia(foto); setActionModalType('foto'); }} className="button-outline" style={{ width: '100%', borderRadius: '20px', padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                                    ⚙️ Opções
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {album.fotos?.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Nenhuma foto neste álbum.</p>}
            
            <h3 style={{ color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '10px', marginTop: '40px' }}>🎬 Galeria de Vídeos ({album.videos?.length || 0})</h3>
            <div className="media-grid" style={{paddingBottom: '2rem'}}>
                {album.videos?.map(video => (
                    <div key={video.id} className="dashboard-media-card" >
                        <div className="dashboard-media-image">
                           <img src={video.miniatura_url} alt={video.titulo} />
                        </div>
                        <div className="dashboard-media-info">
                            <p className="media-title">{video.titulo}</p>
                            <p>R$ {parseFloat(video.preco).toFixed(2)}</p>
                            
                            <div className="media-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                <button onClick={() => { setActionModalMedia(video); setActionModalType('video'); }} className="button-outline" style={{ width: '100%', borderRadius: '20px', padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                                    ⚙️ Opções
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {album.videos?.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Nenhum vídeo neste álbum.</p>}

            {/* ========================================================================= */}
            {/* 🚀 MODAIS GLOBAIS COM FUNDO ROSADO */}
            {/* ========================================================================= */}
            
            {activeGlobalModal === 'uploadFotos' && (
                <div style={globalModalOverlay}>
                    <div style={globalModalContent}>
                        <div style={globalModalHeader}>
                            <h3 style={{ color: corPrincipal, margin: 0 }}>✙ Adicionar Novas Fotos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} disabled={isUploadingFotos} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>
                        <form onSubmit={handlePhotoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ padding: '15px', border: '2px dashed #e1bce0', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fdfbfe' }}>
                                <label htmlFor="photo-upload" className="create-button" style={{ display: 'inline-block', cursor: 'pointer' }}>Selecionar Ficheiros...</label>
                                <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple disabled={isUploadingFotos} style={{ display: 'none' }} />
                                {fotoFiles.length > 0 && <p style={{ color: '#28a745', fontWeight: 'bold', margin: '10px 0 0 0', fontSize: '13px' }}>✅ {fotoFiles.length} foto(s) selecionada(s)</p>}
                            </div>
                            
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Legenda Padrão (Opcional)</label>
                                <input type="text" style={inputStyle} onChange={(e) => setFotoLegenda(e.target.value)} disabled={isUploadingFotos} />
                            </div>
                            
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Preço para todas (R$)</label>
                                <input type="number" step="0.01" style={inputStyle} value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required disabled={isUploadingFotos} />
                            </div>
                            
                            {isUploadingFotos && <div style={{ padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', fontWeight: 'bold', textAlign: 'center' }}>⏳ {uploadStatusMsg}</div>}
                            
                            {meusJornais.length > 0 && (
                                <div style={{ padding: '15px', backgroundColor: '#fbf0fa', borderRadius: '8px', border: '1px solid #e1bce0' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: corPrincipal }}>🚀 Distribuir via FTP (Opcional)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {meusJornais.map(jornal => (
                                            <label key={jornal.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                                <input type="checkbox" checked={selectedJornais.includes(jornal.id)} onChange={() => toggleJornal(jornal.id)} disabled={isUploadingFotos} style={{ width: '18px', height: '18px' }} />
                                                📰 {jornal.nome_jornal}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="create-button" disabled={isUploadingFotos || fotoFiles.length === 0} style={{ opacity: isUploadingFotos ? 0.6 : 1, width: '100%', padding: '15px', fontSize: '16px' }}>
                                {isUploadingFotos ? '🔒 A enviar... Aguarde.' : `Enviar ${fotoFiles.length || 0} Foto(s)`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'uploadVideos' && (
                <div style={globalModalOverlay}>
                    <div style={globalModalContent}>
                        <div style={globalModalHeader}>
                            <h3 style={{ color: corPrincipal, margin: 0 }}>✙ Adicionar Novos Vídeos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} disabled={isUploadingVideos} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ padding: '15px', border: '2px dashed #e1bce0', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fdfbfe' }}>
                                <label htmlFor="video-upload" className="create-button" style={{ display: 'inline-block', cursor: 'pointer' }}>Selecionar Ficheiros de Vídeo...</label>
                                <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple disabled={isUploadingVideos} style={{ display: 'none' }} />
                            </div>
                            
                            {stagedVideos.length > 0 && (
                                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <h4 style={{ marginTop: 0 }}>Vídeos selecionados:</h4>
                                    {stagedVideos.map((video) => (
                                        <div key={video.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 5px 0', color: corPrincipal }}>{video.videoFile.name}</p>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="text" placeholder="Título" style={{...inputStyle, flex: 2}} onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} required disabled={isUploadingVideos} />
                                                <input type="number" step="0.01" placeholder="R$" value={video.preco} style={{...inputStyle, flex: 1}} onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} required disabled={isUploadingVideos} />
                                            </div>
                                            <button type="button" onClick={() => removeStagedVideo(video.id)} disabled={isUploadingVideos} style={{ marginTop: '8px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remover</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {isUploadingVideos && <p style={{ fontWeight: 'bold', color: corPrincipal, textAlign: 'center' }}>⏳ Enviando e processando vídeo {uploadProgressVideos} de {stagedVideos.length}...</p>}
                            
                            <button onClick={handleVideoSubmit} className="create-button" disabled={isUploadingVideos || stagedVideos.length === 0} style={{ opacity: isUploadingVideos ? 0.6 : 1, width: '100%', padding: '15px', fontSize: '16px' }}>
                                {isUploadingVideos ? '🔒 A enviar... Aguarde.' : `Enviar ${stagedVideos.length} Vídeo(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'bulkEditFotos' && (
                <div style={globalModalOverlay}>
                    <div style={globalModalContent}>
                        <div style={globalModalHeader}>
                            <h3 style={{ color: corPrincipal, margin: 0 }}>💲 Preço de Todas as Fotos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>
                        <form onSubmit={handleBulkUpdatePhotos} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <p style={{ color: '#555', margin: 0 }}>Atualizar o preço de <strong>todas</strong> as fotos deste álbum de uma só vez.</p>
                            <input type="number" step="0.01" min="0" value={newPhotoPrice} onChange={(e) => setNewPhotoPrice(e.target.value)} placeholder="Novo preço (R$)" required style={{ ...inputStyle, padding: '12px', fontSize: '16px' }} />
                            <button type="submit" className="create-button" style={{ padding: '12px' }}>Confirmar Alteração</button>
                        </form>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'bulkEditVideos' && (
                <div style={globalModalOverlay}>
                    <div style={globalModalContent}>
                        <div style={globalModalHeader}>
                            <h3 style={{ color: corPrincipal, margin: 0 }}>💲 Preço de Todos os Vídeos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>
                        <form onSubmit={handleBulkUpdateVideos} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <p style={{ color: '#555', margin: 0 }}>Atualizar o preço de <strong>todos</strong> os vídeos deste álbum de uma só vez.</p>
                            <input type="number" step="0.01" min="0" value={newVideoPrice} onChange={(e) => setNewVideoPrice(e.target.value)} placeholder="Novo preço (R$)" required style={{ ...inputStyle, padding: '12px', fontSize: '16px' }} />
                            <button type="submit" className="create-button" style={{ padding: '12px' }}>Confirmar Alteração</button>
                        </form>
                    </div>
                </div>
            )}

            {actionModalMedia && (
                <div style={globalModalOverlay}>
                    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', maxWidth: '350px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#6c0464', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #fbf0fa', paddingBottom: '10px' }}>
                            ⚙️ Opções da {actionModalType === 'foto' ? 'Foto' : 'Vídeo'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {actionModalType === 'foto' && (
                                <>
                                    <button onClick={() => { handleSetCover(actionModalMedia.id); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #6c0464', backgroundColor: '#fbf0fa', color: '#6c0464', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>⭐ Definir como Capa</button>
                                    <button onClick={() => { handleToggleArchivePhotoClick(actionModalMedia); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2a03f', backgroundColor: '#fcf6ec', color: '#b97a00', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>📦 {actionModalMedia.is_arquivado ? 'Restaurar Foto na Loja' : 'Arquivar (Ocultar da Loja)'}</button>
                                </>
                            )}
                            <button onClick={() => { openEditForm(actionModalMedia, actionModalType); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #17a2b8', backgroundColor: '#e2f3f5', color: '#0c5460', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>✏️ Editar Informações</button>
                            <button onClick={() => { handleDeleteMediaClick(actionModalMedia.id, actionModalType); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dc3545', backgroundColor: '#f8d7da', color: '#721c24', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>🗑️ Excluir Definitivamente</button>
                        </div>
                        <button onClick={() => setActionModalMedia(null)} style={{ marginTop: '25px', padding: '12px', borderRadius: '20px', border: 'none', backgroundColor: '#6c757d', color: 'white', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>Voltar</button>
                    </div>
                </div>
            )}

            {editingMedia && (
                <div style={globalModalOverlay}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <MediaEditForm media={editingMedia} mediaType={mediaType} onSubmit={handleEditSubmit} onCancel={() => setEditingMedia(null)} />
                    </div>
                </div>
            )}

            {isConfirmModalOpen && fotoParaMudar && (
                <div style={globalModalOverlay}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#6c0464', marginTop: 0 }}>{fotoParaMudar.is_arquivado ? 'Restaurar Foto?' : 'Arquivar Foto?'}</h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            {fotoParaMudar.is_arquivado ? "Tem certeza que deseja restaurar esta foto?" : "Tem certeza que deseja arquivar esta foto?"}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => { setIsConfirmModalOpen(false); setFotoParaMudar(null); }} className="button-outline" style={{ padding: '10px 20px'}}>Cancelar</button>
                            <button onClick={confirmarArquivamentoFoto} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: fotoParaMudar.is_arquivado ? '#28a745' : '#e2a03f', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                {fotoParaMudar.is_arquivado ? 'Sim, Restaurar' : 'Sim, Arquivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && mediaToDelete && (
                <div style={globalModalOverlay}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Excluir {mediaToDelete.type === 'foto' ? 'Foto' : 'Vídeo'}?</h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            Tem certeza que deseja APAGAR {mediaToDelete.type === 'foto' ? 'esta foto' : 'este vídeo'}? Esta ação é PERMANENTE e não pode ser desfeita.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => { setIsDeleteModalOpen(false); setMediaToDelete(null); }} className="button-outline" style={{ padding: '10px 20px'}}>Cancelar</button>
                            <button onClick={confirmDeleteMedia} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default DashboardAlbumDetailPage;