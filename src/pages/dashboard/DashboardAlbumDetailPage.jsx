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

    return (
        <div className="inline-edit-form">
            <h3 className="media-edit-title">Editar {mediaType === 'foto' ? 'Foto' : 'Vídeo'}</h3>
            <form onSubmit={handleSubmit}>
                {mediaType === 'foto' && media.imagem_url && (
                    <div className="rotation-preview-wrapper">
                        <img 
                            src={media.imagem_url} 
                            alt="Pré-visualização" 
                            style={{ transform: `rotate(${formData.rotacao}deg)` }}
                            className="media-edit-preview-img"
                        />
                    </div>
                )}
                <div className="media-edit-input-group">
                    <label className="media-edit-label">{mediaType === 'foto' ? 'Legenda' : 'Título'}</label>
                    <input name="legenda" value={formData.legenda} onChange={handleChange} className="media-edit-input" />
                </div>
                <div className="media-edit-input-group">
                    <label className="media-edit-label">Preço (R$)</label>
                    <input name="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} required className="media-edit-input" />
                </div>
                {mediaType === 'foto' && (
                    <div className="rotation-control-box">
                        <label className="rotation-label">Rotação: {formData.rotacao}°</label>
                        <button type="button" onClick={handleRotate} className="rotation-btn">Girar ↺</button>
                    </div>
                )}
                <div className="media-edit-actions">
                    <button type="button" onClick={onCancel} className="media-edit-btn-cancel">Cancelar</button>
                    <button type="submit" className="media-edit-btn-save">Salvar</button>
                </div>
            </form>
        </div>
    );
}

// --- COMPONENTE DO CARD DE VÍDEO DO PAINEL ---
function DashboardVideoPreviewCard({ video, setActionModalMedia, setActionModalType, isSelectionMode, isSelected, onToggleSelect }) {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

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
            className={`dashboard-media-card ${isSelected ? 'selected' : ''}`}
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            onClick={() => isSelectionMode && onToggleSelect(video.id)}
            style={{ cursor: isSelectionMode ? 'pointer' : 'default' }}
        >
            {isSelectionMode && (
                <div className="media-checkbox-overlay">
                    <input type="checkbox" checked={isSelected} readOnly className="custom-checkbox" />
                </div>
            )}

            <div className="dashboard-media-image video-preview-box">
                
                {video.arquivo_preview_url ? (
                    <>
                        <video 
                            ref={videoRef}
                            src={video.arquivo_preview_url}
                            poster={video.miniatura_url}
                            muted 
                            loop 
                            playsInline
                            className="video-player-cover"
                        />
                        {!isHovered && (
                            <div className="video-play-icon-overlay">
                                <span className="play-icon-triangle">▶</span>
                            </div>
                        )}
                    </>
                ) : video.miniatura_url ? (
                    <img src={video.miniatura_url} alt={video.titulo} className="video-player-cover" />
                ) : (
                    <div className="video-processing-box">
                        <span className="processing-icon">⏳</span>
                        <span className="processing-text">Processando...</span>
                    </div>
                )}
            </div>

            <div className="dashboard-media-info">
                <p className="media-title">{video.titulo}</p>
                <p className="media-price-text">R$ {parseFloat(video.preco).toFixed(2)}</p>
                <div className="media-actions-row">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActionModalMedia(video); setActionModalType('video'); }} 
                        disabled={isSelectionMode}
                        className={`button-outline media-options-btn ${isSelectionMode ? 'disabled-opacity' : ''}`}
                    >
                        Opções
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENTE DE PAGINAÇÃO NUMÉRICA ---
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

