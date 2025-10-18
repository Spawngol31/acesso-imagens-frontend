import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

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
    const [fotoFiles, setFotoFiles] = useState([]);
    const [fotoPreco, setFotoPreco] = useState('15.00');
    const [fotoLegenda, setFotoLegenda] = useState('');
    const [isUploadingFotos, setIsUploadingFotos] = useState(false);
    const [uploadProgressFotos, setUploadProgressFotos] = useState(0);
    const [stagedVideos, setStagedVideos] = useState([]);
    const [isUploadingVideos, setIsUploadingVideos] = useState(false);
    const [uploadProgressVideos, setUploadProgressVideos] = useState(0);
    const [isPolling, setIsPolling] = useState(false);
    const [editingMedia, setEditingMedia] = useState(null);
    const [mediaType, setMediaType] = useState('');

    const fetchAlbumDetails = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/albuns/${id}/?timestamp=${new Date().getTime()}`);
            setAlbum(response.data);
        } catch (error) {
            console.error("Erro ao buscar detalhes do álbum:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAlbumDetails();
    }, [fetchAlbumDetails]);

    const startPolling = useCallback(() => {
        if (isPolling) return;
        setIsPolling(true);
        let pollCount = 0;
        const maxPolls = 24;
        const intervalId = setInterval(() => {
            console.log("Verificando atualizações de mídia...");
            fetchAlbumDetails();
            pollCount++;
            if (pollCount >= maxPolls) {
                clearInterval(intervalId);
                setIsPolling(false);
                console.log("Polling finalizado.");
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, [isPolling, fetchAlbumDetails]);

    const handlePhotoSubmit = async (e) => {
        e.preventDefault();
        if (fotoFiles.length === 0) { alert("Por favor, selecione pelo menos um ficheiro de foto."); return; }
        setIsUploadingFotos(true);
        setUploadProgressFotos(0);
        for (let i = 0; i < fotoFiles.length; i++) {
            const file = fotoFiles[i];
            setUploadProgressFotos(i + 1);
            const formData = new FormData();
            formData.append('album', id);
            formData.append('imagem', file);
            formData.append('preco', fotoPreco);
            formData.append('legenda', fotoLegenda);
            try {
                await axiosInstance.post('/fotos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } catch (error) { console.error(`Erro ao enviar a foto ${file.name}:`, error); }
        }
        setIsUploadingFotos(false);
        alert(`${fotoFiles.length} foto(s) enviada(s) para processamento!`);
        const photoForm = e.target;
        const fileInput = photoForm.querySelector('#photo-upload');
        if (fileInput) fileInput.value = '';
        setFotoFiles([]);
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
        if (stagedVideos.length === 0) { alert("Nenhum vídeo selecionado para envio."); return; }
        for (const video of stagedVideos) {
            if (!video.titulo) {
                alert(`Por favor, adicione um título para o vídeo: ${video.videoFile.name}`);
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
                await axiosInstance.post('/dashboard/videos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } catch (error) { console.error(`Erro ao enviar o vídeo ${video.videoFile.name}:`, error); }
        }
        setIsUploadingVideos(false);
        alert(`${stagedVideos.length} vídeo(s) enviados com sucesso!`);
        setStagedVideos([]);
        const videoUploadInput = document.getElementById('video-upload');
        if(videoUploadInput) videoUploadInput.value = '';
        startPolling();
    };

    const handleDeleteMedia = async (mediaId, type) => {
        if (window.confirm(`Tem a certeza que deseja apagar est${type === 'foto' ? 'a foto' : 'e vídeo'}?`)) {
            try {
                await axiosInstance.delete(`/dashboard/${type}s/${mediaId}/`);
                fetchAlbumDetails();
            } catch (error) { console.error(`Erro ao apagar ${type}:`, error); }
        }
    };

    const handleEditSubmit = async (mediaId, formData) => {
        try {
            const dataToSubmit = mediaType === 'video' ? { titulo: formData.legenda, preco: formData.preco } : formData;
            await axiosInstance.patch(`/dashboard/${mediaType}s/${mediaId}/`, dataToSubmit);
            setEditingMedia(null);
            fetchAlbumDetails();
        } catch (error) { console.error(`Erro ao editar ${mediaType}:`, error); }
    };

    const openEditForm = (media, type) => {
        setEditingMedia(media);
        setMediaType(type);
    };

    if (loading) return <p>Carregando...</p>;
    if (!album) return <p>Álbum não encontrado ou falha ao carregar.</p>;

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h1>{album.titulo}</h1>
                <Link to="/dashboard/albuns" className="button-outline">Voltar para Meus álbuns</Link>
            </div>
            <p>{album.descricao}</p>
            {isPolling && <div className="polling-message">A processar mídias...</div>}
            
            <div className="upload-section">
                <form onSubmit={handlePhotoSubmit} className="upload-form">
                    <h3>Adicionar novas fotos</h3>
                    <label htmlFor="photo-upload" className="custom-file-upload">Escolher ficheiros</label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple />
                    {fotoFiles.length > 0 && <span className='file-name'>{fotoFiles.length} foto(s) selecionada(s)</span>}
                    <input type="text" placeholder="Legenda (para todas)" onChange={(e) => setFotoLegenda(e.target.value)} />
                    <input type="number" step="0.01" placeholder="Preço (para todas)" value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required />
                    {isUploadingFotos && <p>Enviando foto {uploadProgressFotos} de {fotoFiles.length}...</p>}
                    <button type="submit" className="upload-submit-button" disabled={isUploadingFotos || fotoFiles.length === 0}>{isUploadingFotos ? 'A enviar...' : `Enviar ${fotoFiles.length || 0} Foto(s)`}</button>
                </form>
                <div className="upload-form">
                    <h3>Adicionar novos vídeos</h3>
                    <label htmlFor="video-upload" className="custom-file-upload">Escolher ficheiros</label>
                    <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple />
                    {stagedVideos.length > 0 && (
                        <div className="staging-area">
                            <h4>Vídeos para enviar:</h4>
                            {stagedVideos.map((video) => (
                                <div key={video.id} className="staged-item">
                                    <p className='staged-item-name'>{video.videoFile.name}</p>
                                    <input type="text" placeholder="Título do vídeo" onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} required />
                                    <input type="number" step="0.01" value={video.preco} onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} required />
                                    <button type="button" onClick={() => removeStagedVideo(video.id)} className="remove-button-small">Remover</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {isUploadingVideos && <p>Enviando vídeo {uploadProgressVideos} de {stagedVideos.length}...</p>}
                    <button onClick={handleVideoSubmit} className="upload-submit-button" disabled={isUploadingVideos || stagedVideos.length === 0}>{isUploadingVideos ? 'A enviar...' : `Enviar ${stagedVideos.length} Vídeo(s)`}</button>
                </div>
            </div>

            {editingMedia && (
                <MediaEditForm 
                    media={editingMedia}
                    mediaType={mediaType}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingMedia(null)}
                />
            )}

            <hr style={{margin: '3rem 0', borderTop: '1px solid #eee', borderBottom: 'none'}} />
            <h2>Conteúdo do álbum</h2>
            <h3>Fotos ({album.fotos?.length || 0})</h3>
            <div className="media-grid">
                {album.fotos?.map(foto => (
                    <div key={foto.id} className="dashboard-media-card">
                        <div className="dashboard-media-image">
                           <img src={foto.imagem_url} alt={foto.legenda} style={{ transform: `rotate(${foto.rotacao}deg)` }} />
                        </div>
                        <div className="dashboard-media-info">
                            <p>R$ {parseFloat(foto.preco).toFixed(2)}</p>
                            <div className="media-actions">
                                <button onClick={() => openEditForm(foto, 'foto')} className="edit-button-pill">Editar</button>
                                <button onClick={() => handleDeleteMedia(foto.id, 'foto')} className="delete-button-pill">Excluir</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <h3 style={{ marginTop: '2rem' }}>Vídeos ({album.videos?.length || 0})</h3>
            <div className="media-grid">
                {album.videos?.map(video => (
                    <div key={video.id} className="dashboard-media-card">
                        <div className="dashboard-media-image">
                           <img src={video.miniatura_url} alt={video.titulo} />
                        </div>
                        <div className="dashboard-media-info">
                            <p className="media-title">{video.titulo}</p>
                            <p>R$ {parseFloat(video.preco).toFixed(2)}</p>
                            <div className="media-actions">
                                <button onClick={() => openEditForm(video, 'video')} className="edit-button-pill">Editar</button>
                                <button onClick={() => handleDeleteMedia(video.id, 'video')} className="delete-button-pill">Excluir</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardAlbumDetailPage;