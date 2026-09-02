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

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#fff', color: '#333', colorScheme: 'light' };

    return (
        <div className="inline-edit-form">
            <h3 style={{ color: '#6c0464', marginTop: 0 }}>Editar {mediaType === 'foto' ? 'Foto' : 'Vídeo'}</h3>
            <form onSubmit={handleSubmit}>
                {mediaType === 'foto' && media.imagem_url && (
                    <div className="rotation-preview-wrapper" style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <img 
                            src={media.imagem_url} 
                            alt="Pré-visualização" 
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
            className="dashboard-media-card" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            onClick={() => isSelectionMode && onToggleSelect(video.id)}
            style={{ position: 'relative', cursor: isSelectionMode ? 'pointer' : 'default', border: isSelected ? '2px solid #b832ce' : 'none' }}
        >
            {isSelectionMode && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                    <input type="checkbox" checked={isSelected} readOnly style={{ width: '22px', height: '22px', cursor: 'pointer', margin: 0 }} />
                </div>
            )}

            <div className="dashboard-media-image" style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px 8px 0 0', position: 'relative' }}>
                
                {video.arquivo_preview_url ? (
                    <>
                        <video 
                            ref={videoRef}
                            src={video.arquivo_preview_url}
                            poster={video.miniatura_url}
                            muted 
                            loop 
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {!isHovered && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                                <span style={{ color: 'white', fontSize: '18px', marginLeft: '3px' }}>▶</span>
                            </div>
                        )}
                    </>
                ) : video.miniatura_url ? (
                    <img src={video.miniatura_url} alt={video.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ textAlign: 'center', color: '#555', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Processando...</span>
                    </div>
                )}
            </div>

            <div className="dashboard-media-info">
                <p className="media-title">{video.titulo}</p>
                <p>R$ {parseFloat(video.preco).toFixed(2)}</p>
                <div className="media-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActionModalMedia(video); setActionModalType('video'); }} 
                        disabled={isSelectionMode}
                        className="button-outline" 
                        style={{ width: '100%', borderRadius: '20px', padding: '8px', fontSize: '13px', fontWeight: 'bold', opacity: isSelectionMode ? 0.3 : 1 }}
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
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            gap: '8px', marginTop: '1rem', marginBottom: '2rem', padding: '1rem' 
        }}>
            <button 
                onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                style={{ 
                    border: 'none', background: 'transparent', fontSize: '1.2rem', padding: '5px 10px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1,
                    color: 'white'
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
                                color: currentPage === page ? 'white' : '#ccc',
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
                    color: 'white'
                }}
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

    // 🚀 NOVO: Estados dos Modais de Exclusão em Massa e Pasta
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const corPrincipal = '#6c0464';
    const overlayRosado = 'rgba(108, 4, 100, 0.4)';
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#fff', color: '#333', colorScheme: 'light' };
    
    const labelStyleClean = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '5px', border: 'none', outline: 'none', background: 'transparent', boxShadow: 'none', padding: 0 };

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

    // 🚀 NOVO: Abrir o Modal de Exclusão em Massa
    const handleBulkDeleteClick = () => {
        const total = selectedFotos.length + selectedVideos.length;
        if (total === 0) return;
        setIsBulkDeleteModalOpen(true);
    };

    // 🚀 NOVO: Executar Exclusão em Massa
    const executeBulkDelete = async () => {
        setIsBulkDeleteModalOpen(false); // Fecha o modal imediatamente
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

    // 🚀 NOVO: Abrir o Modal de Excluir Pasta Inteira
    const handleDeleteCategoryClick = (categoriaNome) => {
        if (categoriaNome === 'Todas') return;
        setCategoryToDelete(categoriaNome);
        setIsCategoryDeleteModalOpen(true);
    };

    // 🚀 NOVO: Executar a Exclusão da Pasta Inteira
    const executeDeleteCategory = async () => {
        const fotosNaCategoria = rawPhotoList.filter(f => f.categoria?.trim() === categoryToDelete);
        const videosNaCategoria = rawVideoList.filter(v => v.categoria?.trim() === categoryToDelete);

        setIsCategoryDeleteModalOpen(false); // Fecha o modal imediatamente
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

    if (loading) return <p>Carregando...</p>;
    if (!album) return <p>Álbum não encontrado.</p>;

    const globalModalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: overlayRosado, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, backdropFilter: 'blur(3px)' };
    const globalModalContent = { backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '12px', maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' };
    const globalModalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '15px', marginBottom: '20px' };

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', paddingBottom: isSelectionMode ? '80px' : '0' }}>
            
            <header className="dashboard-header-card">
                <div style={{ textAlign: 'center' }}>
                    <h1 className="dashboard-header-title">{album.titulo}</h1>
                    {album.descricao && <p className="dashboard-header-text" style={{ marginBottom: '15px' }}>{album.descricao}</p>}
                    
                    <p className="dashboard-header-text" style={{ margin: 0, fontSize: '0.95rem' }}>
                        <strong>Fotógrafo:</strong> {album.fotografo} | <strong>Data:</strong> {new Date(album.data_evento).toLocaleDateString()}
                        {album.local && <> | <strong>Local:</strong> {album.local}</>}
                    </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '1.5rem' }}>
                    <Link to="/dashboard/albuns" className="button-outline" style={{ textDecoration: 'none' }}>Voltar</Link>
                    <button onClick={() => setActiveGlobalModal('uploadFotos')} className="button-outline">+ Fotos</button>
                    <button onClick={() => setActiveGlobalModal('uploadVideos')} className="button-outline">+ Vídeos</button>
                    <button onClick={() => setActiveGlobalModal('bulkEditFotos')} className="button-outline">Editar R$ (Fotos)</button>
                    <button onClick={() => setActiveGlobalModal('bulkEditVideos')} className="button-outline">Editar R$ (Vídeos)</button>
                    <Link to={`/dashboard/albuns/${id}/arte-promocional`} className="button-outline" style={{ textDecoration: 'none' }}>Click & Share</Link>
                    
                    <button 
                        className="button-outline"
                        onClick={() => setIsSelectionMode(!isSelectionMode)} 
                    >
                        {isSelectionMode ? 'Cancelar Seleção' : 'Seleção Múltipla'}
                    </button>
                </div>
            </header>          
            
            {tabs.length > 1 && (
                <div style={{
                    display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '10px',
                    scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch', alignItems: 'center'
                }}>
                    {tabs.map(tab => {
                        const isActive = selectedTab === tab;
                        return (
                            <div key={tab} style={{ display: 'flex', alignItems: 'center', backgroundColor: isActive ? '#b832ce' : 'rgba(255, 255, 255, 0.05)', borderRadius: '25px', padding: '0 5px 0 0', border: isActive ? 'none' : '1px solid #e1bce0', transition: 'all 0.2s', boxShadow: isActive ? '0 4px 10px rgba(184, 50, 206, 0.4)' : 'none' }}>
                                <button
                                    onClick={() => handleTabChange(tab)}
                                    style={{
                                        padding: '8px 20px', 
                                        borderRadius: '25px', 
                                        cursor: 'pointer', 
                                        whiteSpace: 'nowrap', 
                                        background: 'transparent',
                                        border: 'none',
                                        color: isActive ? '#ffffff' : '#f794f7',
                                        fontWeight: 'bold',
                                        textShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {tab}
                                </button>
                                {isActive && tab !== 'Todas' && (
                                    <button 
                                        onClick={() => handleDeleteCategoryClick(tab)}
                                        title={`Excluir a pasta "${tab}" e todos os seus arquivos`}
                                        style={{ background: 'transparent', border: 'none', color: '#ffb3b3', cursor: 'pointer', fontSize: '16px', padding: '0 10px 0 5px', display: 'flex', alignItems: 'center', transition: '0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#ffb3b3'}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <h3 style={{ color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '10px' }}>Galeria de Fotos ({basePhotoList.length})</h3>
            <div className="media-grid">
                {currentPhotos.map(foto => {
                    const isSelected = selectedFotos.includes(foto.id);
                    return (
                        <div 
                            key={foto.id} 
                            className={`dashboard-media-card ${foto.is_arquivado ? 'archived' : ''}`}
                            style={{ position: 'relative', cursor: isSelectionMode ? 'pointer' : 'default', border: isSelected ? '2px solid #b832ce' : 'none' }}
                            onClick={() => isSelectionMode && toggleFotoSelection(foto.id)}
                        >
                            {isSelectionMode && (
                                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                                    <input type="checkbox" checked={isSelected} readOnly style={{ width: '22px', height: '22px', cursor: 'pointer', margin: 0 }} />
                                </div>
                            )}

                            <div className="dashboard-media-image">
                               <img src={foto.imagem_url} alt={foto.legenda} style={{ transform: `rotate(${foto.rotacao}deg)` }} />
                            </div>
                            <div className="dashboard-media-info">
                                <p>R$ {parseFloat(foto.preco).toFixed(2)}</p>
                                {foto.is_arquivado && <span className="status-archived-small">Arquivado</span>}
                                <div className="media-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActionModalMedia(foto); setActionModalType('foto'); }} 
                                        disabled={isSelectionMode}
                                        className="button-outline" 
                                        style={{ width: '100%', borderRadius: '20px', padding: '8px', fontSize: '13px', fontWeight: 'bold', opacity: isSelectionMode ? 0.3 : 1 }}
                                    >
                                        Opções
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {basePhotoList.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Nenhuma foto nesta categoria.</p>}

            <CustomPagination 
                currentPage={currentPhotoPage} 
                totalPages={totalPhotoPages} 
                onPageChange={handlePhotoPageChange} 
            />

            <h3 style={{ color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '10px', marginTop: '40px' }}>Galeria de Vídeos ({baseVideoList.length})</h3>
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

            {baseVideoList.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Nenhum vídeo nesta categoria.</p>}

            <CustomPagination 
                currentPage={currentVideoPage} 
                totalPages={totalVideoPages} 
                onPageChange={handleVideoPageChange} 
            />

            {/* 🚀 BARRA FLUTUANTE DE AÇÕES EM MASSA */}
            {isSelectionMode && (
                <div className="modalselect" style={{
                    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#fff', padding: '15px 30px', borderRadius: '40px',
                    display: 'flex', gap: '15px', alignItems: 'center', zIndex: 9999,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)', border: '1px solid #444', flexWrap: 'wrap', justifyContent: 'center'
                }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#f794f7' }}>
                        {selectedFotos.length + selectedVideos.length} item(s) selecionado(s)
                    </span>
                    <button onClick={handleSelectAllVisible} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', backgroundColor: '#444', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                        Selecionar Tudo (Página)
                    </button>
                    
                    <button 
                        onClick={handleDeselectAll} 
                        disabled={selectedFotos.length === 0 && selectedVideos.length === 0}
                        style={{ 
                            padding: '8px 15px', borderRadius: '20px', border: '1px solid #555', backgroundColor: 'transparent', color: '#c010b1', cursor: 'pointer', fontWeight: 'bold',
                            opacity: (selectedFotos.length === 0 && selectedVideos.length === 0) ? 0.5 : 1 
                        }}
                    >
                        Deselecionar Tudo
                    </button>

                    <button onClick={handleBulkDeleteClick} disabled={selectedFotos.length === 0 && selectedVideos.length === 0} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold', opacity: (selectedFotos.length === 0 && selectedVideos.length === 0) ? 0.5 : 1 }}>
                        Apagar Selecionados
                    </button>

                    <button onClick={clearSelection} style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #777', backgroundColor: 'transparent', color: '#c010b1', cursor: 'pointer' }}>
                        Sair do Modo Seleção
                    </button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAIS GLOBAIS DE UPLOAD E EDIÇÃO */}
            {/* ========================================================================= */}
            
            {activeGlobalModal === 'uploadFotos' && (
                <div style={globalModalOverlay}>
                    <div style={globalModalContent}>
                        <div style={globalModalHeader}>
                            <h3 style={{ color: '#f794f7', margin: 0 }}>✙ Adicionar Novas Fotos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} disabled={isUploadingFotos} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>
                        <form onSubmit={handlePhotoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {meusJornais.length > 0 && (
                                <div>
                                    <label style={labelStyleClean}>Para onde quer enviar essas fotos?</label>
                                    <select 
                                        value={uploadDestino} 
                                        onChange={(e) => {
                                            setUploadDestino(e.target.value);
                                            if(e.target.value === 'site') setSelectedJornais([]); 
                                        }} 
                                        style={inputStyle}
                                    >
                                        <option value="site">Salvar APENAS na minha Loja (Site)</option>
                                        <option value="ambos">Salvar na Loja + Enviar para Jornais (FTP)</option>
                                        <option value="ftp">Enviar APENAS para Jornais (Não salvar no Site)</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label style={labelStyleClean}>
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
                                        style={{...inputStyle, marginBottom: (!existingCategories.includes(fotoCategoria) || fotoCategoria === '') ? '10px' : '0'}}
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
                                        style={inputStyle}
                                    />
                                )}
                            </div>

                            <div style={{ padding: '15px', border: '2px dashed #666', borderRadius: '8px', textAlign: 'center', backgroundColor: 'transparent', margin: '10px 0' }}>
                                <label htmlFor="photo-upload" className="create-button" style={{ display: 'inline-block', cursor: 'pointer' }}>Selecionar Ficheiros...</label>
                                <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple disabled={isUploadingFotos} style={{ display: 'none' }} />
                                {fotoFiles.length > 0 && <p style={{ color: '#28a745', fontWeight: 'bold', margin: '10px 0 0 0', fontSize: '13px' }}>{fotoFiles.length} foto(s) selecionada(s)</p>}
                            </div>
                            
                            {uploadDestino !== 'ftp' && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={labelStyleClean}>Legenda para o Site (Opcional)</label>
                                        <input type="text" style={inputStyle} onChange={(e) => setFotoLegenda(e.target.value)} disabled={isUploadingFotos} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={labelStyleClean}>Preço de Venda (R$)</label>
                                        <input type="number" step="0.01" style={inputStyle} value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required={uploadDestino !== 'ftp'} disabled={isUploadingFotos} />
                                    </div>
                                </div>
                            )}
                            
                            {uploadDestino !== 'site' && meusJornais.length > 0 && (
                                <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid #444' }}>
                                    <h4 style={{ margin: 0, color: '#f794f7', marginBottom: '10px' }}>🚀 Envio via FTP (Imprensa)</h4>
                                    <p style={{ fontSize: '12px', color: '#aaa', marginTop: 0 }}>Selecione os jornais para onde deseja enviar estas fotos:</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {meusJornais.map(jornal => (
                                            <label key={jornal.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#ddd' }}>
                                                <input type="checkbox" checked={selectedJornais.includes(jornal.id)} onChange={() => toggleJornal(jornal.id)} disabled={isUploadingFotos} style={{ width: '18px', height: '18px' }} />
                                                {jornal.nome_jornal}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isUploadingFotos && <div style={{ padding: '15px', backgroundColor: 'rgba(255, 243, 205, 0.1)', color: '#ffeeba', border: '1px solid #ffeeba', borderRadius: '5px', fontWeight: 'bold', textAlign: 'center' }}>{uploadStatusMsg}</div>}

                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%' }}>
                                <button type="button" onClick={() => setActiveGlobalModal(null)} className='button-outline' style={{ flex: 1, padding: 0, fontSize: '14px', height: '45px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                    Voltar
                                </button>
                                <button type="submit" className="create-button" disabled={isUploadingFotos || fotoFiles.length === 0} style={{ flex: 1, opacity: isUploadingFotos ? 0.6 : 1, padding: 0, fontSize: '14px', height: '45px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                    {isUploadingFotos ? 'A enviar...' : `Enviar Fotos`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'uploadVideos' && (
                <div style={globalModalOverlay}>
                    <div style={globalModalContent}>
                        <div style={globalModalHeader}>
                            <h3 style={{ color: '#f794f7', margin: 0 }}>✙ Adicionar Novos Vídeos</h3>
                            <button onClick={() => setActiveGlobalModal(null)} disabled={isUploadingVideos} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            <div>
                                <label style={labelStyleClean}>
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
                                        style={{...inputStyle, marginBottom: (!existingCategories.includes(videoCategoria) || videoCategoria === '') ? '10px' : '0'}}
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
                                        style={inputStyle}
                                    />
                                )}
                            </div>

                            <div style={{ padding: '15px', border: '2px dashed #666', borderRadius: '8px', textAlign: 'center', backgroundColor: 'transparent', margin: '10px 0' }}>
                                <label htmlFor="video-upload" className="create-button" style={{ display: 'inline-block', cursor: 'pointer' }}>Selecionar Ficheiros de Vídeo...</label>
                                <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple disabled={isUploadingVideos} style={{ display: 'none' }} />
                            </div>
                            
                            {stagedVideos.length > 0 && (
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid #444' }}>
                                    <h4 style={{ marginTop: 0, color: '#ccc' }}>Vídeos selecionados:</h4>
                                    {stagedVideos.map((video) => (
                                        <div key={video.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #555' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 5px 0', color: '#f794f7' }}>{video.videoFile.name}</p>
                                            
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Título do vídeo" 
                                                    style={{...inputStyle, flex: '1 1 200px', marginBottom: 0}} 
                                                    onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} 
                                                    disabled={isUploadingVideos} 
                                                />
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    placeholder="Preço R$" 
                                                    value={video.preco} 
                                                    style={{...inputStyle, flex: '1 1 100px', marginBottom: 0}} 
                                                    onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} 
                                                    required 
                                                    disabled={isUploadingVideos} 
                                                />
                                            </div>

                                            <button type="button" onClick={() => removeStagedVideo(video.id)} disabled={isUploadingVideos} style={{ marginTop: '8px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remover</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {isUploadingVideos && <p style={{ fontWeight: 'bold', color: '#f794f7', textAlign: 'center' }}>⏳ Enviando vídeo {uploadProgressVideos} de {stagedVideos.length}...</p>}
                            
                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%' }}>
                                <button type="button" onClick={() => setActiveGlobalModal(null)} className='button-outline' style={{ flex: 1, padding: 0, fontSize: '14px', height: '45px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                    Voltar
                                </button>
                                <button onClick={handleVideoSubmit} className="create-button" disabled={isUploadingVideos || stagedVideos.length === 0} style={{ flex: 1, opacity: isUploadingVideos ? 0.6 : 1, padding: 0, fontSize: '14px', height: '45px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                    {isUploadingVideos ? 'A enviar...' : `Enviar ${stagedVideos.length} Vídeo(s)`}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {activeGlobalModal === 'bulkEditFotos' && (
                <div style={globalModalOverlay}>
                    <div style={globalModalContent}>
                        <div style={globalModalHeader}>
                            <h3 style={{ color: corPrincipal, margin: 0 }}>Preço de Todas as Fotos</h3>
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
                            <h3 style={{ color: corPrincipal, margin: 0 }}>Preço de Todos os Vídeos</h3>
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
                            Opções da {actionModalType === 'foto' ? 'Foto' : 'Vídeo'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {actionModalType === 'foto' && (
                                <>
                                    <button onClick={() => { handleSetCover(actionModalMedia.id); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #6c0464', backgroundColor: '#fbf0fa', color: '#6c0464', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Definir como Capa</button>
                                    <button onClick={() => { handleToggleArchivePhotoClick(actionModalMedia); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2a03f', backgroundColor: '#fcf6ec', color: '#b97a00', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>{actionModalMedia.is_arquivado ? 'Restaurar Foto na Loja' : 'Arquivar (Ocultar da Loja)'}</button>
                                    <button onClick={() => { handleDownloadOriginal(actionModalMedia.id); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #28a745', backgroundColor: '#d4edda', color: '#155724', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Baixar Arquivo Original</button>
                                </>
                            )}
                            <button onClick={() => { openEditForm(actionModalMedia, actionModalType); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #17a2b8', backgroundColor: '#e2f3f5', color: '#0c5460', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Editar Informações</button>
                            <button onClick={() => { handleDeleteMediaClick(actionModalMedia.id, actionModalType); setActionModalMedia(null); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dc3545', backgroundColor: '#f8d7da', color: '#721c24', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Excluir Definitivamente</button>
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

            {/* ========================================================================= */}
            {/* MODAIS DE CONFIRMAÇÃO E EXCLUSÃO (Agora todos no mesmo estilo limpo!) */}
            {/* ========================================================================= */}

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

            {isBulkDeleteModalOpen && (
                <div style={globalModalOverlay}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Excluir Arquivos Selecionados?</h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            Tem certeza que deseja APAGAR os <strong>{selectedFotos.length + selectedVideos.length}</strong> arquivo(s) selecionado(s)? Esta ação é PERMANENTE e não pode ser desfeita.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => setIsBulkDeleteModalOpen(false)} className="button-outline" style={{ padding: '10px 20px'}}>Cancelar</button>
                            <button onClick={executeBulkDelete} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Sim, Excluir Tudo</button>
                        </div>
                    </div>
                </div>
            )}

            {isCategoryDeleteModalOpen && categoryToDelete && (
                <div style={globalModalOverlay}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Excluir Pasta Inteira?</h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            ATENÇÃO: Deseja apagar a pasta "<strong>{categoryToDelete}</strong>" e TODOS os seus arquivos permanentemente? Esta ação não pode ser desfeita.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => { setIsCategoryDeleteModalOpen(false); setCategoryToDelete(null); }} className="button-outline" style={{ padding: '10px 20px'}}>Cancelar</button>
                            <button onClick={executeDeleteCategory} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Sim, Excluir Tudo</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ESTILOS CSS INJETADOS --- */}
            <style>{`
                .dashboard-header-card {
                    background-color: #fff;
                    border: 1px solid #e1bce0;
                    border-radius: 8px;
                    padding: 30px 20px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 10px rgba(108, 4, 100, 0.05);
                }
                .dashboard-header-title {
                    color: #6c0464;
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 28px;
                }
                .dashboard-header-text {
                    color: #555;
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-header-card {
                        background-color: #2a2a2a;
                        border-color: #444;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    }
                    .dashboard-header-title {
                        color: #f794f7;
                    }
                    .dashboard-header-text {
                        color: #ccc;
                    }
                    .modalselect {
                        backgroundColor: #1a1a1a;
                        color: white;
                    }
                }
            `}</style>
            
        </div>
    );
}

export default DashboardAlbumDetailPage;