// --- Componente Principal da Página ---
function DashboardAlbumDetailPage() {
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    
    const [activeGlobalModal, setActiveGlobalModal] = useState(null); 

    // Estados para Upload de Fotos
    const [fotoFiles, setFotoFiles] = useState([]);
    const [meusJornais, setMeusJornais] = useState([]); 
    const [selectedJornais, setSelectedJornais] = useState([]);
    
    const [uploadDestino, setUploadDestino] = useState('site'); 
    const [fotoPreco, setFotoPreco] = useState('15.00');
    const [fotoLegenda, setFotoLegenda] = useState('');
    const [fotoCategoria, setFotoCategoria] = useState(''); 

    const [isUploadingFotos, setIsUploadingFotos] = useState(false);
    const [uploadStatusMsg, setUploadStatusMsg] = useState('');

    // Estados para Upload de Vídeos
    const [stagedVideos, setStagedVideos] = useState([]);
    const [isUploadingVideos, setIsUploadingVideos] = useState(false);
    const [uploadProgressVideos, setUploadProgressVideos] = useState(0);
    const [videoCategoria, setVideoCategoria] = useState(''); 
    
    // Outros estados
    const [isPolling, setIsPolling] = useState(false);
    const [editingMedia, setEditingMedia] = useState(null);
    const [mediaType, setMediaType] = useState('');
    const [newPhotoPrice, setNewPhotoPrice] = useState('');
    const [newVideoPrice, setNewVideoPrice] = useState('');

    const [actionModalMedia, setActionModalMedia] = useState(null);
    const [actionModalType, setActionModalType] = useState(''); 

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fotoParaMudar, setFotoParaMudar] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState(null);

    const [selectedTab, setSelectedTab] = useState('Todas');

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedFotos, setSelectedFotos] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);

    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // 🚀 NOVO: Estado para abrir o Menu Mobile
    const [isMobileActionsMenuOpen, setIsMobileActionsMenuOpen] = useState(false);

    const itensPorPagina = 20;

    const fetchAlbumDetails = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/albuns/${id}/?timestamp=${new Date().getTime()}`);
            setAlbum(response.data);
        } catch (error) {
            toast.error("Erro ao carregar os detalhes do álbum.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchAlbumDetails(); }, [fetchAlbumDetails]);

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
        if (selectedJornais.includes(jornalId)) {
            setSelectedJornais(prev => prev.filter(id => id !== jornalId));
        } else {
            setSelectedJornais(prev => [...prev, jornalId]);
        }
    };

    const pollingIntervalRef = useRef(null);

    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        setIsPolling(true);
        let pollCount = 0;
        
        pollingIntervalRef.current = setInterval(() => {
            fetchAlbumDetails();
            pollCount++;
            if (pollCount >= 24) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
                setIsPolling(false);
            }
        }, 5000);
    }, [fetchAlbumDetails]);

    useEffect(() => { return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); }; }, []);

    const todasCategorias = new Set();
    const rawPhotoList = album?.fotos || [];
    const rawVideoList = album?.videos || [];

    rawPhotoList.forEach(f => {
        if (f.categoria && f.categoria.trim() !== '') todasCategorias.add(f.categoria.trim());
    });
    rawVideoList.forEach(v => {
        if (v.categoria && v.categoria.trim() !== '') todasCategorias.add(v.categoria.trim());
    });
    
    const existingCategories = Array.from(todasCategorias).sort();
    const tabs = ['Todas', ...existingCategories];

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        setCurrentPhotoPage(1);
        setCurrentVideoPage(1);
        setSelectedFotos([]);
        setSelectedVideos([]);
    };

    const basePhotoList = selectedTab === 'Todas' 
        ? rawPhotoList 
        : rawPhotoList.filter(f => f.categoria?.trim() === selectedTab);

    const baseVideoList = selectedTab === 'Todas' 
        ? rawVideoList 
        : rawVideoList.filter(v => v.categoria?.trim() === selectedTab);

    const [currentPhotoPage, setCurrentPhotoPage] = useState(1);
    const totalPhotoPages = Math.ceil(basePhotoList.length / itensPorPagina);
    const currentPhotos = basePhotoList.slice((currentPhotoPage - 1) * itensPorPagina, currentPhotoPage * itensPorPagina);

    const handlePhotoPageChange = (novaPagina) => {
        setCurrentPhotoPage(novaPagina);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const [currentVideoPage, setCurrentVideoPage] = useState(1);
    const totalVideoPages = Math.ceil(baseVideoList.length / itensPorPagina);
    const currentVideos = baseVideoList.slice((currentVideoPage - 1) * itensPorPagina, currentVideoPage * itensPorPagina);

    const handleVideoPageChange = (novaPagina) => {
        setCurrentVideoPage(novaPagina);
        window.scrollTo({ top: 800, behavior: 'smooth' }); 
    };

    const toggleFotoSelection = (fotoId) => {
        setSelectedFotos(prev => prev.includes(fotoId) ? prev.filter(id => id !== fotoId) : [...prev, fotoId]);
    };
    
    const toggleVideoSelection = (videoId) => {
        setSelectedVideos(prev => prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]);
    };

    const handleSelectAllVisible = () => {
        const photosIds = currentPhotos.map(f => f.id);
        const videosIds = currentVideos.map(v => v.id);
        setSelectedFotos(photosIds);
        setSelectedVideos(videosIds);
    };

    const handleDeselectAll = () => {
        setSelectedFotos([]);
        setSelectedVideos([]);
    };

    const clearSelection = () => {
        setSelectedFotos([]);
        setSelectedVideos([]);
        setIsSelectionMode(false);
    };

    const handleBulkDeleteClick = () => {
        const total = selectedFotos.length + selectedVideos.length;
        if (total === 0) return;
        setIsBulkDeleteModalOpen(true);
    };

    const executeBulkDelete = async () => {
        setIsBulkDeleteModalOpen(false); 
        toast.info("A excluir arquivos selecionados, aguarde...");
        try {
            const photoPromises = selectedFotos.map(id => axiosInstance.delete(`/dashboard/fotos/${id}/`));
            const videoPromises = selectedVideos.map(id => axiosInstance.delete(`/dashboard/videos/${id}/`));
            
            await Promise.all([...photoPromises, ...videoPromises]);
            toast.success("Todos os itens selecionados foram excluídos com sucesso!");
            clearSelection();
            fetchAlbumDetails();
        } catch (error) {
            toast.error("Ocorreu um erro ao excluir alguns arquivos. Podem estar vinculados a uma venda.");
            fetchAlbumDetails(); 
        }
    };

    const handleDeleteCategoryClick = (categoriaNome) => {
        if (categoriaNome === 'Todas') return;
        setCategoryToDelete(categoriaNome);
        setIsCategoryDeleteModalOpen(true);
    };

    const executeDeleteCategory = async () => {
        const fotosNaCategoria = rawPhotoList.filter(f => f.categoria?.trim() === categoryToDelete);
        const videosNaCategoria = rawVideoList.filter(v => v.categoria?.trim() === categoryToDelete);

        setIsCategoryDeleteModalOpen(false); 
        toast.info(`A excluir a pasta "${categoryToDelete}"...`);
        try {
            const photoPromises = fotosNaCategoria.map(f => axiosInstance.delete(`/dashboard/fotos/${f.id}/`));
            const videoPromises = videosNaCategoria.map(v => axiosInstance.delete(`/dashboard/videos/${v.id}/`));
            
            await Promise.all([...photoPromises, ...videoPromises]);
            toast.success(`Pasta "${categoryToDelete}" e todo o seu conteúdo foram excluídos!`);
            setSelectedTab('Todas');
            setCategoryToDelete(null);
            fetchAlbumDetails();
        } catch (error) {
            toast.error("Erro ao excluir alguns arquivos da pasta.");
            setCategoryToDelete(null);
            fetchAlbumDetails();
        }
    };

    const handlePhotoSubmit = async (e) => {
        e.preventDefault();
        if (fotoFiles.length === 0) { toast.info("Selecione pelo menos uma foto."); return; }
        
        if ((uploadDestino === 'ambos' || uploadDestino === 'ftp') && selectedJornais.length === 0) {
            toast.error("Selecione pelo menos um jornal parceiro na lista!");
            return;
        }

        setIsUploadingFotos(true);
        let fotosEnviadasComSucesso = 0;
        let fotosComErro = 0;

        for (let i = 0; i < fotoFiles.length; i++) {
            const file = fotoFiles[i];
            setUploadStatusMsg(`A processar a foto ${i + 1} de ${fotoFiles.length}...`);
            
            const formData = new FormData();
            formData.append('album', id);
            formData.append('imagem', file);
            formData.append('destino_upload', uploadDestino);
            formData.append('categoria', fotoCategoria);
            
            if (uploadDestino !== 'ftp') {
                formData.append('preco', fotoPreco);
                formData.append('legenda', fotoLegenda);
            }

            if (uploadDestino !== 'site') {
                formData.append('jornais', selectedJornais.join(','));
            }
            
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
            toast.error(`${fotosEnviadasComSucesso} fotos enviadas. ${fotosComErro} falharam.`);
        } else {
            toast.success(`Sucesso! ${fotosEnviadasComSucesso} foto(s) enviadas com sucesso.`);
            setActiveGlobalModal(null); 
            setFotoFiles([]);
            setSelectedJornais([]);
            setUploadDestino('site');
        }
        
        fetchAlbumDetails();
        if (uploadDestino !== 'ftp') startPolling(); 
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
        if (stagedVideos.length === 0) return;
        
        setIsUploadingVideos(true);
        
        for (let i = 0; i < stagedVideos.length; i++) {
            const video = stagedVideos[i];
            const formData = new FormData();
            formData.append('album', id);
            formData.append('titulo', video.titulo);
            formData.append('preco', video.preco);
            formData.append('arquivo_video', video.videoFile);
            formData.append('categoria', videoCategoria);
            
            try { await axiosInstance.post('/dashboard/videos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); } 
            catch (error) { toast.error(`Erro no vídeo ${video.videoFile.name}`); }
        }
        
        setIsUploadingVideos(false);
        toast.success(`Vídeos enviados com sucesso!`);
        setStagedVideos([]);
        setActiveGlobalModal(null); 
        fetchAlbumDetails();
        startPolling();
    };

    const handleToggleArchivePhotoClick = (foto) => { setFotoParaMudar(foto); setIsConfirmModalOpen(true); };
    const confirmarArquivamentoFoto = async () => {
        const acao = fotoParaMudar.is_arquivado ? 'desarquivar' : 'arquivar';
        try {
            await axiosInstance.post(`/dashboard/fotos/${fotoParaMudar.id}/${acao}/`);
            fetchAlbumDetails();
            toast.success(`Sucesso.`);
        } catch (error) { } 
        finally { setIsConfirmModalOpen(false); setFotoParaMudar(null); }
    };

    const handleSetCover = async (fotoId) => {
        try {
            await axiosInstance.post(`/dashboard/albuns/${id}/definir_capa/`, { foto_id: fotoId });
            fetchAlbumDetails();
            toast.success("Capa updated.");
        } catch (error) { }
    };
    
    const handleDeleteMediaClick = (mediaId, type) => { setMediaToDelete({ id: mediaId, type }); setIsDeleteModalOpen(true); };
    
    const handleDownloadOriginal = async (fotoId) => {
        try {
            toast.info("Preparando arquivo para download...");
            const response = await axiosInstance.get(`/dashboard/fotos/${fotoId}/baixar_original/`);
            const urlDownload = response.data.url_download;
            
            const link = document.createElement('a');
            link.href = urlDownload;
            link.setAttribute('download', ''); 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error("Erro ao baixar a foto original:", error);
            toast.error("Não foi possível gerar o link de download no momento.");
        }
    };
    
    const confirmDeleteMedia = async () => {
        try {
            await axiosInstance.delete(`/dashboard/${mediaToDelete.type}s/${mediaToDelete.id}/`);
            fetchAlbumDetails();
            toast.success(`Excluído com sucesso.`);
        } catch (error) { 
            toast.error("Erro ao apagar. Pode já estar vinculada a uma venda.");
        } finally { setIsDeleteModalOpen(false); setMediaToDelete(null); }
    };

    const handleEditSubmit = async (mediaId, formData) => {
        try {
            const dataToSubmit = mediaType === 'video' ? { titulo: formData.legenda, preco: formData.preco } : formData;
            await axiosInstance.patch(`/dashboard/${mediaType}s/${mediaId}/`, dataToSubmit);
            setEditingMedia(null);
            fetchAlbumDetails();
            toast.success("Atualizado com sucesso!");
        } catch (error) { }
    };

    const openEditForm = (media, type) => { setEditingMedia(media); setMediaType(type); };

    const handleBulkUpdatePhotos = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/dashboard/albuns/${id}/bulk_update_photos/`, { preco: newPhotoPrice });
            toast.success(response.data.status);
            fetchAlbumDetails();
            setNewPhotoPrice('');
            setActiveGlobalModal(null); 
        } catch (error) { toast.error("Erro ao atualizar."); }
    };

    const handleBulkUpdateVideos = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/dashboard/albuns/${id}/bulk_update_videos/`, { preco: newVideoPrice });
            toast.success(response.data.status);
            fetchAlbumDetails();
            setNewVideoPrice('');
            setActiveGlobalModal(null); 
        } catch (error) { toast.error("Erro ao atualizar."); }
    };

    if (loading) return <p className="page-subtitle" style={{ padding: '20px' }}>Carregando...</p>;
    if (!album) return <p className="page-subtitle" style={{ padding: '20px' }}>Álbum não encontrado.</p>;

    return (
        <div className="dashboard-page-content detail-page-wrapper" style={{ paddingBottom: isSelectionMode ? '80px' : '0' }}>
            
            <header className="dashboard-header-card">
                <div className="detail-header-info">
                    <h1 className="dashboard-header-title">{album.titulo}</h1>
                    {album.descricao && <p className="dashboard-header-text detail-desc">{album.descricao}</p>}
                    
                    <p className="dashboard-header-text detail-meta">
                        <strong>Fotógrafo:</strong> {album.fotografo} | <strong>Data:</strong> {new Date(album.data_evento).toLocaleDateString()}
                        {album.local && <> | <strong>Local:</strong> {album.local}</>}
                    </p>
                </div>
                
                <div className="detail-header-actions">
                    
                    {/* 🚀 BOTÃO ÚNICO PARA MOBILE */}
                    <button 
                        className="button-outline mobile-actions-trigger" 
                        onClick={() => setIsMobileActionsMenuOpen(true)}
                    >
                        Opções do Álbum
                    </button>

                    {/* 🚀 GRUPO DE BOTÕES PARA DESKTOP */}
                    <div className="desktop-actions-group">
                        <Link to="/dashboard/albuns" className="button-outline">Voltar</Link>
                        <button onClick={() => setActiveGlobalModal('uploadFotos')} className="button-outline">+ Fotos</button>
                        <button onClick={() => setActiveGlobalModal('uploadVideos')} className="button-outline">+ Vídeos</button>
                        <button onClick={() => setActiveGlobalModal('bulkEditFotos')} className="button-outline">Editar R$ (Fotos)</button>
                        <button onClick={() => setActiveGlobalModal('bulkEditVideos')} className="button-outline">Editar R$ (Vídeos)</button>
                        <Link to={`/dashboard/albuns/${id}/arte-promocional`} className="button-outline">Click & Share</Link>
                        
                        <button 
                            className="button-outline"
                            onClick={() => setIsSelectionMode(!isSelectionMode)} 
                        >
                            {isSelectionMode ? 'Cancelar Seleção' : 'Seleção Múltipla'}
                        </button>
                    </div>
                </div>
            </header>          
            
            {tabs.length > 1 && (
                <div className="detail-tabs-wrapper">
                    {tabs.map(tab => {
                        const isActive = selectedTab === tab;
                        return (
                            <div key={tab} className={`detail-tab-item ${isActive ? 'active' : ''}`}>
                                <button
                                    onClick={() => handleTabChange(tab)}
                                    className="detail-tab-btn"
                                >
                                    {tab}
                                </button>
                                {isActive && tab !== 'Todas' && (
                                    <button 
                                        onClick={() => handleDeleteCategoryClick(tab)}
                                        title={`Excluir a pasta "${tab}" e todos os seus arquivos`}
                                        className="detail-tab-delete-btn"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <h3 className="detail-section-title">Galeria de Fotos ({basePhotoList.length})</h3>
            <div className="media-grid">
                {currentPhotos.map(foto => {
                    const isSelected = selectedFotos.includes(foto.id);
                    return (
                        <div 
                            key={foto.id} 
                            className={`dashboard-media-card ${foto.is_arquivado ? 'archived' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => isSelectionMode && toggleFotoSelection(foto.id)}
                            style={{ cursor: isSelectionMode ? 'pointer' : 'default' }}
                        >
                            {isSelectionMode && (
                                <div className="media-checkbox-overlay">
                                    <input type="checkbox" checked={isSelected} readOnly className="custom-checkbox" />
                                </div>
                            )}

                            <div className="dashboard-media-image">
                               <img src={foto.imagem_url} alt={foto.legenda} style={{ transform: `rotate(${foto.rotacao}deg)` }} />
                            </div>
                            <div className="dashboard-media-info">
                                <p className="media-price-text">R$ {parseFloat(foto.preco).toFixed(2)}</p>
                                {foto.is_arquivado && <span className="status-archived-small">Arquivado</span>}
                                <div className="media-actions-row">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActionModalMedia(foto); setActionModalType('foto'); }} 
                                        disabled={isSelectionMode}
                                        className={`button-outline media-options-btn ${isSelectionMode ? 'disabled-opacity' : ''}`}
                                    >
                                        Opções
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {basePhotoList.length === 0 && <p className="detail-empty-msg">Nenhuma foto nesta categoria.</p>}

            <CustomPagination 
                currentPage={currentPhotoPage} 
                totalPages={totalPhotoPages} 
                onPageChange={handlePhotoPageChange} 
            />

            <h3 className="detail-section-title" style={{ marginTop: '40px' }}>Galeria de Vídeos ({baseVideoList.length})</h3>
            <div className="media-grid" style={{paddingBottom: '2rem'}}>
                {currentVideos.map(video => (
                    <DashboardVideoPreviewCard 
                        key={video.id} 
                        video={video} 
                        setActionModalMedia={setActionModalMedia} 
                        setActionModalType={setActionModalType}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedVideos.includes(video.id)}
                        onToggleSelect={toggleVideoSelection}
                    />
                ))}
            </div>

            {baseVideoList.length === 0 && <p className="detail-empty-msg">Nenhum vídeo nesta categoria.</p>}

            <CustomPagination 
                currentPage={currentVideoPage} 
                totalPages={totalVideoPages} 
                onPageChange={handleVideoPageChange} 
            />

            {/* 🚀 BARRA FLUTUANTE DE AÇÕES EM MASSA */}
            {isSelectionMode && (
                <div className="floating-action-bar bulk-selection-bar">
                    
                    {/* Texto isolado no topo */}
                    <span className="floating-bar-text">
                        {selectedFotos.length + selectedVideos.length} item(s) selecionado(s)
                    </span>
                    
                    {/* Botões agrupados em baixo */}
                    <div className="bulk-selection-actions">
                        <button onClick={handleSelectAllVisible} className="bulk-btn bulk-btn-dark">
                            Selecionar Tudo (Página)
                        </button>
                        
                        <button 
                            onClick={handleDeselectAll} 
                            disabled={selectedFotos.length === 0 && selectedVideos.length === 0}
                            className="bulk-btn bulk-btn-outline"
                        >
                            Deselecionar Tudo
                        </button>

                        <button 
                            onClick={handleBulkDeleteClick} 
                            disabled={selectedFotos.length === 0 && selectedVideos.length === 0} 
                            className="bulk-btn bulk-btn-danger"
                        >
                            Apagar Selecionados
                        </button>

                        <button onClick={clearSelection} className="bulk-btn bulk-btn-exit">
                            Sair do Modo Seleção
                        </button>
                    </div>

                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAIS GLOBAIS DE UPLOAD E EDIÇÃO */}
            {/* ========================================================================= */}
            
            {activeGlobalModal === 'uploadFotos' && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content">
                        <div className="dash-modal-header">
                            <h3 className="dash-modal-title">✙ Adicionar Novas Fotos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} disabled={isUploadingFotos} className="dash-modal-close">✖</button>
                        </div>
                        <form onSubmit={handlePhotoSubmit} className="modal-form-flex">
                            
                            {meusJornais.length > 0 && (
                                <div className="modal-input-group">
                                    <label className="modal-label">Para onde quer enviar essas fotos?</label>
                                    <select 
                                        value={uploadDestino} 
                                        onChange={(e) => {
                                            setUploadDestino(e.target.value);
                                            if(e.target.value === 'site') setSelectedJornais([]); 
                                        }} 
                                        className="modal-input"
                                    >
                                        <option value="site">Salvar APENAS na minha Loja (Site)</option>
                                        <option value="ambos">Salvar na Loja + Enviar para Jornais (FTP)</option>
                                        <option value="ftp">Enviar APENAS para Jornais (Não salvar no Site)</option>
                                    </select>
                                </div>
                            )}

                            <div className="modal-input-group">
                                <label className="modal-label">
                                    Organizar em Aba / Sub-pasta (Opcional)
                                </label>

                                {existingCategories.length > 0 && (
                                    <select
                                        value={existingCategories.includes(fotoCategoria) ? fotoCategoria : 'nova'}
                                        onChange={(e) => {
                                            if (e.target.value === 'nova') setFotoCategoria('');
                                            else setFotoCategoria(e.target.value);
                                        }}
                                        disabled={isUploadingFotos}
                                        className={`modal-input ${(!existingCategories.includes(fotoCategoria) || fotoCategoria === '') ? 'modal-input-mb' : ''}`}
                                    >
                                        <option value="nova">Criar Nova Aba / Sub-pasta...</option>
                                        {existingCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                )}

                                {(!existingCategories.includes(fotoCategoria) || existingCategories.length === 0) && (
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Jogo 1 - Guarany x Pelotas" 
                                        value={fotoCategoria}
                                        onChange={(e) => setFotoCategoria(e.target.value)}
                                        disabled={isUploadingFotos}
                                        className="modal-input"
                                    />
                                )}
                            </div>

                            <div className="modal-dropzone">
                                <label htmlFor="photo-upload" className="create-button dropzone-btn">Selecionar Ficheiros...</label>
                                <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple disabled={isUploadingFotos} style={{ display: 'none' }} />
                                {fotoFiles.length > 0 && <p className="dropzone-success-msg">{fotoFiles.length} foto(s) selecionada(s)</p>}
                            </div>
                            
                            {uploadDestino !== 'ftp' && (
                                <div className="modal-row-flex">
                                    <div className="modal-col-2">
                                        <label className="modal-label">Legenda para o Site (Opcional)</label>
                                        <input type="text" className="modal-input" onChange={(e) => setFotoLegenda(e.target.value)} disabled={isUploadingFotos} />
                                    </div>
                                    <div className="modal-col-1">
                                        <label className="modal-label">Preço de Venda (R$)</label>
                                        <input type="number" step="0.01" className="modal-input" value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required={uploadDestino !== 'ftp'} disabled={isUploadingFotos} />
                                    </div>
                                </div>
                            )}
                            
                            {uploadDestino !== 'site' && meusJornais.length > 0 && (
                                <div className="modal-ftp-box">
                                    <h4 className="ftp-box-title">🚀 Envio via FTP (Imprensa)</h4>
                                    <p className="ftp-box-desc">Selecione os jornais para onde deseja enviar estas fotos:</p>
                                    
                                    <div className="ftp-list">
                                        {meusJornais.map(jornal => (
                                            <label key={jornal.id} className="ftp-checkbox-label">
                                                <input type="checkbox" checked={selectedJornais.includes(jornal.id)} onChange={() => toggleJornal(jornal.id)} disabled={isUploadingFotos} className="custom-checkbox" />
                                                {jornal.nome_jornal}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isUploadingFotos && <div className="modal-upload-status">{uploadStatusMsg}</div>}

                            <div className="modal-actions-row">
                                <button type="button" onClick={() => setActiveGlobalModal(null)} className='button-outline modal-btn-half'>
                                    Voltar
                                </button>
                                <button type="submit" className="create-button modal-btn-half" disabled={isUploadingFotos || fotoFiles.length === 0} style={{ opacity: isUploadingFotos ? 0.6 : 1 }}>
                                    {isUploadingFotos ? 'A enviar...' : `Enviar Fotos`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'uploadVideos' && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content">
                        <div className="dash-modal-header">
                            <h3 className="dash-modal-title">✙ Adicionar Novos Vídeos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} disabled={isUploadingVideos} className="dash-modal-close">✖</button>
                        </div>
                        <div className="modal-form-flex">
                            
                            <div className="modal-input-group">
                                <label className="modal-label">
                                    Organizar em Aba / Sub-pasta (Opcional)
                                </label>

                                {existingCategories.length > 0 && (
                                    <select
                                        value={existingCategories.includes(videoCategoria) ? videoCategoria : 'nova'}
                                        onChange={(e) => {
                                            if (e.target.value === 'nova') setVideoCategoria('');
                                            else setVideoCategoria(e.target.value);
                                        }}
                                        disabled={isUploadingVideos}
                                        className={`modal-input ${(!existingCategories.includes(videoCategoria) || videoCategoria === '') ? 'modal-input-mb' : ''}`}
                                    >
                                        <option value="nova">Criar Nova Aba / Sub-pasta...</option>
                                        {existingCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                )}

                                {(!existingCategories.includes(videoCategoria) || existingCategories.length === 0) && (
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Entrevistas" 
                                        value={videoCategoria}
                                        onChange={(e) => setVideoCategoria(e.target.value)}
                                        disabled={isUploadingVideos}
                                        className="modal-input"
                                    />
                                )}
                            </div>

                            <div className="modal-dropzone">
                                <label htmlFor="video-upload" className="create-button dropzone-btn">Selecionar Ficheiros de Vídeo...</label>
                                <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple disabled={isUploadingVideos} style={{ display: 'none' }} />
                            </div>
                            
                            {stagedVideos.length > 0 && (
                                <div className="modal-staging-box">
                                    <h4 className="staging-title">Vídeos selecionados:</h4>
                                    {stagedVideos.map((video) => (
                                        <div key={video.id} className="staging-item">
                                            <p className="staging-item-name">{video.videoFile.name}</p>
                                            
                                            <div className="staging-inputs-row">
                                                <input 
                                                    type="text" 
                                                    placeholder="Título do vídeo" 
                                                    className="modal-input staging-input-title" 
                                                    onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} 
                                                    disabled={isUploadingVideos} 
                                                />
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    placeholder="Preço R$" 
                                                    value={video.preco} 
                                                    className="modal-input staging-input-price" 
                                                    onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} 
                                                    required 
                                                    disabled={isUploadingVideos} 
                                                />
                                            </div>

                                            <button type="button" onClick={() => removeStagedVideo(video.id)} disabled={isUploadingVideos} className="staging-remove-btn">Remover</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {isUploadingVideos && <p className="modal-uploading-text">⏳ Enviando vídeo {uploadProgressVideos} de {stagedVideos.length}...</p>}
                            
                            <div className="modal-actions-row">
                                <button type="button" onClick={() => setActiveGlobalModal(null)} className='button-outline modal-btn-half'>
                                    Voltar
                                </button>
                                <button onClick={handleVideoSubmit} className="create-button modal-btn-half" disabled={isUploadingVideos || stagedVideos.length === 0} style={{ opacity: isUploadingVideos ? 0.6 : 1 }}>
                                    {isUploadingVideos ? 'A enviar...' : `Enviar ${stagedVideos.length} Vídeo(s)`}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'bulkEditFotos' && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content">
                        <div className="dash-modal-header">
                            <h3 className="dash-modal-title">Preço de Todas as Fotos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} className="dash-modal-close">✖</button>
                        </div>
                        <form onSubmit={handleBulkUpdatePhotos} className="modal-form-flex">
                            <p className="modal-desc-text">Atualizar o preço de <strong>todas</strong> as fotos deste álbum de uma só vez.</p>
                            <input type="number" step="0.01" min="0" value={newPhotoPrice} onChange={(e) => setNewPhotoPrice(e.target.value)} placeholder="Novo preço (R$)" required className="modal-input modal-input-large" />
                            <button type="submit" className="create-button modal-btn-large">Confirmar Alteração</button>
                        </form>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'bulkEditVideos' && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content">
                        <div className="dash-modal-header">
                            <h3 className="dash-modal-title">Preço de Todos os Vídeos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} className="dash-modal-close">✖</button>
                        </div>
                        <form onSubmit={handleBulkUpdateVideos} className="modal-form-flex">
                            <p className="modal-desc-text">Atualizar o preço de <strong>todos</strong> os vídeos deste álbum de uma só vez.</p>
                            <input type="number" step="0.01" min="0" value={newVideoPrice} onChange={(e) => setNewVideoPrice(e.target.value)} placeholder="Novo preço (R$)" required className="modal-input modal-input-large" />
                            <button type="submit" className="create-button modal-btn-large">Confirmar Alteração</button>
                        </form>
                    </div>
                </div>
            )}

            {actionModalMedia && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="modal-action-title">
                            Opções da {actionModalType === 'foto' ? 'Foto' : 'Vídeo'}
                        </h3>
                        <div className="modal-action-list">
                            {actionModalType === 'foto' && (
                                <>
                                    <button onClick={() => { handleSetCover(actionModalMedia.id); setActionModalMedia(null); }} className="action-btn-cover">Definir como Capa</button>
                                    <button onClick={() => { handleToggleArchivePhotoClick(actionModalMedia); setActionModalMedia(null); }} className="action-btn-archive">{actionModalMedia.is_arquivado ? 'Restaurar Foto na Loja' : 'Arquivar (Ocultar da Loja)'}</button>
                                    <button onClick={() => { handleDownloadOriginal(actionModalMedia.id); setActionModalMedia(null); }} className="action-btn-download">Baixar Arquivo Original</button>
                                </>
                            )}
                            <button onClick={() => { openEditForm(actionModalMedia, actionModalType); setActionModalMedia(null); }} className="action-btn-edit">Editar Informações</button>
                            <button onClick={() => { handleDeleteMediaClick(actionModalMedia.id, actionModalType); setActionModalMedia(null); }} className="action-btn-delete">Excluir Definitivamente</button>
                        </div>
                        <button onClick={() => setActionModalMedia(null)} className="action-btn-back">Voltar</button>
                    </div>
                </div>
            )}

            {editingMedia && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content">
                        <MediaEditForm media={editingMedia} mediaType={mediaType} onSubmit={handleEditSubmit} onCancel={() => setEditingMedia(null)} />
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL DE MENUS MOBILE (OPÇÕES DO ÁLBUM) */}
            {/* ========================================================================= */}
            
            {isMobileActionsMenuOpen && (
                <div className="dash-modal-overlay" style={{zIndex: 9999}}>
                    <div className="dash-modal-content dash-modal-small">
                        <div className="dash-modal-header" style={{marginBottom: '15px'}}>
                            <h3 className="dash-modal-title" style={{fontSize: '1.2rem'}}>Opções do Álbum</h3>
                            <button onClick={() => setIsMobileActionsMenuOpen(false)} className="dash-modal-close">✖</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/dashboard/albuns" className="button-outline" style={{ textAlign: 'center', textDecoration: 'none', padding: '12px' }}>Voltar</Link>
                            <button onClick={() => { setActiveGlobalModal('uploadFotos'); setIsMobileActionsMenuOpen(false); }} className="button-outline" style={{ padding: '12px' }}>Adicionar Fotos</button>
                            <button onClick={() => { setActiveGlobalModal('uploadVideos'); setIsMobileActionsMenuOpen(false); }} className="button-outline" style={{ padding: '12px' }}>Adicionar Vídeos</button>
                            <button onClick={() => { setActiveGlobalModal('bulkEditFotos'); setIsMobileActionsMenuOpen(false); }} className="button-outline" style={{ padding: '12px' }}>Editar Preço (Fotos)</button>
                            <button onClick={() => { setActiveGlobalModal('bulkEditVideos'); setIsMobileActionsMenuOpen(false); }} className="button-outline" style={{ padding: '12px' }}>Editar Preço (Vídeos)</button>
                            <Link to={`/dashboard/albuns/${id}/arte-promocional`} className="button-outline" style={{ textAlign: 'center', textDecoration: 'none', padding: '12px' }}>Click & Share</Link>
                            
                            <hr style={{width: '100%', border: 'none', borderTop: '1px solid var(--border-color)', margin: '5px 0'}}/>
                            
                            <button 
                                className="button-outline"
                                style={{ padding: '12px', borderColor: isSelectionMode ? '#dc3545' : 'var(--primary-purple)', color: isSelectionMode ? '#dc3545' : 'var(--primary-purple)' }}
                                onClick={() => { setIsSelectionMode(!isSelectionMode); setIsMobileActionsMenuOpen(false); }}
                            >
                                {isSelectionMode ? 'Cancelar Seleção Múltipla' : 'Ativar Seleção Múltipla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAIS DE CONFIRMAÇÃO E EXCLUSÃO */}
            {/* ========================================================================= */}

            {isConfirmModalOpen && fotoParaMudar && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title">{fotoParaMudar.is_arquivado ? 'Restaurar Foto?' : 'Arquivar Foto?'}</h3>
                        <p className="dash-modal-text">
                            {fotoParaMudar.is_arquivado ? "Tem certeza que deseja restaurar esta foto?" : "Tem certeza que deseja arquivar esta foto?"}
                        </p>
                        <div className="dash-modal-actions">
                            <button onClick={() => { setIsConfirmModalOpen(false); setFotoParaMudar(null); }} className="modal-btn-cancel">Cancelar</button>
                            <button onClick={confirmarArquivamentoFoto} className={`modal-btn-confirm ${fotoParaMudar.is_arquivado ? 'btn-success' : 'btn-warning'}`}>
                                {fotoParaMudar.is_arquivado ? 'Sim, Restaurar' : 'Sim, Arquivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && mediaToDelete && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title text-danger">Excluir {mediaToDelete.type === 'foto' ? 'Foto' : 'Vídeo'}?</h3>
                        <p className="dash-modal-text">
                            Tem certeza que deseja APAGAR {mediaToDelete.type === 'foto' ? 'esta foto' : 'este vídeo'}? Esta ação é PERMANENTE e não pode ser desfeita.
                        </p>
                        <div className="dash-modal-actions">
                            <button onClick={() => { setIsDeleteModalOpen(false); setMediaToDelete(null); }} className="modal-btn-cancel">Cancelar</button>
                            <button onClick={confirmDeleteMedia} className="modal-btn-confirm btn-danger">Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {isBulkDeleteModalOpen && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title text-danger">Excluir Arquivos Selecionados?</h3>
                        <p className="dash-modal-text">
                            Tem certeza que deseja APAGAR os <strong>{selectedFotos.length + selectedVideos.length}</strong> arquivo(s) selecionado(s)? Esta ação é PERMANENTE e não pode ser desfeita.
                        </p>
                        <div className="dash-modal-actions">
                            <button onClick={() => setIsBulkDeleteModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
                            <button onClick={executeBulkDelete} className="modal-btn-confirm btn-danger">Sim, Excluir Tudo</button>
                        </div>
                    </div>
                </div>
            )}

            {isCategoryDeleteModalOpen && categoryToDelete && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title text-danger">Excluir Pasta Inteira?</h3>
                        <p className="dash-modal-text">
                            ATENÇÃO: Deseja apagar a pasta "<strong>{categoryToDelete}</strong>" e TODOS os seus arquivos permanentemente? Esta ação não pode ser desfeita.
                        </p>
                        <div className="dash-modal-actions">
                            <button onClick={() => { setIsCategoryDeleteModalOpen(false); setCategoryToDelete(null); }} className="modal-btn-cancel">Cancelar</button>
                            <button onClick={executeDeleteCategory} className="modal-btn-confirm btn-danger">Sim, Excluir Tudo</button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default DashboardAlbumDetailPage;