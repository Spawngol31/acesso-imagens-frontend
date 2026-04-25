// src/pages/dashboard/DashboardAlbumDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// --- Componente de Formulário para Edição ---
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

    return (
        <div className="inline-edit-form">
            <h3>Editar {mediaType === 'foto' ? 'Foto' : 'Vídeo'}</h3>
            <form onSubmit={handleSubmit}>
                {mediaType === 'foto' && media.imagem_url && (
                    <div className="rotation-preview-wrapper">
                        <img 
                            src={media.imagem_url} 
                            alt="Pré-visualização da Foto" 
                            className="rotation-preview-image"
                            style={{ transform: `rotate(${formData.rotacao}deg)` }}
                        />
                    </div>
                )}
                <input name="legenda" value={formData.legenda} onChange={handleChange} placeholder={mediaType === 'foto' ? 'Legenda' : 'Título'} />
                <input name="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} placeholder="Preço" required />
                {mediaType === 'foto' && (
                    <div className="rotation-control">
                        <label>Rotação: {formData.rotacao}°</label>
                        <button type="button" onClick={handleRotate} className="rotate-button">Girar ↺</button>
                    </div>
                )}
                <div className="form-actions">
                    <button type="button" onClick={onCancel} className='cancel-button'>Cancelar</button>
                    <button type="submit" className='save-button'>Salvar</button>
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
    
    // Estados para Upload de Fotos
    const [fotoFiles, setFotoFiles] = useState([]);
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

    // --- ESTADOS DOS MODAIS DE CONFIRMAÇÃO ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fotoParaMudar, setFotoParaMudar] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState(null);

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

    const pollingIntervalRef = useRef(null);

    const startPolling = useCallback(() => {
        // Se já existe um temporizador a correr, limpe-o antes de começar um novo!
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        setIsPolling(true);
        let pollCount = 0;
        const maxPolls = 24; // 2 minutos no máximo (5s * 24)
        
        // Guardamos a ID do temporizador no useRef
        pollingIntervalRef.current = setInterval(() => {
            console.log("Verificando atualizações de mídia...");
            fetchAlbumDetails();
            pollCount++;
            
            if (pollCount >= maxPolls) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
                setIsPolling(false);
                console.log("Polling finalizado por timeout.");
            }
        }, 5000);
    }, [fetchAlbumDetails]);

    // 3. (OPCIONAL MAS BOA PRÁTICA) Limpe o temporizador se o utilizador sair da página
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const handlePhotoSubmit = async (e) => {
        e.preventDefault();
        
        if (fotoFiles.length === 0) { 
            toast.info("Por favor, selecione pelo menos um ficheiro de foto."); 
            return; 
        }
        
        setIsUploadingFotos(true);
        let fotosEnviadasComSucesso = 0;
        let fotosComErro = 0;

        for (let i = 0; i < fotoFiles.length; i++) {
            const file = fotoFiles[i];
            
            setUploadStatusMsg(`A enviar a foto ${i + 1} de ${fotoFiles.length}... Por favor, não feche a página!`);
            
            const formData = new FormData();
            formData.append('album', id);
            formData.append('imagem', file);
            formData.append('preco', fotoPreco);
            formData.append('legenda', fotoLegenda);
            
            try {
                await axiosInstance.post('/fotos/upload/', formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' } 
                });
                fotosEnviadasComSucesso++;
            } catch (error) { 
                console.error(`Erro ao enviar a foto ${file.name}:`, error); 
                fotosComErro++;
            }
        }
        
        setIsUploadingFotos(false);
        setUploadStatusMsg('');
        
        if (fotosComErro > 0) {
            toast.error(`${fotosEnviadasComSucesso} fotos enviadas. ${fotosComErro} fotos falharam. Verifique a sua conexão.`);
        } else {
            toast.success(`Sucesso! ${fotosEnviadasComSucesso} foto(s) foram guardadas no servidor e enviadas para a fila de processamento.`);
        }
        
        const photoForm = e.target;
        const fileInput = photoForm.querySelector('#photo-upload');
        if (fileInput) fileInput.value = '';
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
            if (!video.titulo) {
                toast.error(`Por favor, adicione um título para o vídeo: ${video.videoFile.name}`);
                return;
            }
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
                await axiosInstance.post('/dashboard/videos/upload/', formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' } 
                });
            } catch (error) { 
                console.error(`Erro ao enviar o vídeo ${video.videoFile.name}:`, error); 
                toast.error(`Erro ao enviar o vídeo ${video.videoFile.name}`);
            }
        }
        
        setIsUploadingVideos(false);
        toast.success(`${stagedVideos.length} vídeo(s) enviados com sucesso!`);
        
        setStagedVideos([]);
        const videoUploadInput = document.getElementById('video-upload');
        if(videoUploadInput) videoUploadInput.value = '';
        
        fetchAlbumDetails();
        startPolling();
    };

    // --- LÓGICA DO MODAL DE ARQUIVAMENTO DA FOTO ---
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
            console.error(`Erro ao ${acao} foto:`, error);
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
            console.error("Erro ao definir capa:", error);
            toast.update(toastId, { render: "Erro ao definir a foto como capa.", type: "error", isLoading: false, autoClose: 4000 });
        }
    };
    
    // --- LÓGICA DO MODAL DE EXCLUSÃO (FOTO/VÍDEO) ---
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
            console.error(`Erro ao apagar ${type}:`, error);
            if (error.response?.status === 500) {
                toast.error(`Erro: ${type === 'foto' ? 'Esta foto' : 'Este vídeo'} não pode ser apagado pois já faz parte de um pedido de cliente. Por favor, use a opção 'Arquivar' em vez disso.`);
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
            console.error(`Erro ao editar ${mediaType}:`, error); 
            toast.error("Erro ao salvar alterações.");
        }
    };

    const openEditForm = (media, type) => {
        setEditingMedia(media);
        setMediaType(type);
    };

    const handleBulkUpdatePhotos = async (e) => {
        e.preventDefault();
        if (!newPhotoPrice || parseFloat(newPhotoPrice) < 0) {
            toast.info("Por favor, insira um preço válido.");
            return;
        }
        try {
            const response = await axiosInstance.post(`/dashboard/albuns/${id}/bulk_update_photos/`, { preco: newPhotoPrice });
            toast.success(response.data.status);
            fetchAlbumDetails();
            setNewPhotoPrice('');
        } catch (error) {
            console.error("Erro ao atualizar preços das fotos:", error);
            toast.error("Erro ao atualizar preços.");
        }
    };

    const handleBulkUpdateVideos = async (e) => {
        e.preventDefault();
        if (!newVideoPrice || parseFloat(newVideoPrice) < 0) {
            toast.info("Por favor, insira um preço válido.");
            return;
        }
        try {
            const response = await axiosInstance.post(`/dashboard/albuns/${id}/bulk_update_videos/`, { preco: newVideoPrice });
            toast.success(response.data.status);
            fetchAlbumDetails();
            setNewVideoPrice('');
        } catch (error) {
            console.error("Erro ao atualizar preços dos vídeos:", error);
            toast.error("Erro ao atualizar preços.");
        }
    };

    if (loading) return <p>Carregando...</p>;
    if (!album) return <p>Álbum não encontrado ou falha ao carregar.</p>;

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h1 style={{  fontSize: '30px' }}>🖼️ {album.titulo}</h1>
                <Link to="/dashboard/albuns" className="button-outline">Voltar para Meus álbuns</Link>
                <Link 
                    to={`/dashboard/albuns/${id}/arte-promocional`} 
                    className="create-button" 
                >
                    Click & share
                </Link>
            </div>
            <p>{album.descricao}</p>            
            
            <div className="upload-section">
                
                {/* --- FORMULÁRIO DE FOTOS --- */}
                <form onSubmit={handlePhotoSubmit} className="upload-form">
                    <h3>✙ Adicionar novas fotos</h3>
                    <label htmlFor="photo-upload" className="custom-file-upload">Escolher ficheiros</label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple disabled={isUploadingFotos} />
                    {fotoFiles.length > 0 && <span className='file-name'>{fotoFiles.length} foto(s) selecionada(s)</span>}
                    
                    <input type="text" placeholder="Legenda (para todas)" onChange={(e) => setFotoLegenda(e.target.value)} disabled={isUploadingFotos} />
                    <input type="number" step="0.01" placeholder="Preço (para todas)" value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required disabled={isUploadingFotos} />
                    
                    {isUploadingFotos && (
                        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', border: '1px solid #ffeeba', fontWeight: 'bold' }}>
                            ⏳ {uploadStatusMsg}
                        </div>
                    )}
                    
                    <button type="submit" className="upload-submit-button" disabled={isUploadingFotos || fotoFiles.length === 0} style={{ opacity: isUploadingFotos ? 0.6 : 1 }}>
                        {isUploadingFotos ? '🔒 A enviar e salvar... Aguarde.' : `Enviar ${fotoFiles.length || 0} Foto(s)`}
                    </button>
                </form>

                {/* --- FORMULÁRIO DE VÍDEOS --- */}
                <div className="upload-form">
                    <h3>✙ Adicionar novos vídeos</h3>
                    <label htmlFor="video-upload" className="custom-file-upload">Escolher ficheiros</label>
                    <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple disabled={isUploadingVideos} />
                    {stagedVideos.length > 0 && (
                        <div className="staging-area">
                            <h4>Vídeos para enviar:</h4>
                            {stagedVideos.map((video) => (
                                <div key={video.id} className="staged-item">
                                    <p className='staged-item-name'>{video.videoFile.name}</p>
                                    <input type="text" placeholder="Título do vídeo" onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} required disabled={isUploadingVideos} />
                                    <input type="number" step="0.01" value={video.preco} onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} required disabled={isUploadingVideos} />
                                    <button type="button" onClick={() => removeStagedVideo(video.id)} className="remove-button-small" disabled={isUploadingVideos}>Remover</button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {isUploadingVideos && <p style={{ fontWeight: 'bold', color: '#6c0464' }}>⏳ Enviando e processando vídeo {uploadProgressVideos} de {stagedVideos.length}... Por favor, não feche a página.</p>}
                    
                    <button onClick={handleVideoSubmit} className="upload-submit-button" disabled={isUploadingVideos || stagedVideos.length === 0} style={{ opacity: isUploadingVideos ? 0.6 : 1 }}>
                        {isUploadingVideos ? '🔒 A enviar... Aguarde.' : `Enviar ${stagedVideos.length} Vídeo(s)`}
                    </button>
                </div>
            </div>
            
            <hr className="divider" />

            {/* --- EDIÇÃO EM MASSA (PREÇOS) --- */}
            <div className="bulk-edit-section" >
                <form onSubmit={handleBulkUpdatePhotos} className="bulk-edit-form" style={{boxShadow: '0 6px 12px rgba(0,0,0,0.05)'}}>
                    <h3>✍🏻 Editar Preço de Todas as Fotos</h3>
                    <input 
                        type="number" step="0.01" min="0"
                        value={newPhotoPrice}
                        onChange={(e) => setNewPhotoPrice(e.target.value)}
                        placeholder="Novo preço para todas as fotos"
                        required 
                    />
                    <button type="submit" className="button-outline">Atualizar Todas as Fotos</button>
                </form>

                <form onSubmit={handleBulkUpdateVideos} className="bulk-edit-form" style={{boxShadow: '0 6px 12px rgba(0,0,0,0.05)'}}>
                    <h3>✍🏻 Editar Preço de Todos os Vídeos</h3>
                    <input 
                        type="number" step="0.01" min="0"
                        value={newVideoPrice}
                        onChange={(e) => setNewVideoPrice(e.target.value)}
                        placeholder="Novo preço para todos os vídeos"
                        required 
                    />
                    <button type="submit" className="button-outline">Atualizar Todos os Vídeos</button>
                </form>
            </div>

            {/* MODAL DE EDIÇÃO DE MÍDIA */}
            {editingMedia && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <MediaEditForm 
                            media={editingMedia}
                            mediaType={mediaType}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditingMedia(null)}
                        />
                    </div>
                </div>
            )}

            <hr style={{margin: '3rem 0', borderTop: '1px solid #eee', borderBottom: 'none'}} />
            <h2>📂 Conteúdo do álbum</h2>
            
            {/* GALERIA DE FOTOS */}
            <h3>📷 Fotos ({album.fotos?.length || 0})</h3>
            <div className="media-grid">
                {album.fotos?.map(foto => (
                    <div key={foto.id} className={`dashboard-media-card ${foto.is_arquivado ? 'archived' : ''}`}>
                        <div className="dashboard-media-image">
                           <img src={foto.imagem_url} alt={foto.legenda} style={{ transform: `rotate(${foto.rotacao}deg)` }} />
                        </div>
                        <div className="dashboard-media-info">
                            <p>R$ {parseFloat(foto.preco).toFixed(2)}</p>
                            {foto.is_arquivado && <span className="status-archived-small">Arquivado</span>}
                            
                            <div className="media-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                                <button 
                                    onClick={() => handleSetCover(foto.id)} 
                                    className="cover-button-pill"
                                >
                                    Definir Capa
                                </button>
                                <button onClick={() => openEditForm(foto, 'foto')} className="edit-button-pill">Editar</button>
                                <button onClick={() => handleToggleArchivePhotoClick(foto)} className={foto.is_arquivado ? 'activate-button-pill' : 'archive-button-pill'}>
                                    {foto.is_arquivado ? 'Restaurar' : 'Arquivar'}
                                </button>
                                {/* --- BOTÃO ATUALIZADO --- */}
                                <button onClick={() => handleDeleteMediaClick(foto.id, 'foto')} className="delete-button-pill">Excluir</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* GALERIA DE VÍDEOS */}
            <h3 style={{ marginTop: '2rem' }}>🎬 Vídeos ({album.videos?.length || 0})</h3>
            <div className="media-grid" style={{paddingBottom: '2rem'}}>
                {album.videos?.map(video => (
                    <div key={video.id} className="dashboard-media-card" >
                        <div className="dashboard-media-image">
                           <img src={video.miniatura_url} alt={video.titulo} />
                        </div>
                        <div className="dashboard-media-info">
                            <p className="media-title">{video.titulo}</p>
                            <p>R$ {parseFloat(video.preco).toFixed(2)}</p>
                            
                            <div className="media-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                                <button onClick={() => openEditForm(video, 'video')} className="edit-button-pill">Editar</button>
                                {/* --- BOTÃO ATUALIZADO --- */}
                                <button onClick={() => handleDeleteMediaClick(video.id, 'video')} className="delete-button-pill">Excluir</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL DE CONFIRMAÇÃO DE FOTO --- */}
            {isConfirmModalOpen && fotoParaMudar && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#6c0464', marginTop: 0 }}>
                            {fotoParaMudar.is_arquivado ? 'Restaurar Foto?' : 'Arquivar Foto?'}
                        </h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            {fotoParaMudar.is_arquivado 
                                ? "Tem certeza que deseja restaurar esta foto? Ela voltará a ficar visível para os clientes comprarem."
                                : "Tem certeza que deseja arquivar esta foto? Ela não poderá mais ser comprada."}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => { setIsConfirmModalOpen(false); setFotoParaMudar(null); }} className="create_button" style={{ padding: '10px 20px'}}>
                                Cancelar
                            </button>
                            <button onClick={confirmarArquivamentoFoto} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: fotoParaMudar.is_arquivado ? '#28a745' : '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                {fotoParaMudar.is_arquivado ? 'Sim, Restaurar' : 'Sim, Arquivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ------------------------------------ */}

            {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (FOTO/VÍDEO) --- */}
            {isDeleteModalOpen && mediaToDelete && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#dc3545', marginTop: 0 }}>
                            Excluir {mediaToDelete.type === 'foto' ? 'Foto' : 'Vídeo'}?
                        </h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            Tem certeza que deseja APAGAR {mediaToDelete.type === 'foto' ? 'esta foto' : 'este vídeo'}? Esta ação é PERMANENTE e não pode ser desfeita.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => { setIsDeleteModalOpen(false); setMediaToDelete(null); }} className="create_button" style={{ padding: '10px 20px'}}>
                                Cancelar
                            </button>
                            <button onClick={confirmDeleteMedia} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ------------------------------------ */}
            
        </div>
    );
}

export default DashboardAlbumDetailPage;