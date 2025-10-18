// src/pages/dashboard/DashboardUploadPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';

function DashboardUploadPage() {
    const [albuns, setAlbuns] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState('');
    
    const [fotoFiles, setFotoFiles] = useState([]);
    const [fotoPreco, setFotoPreco] = useState('15.00');
    const [fotoLegenda, setFotoLegenda] = useState('');
    const [isUploadingFotos, setIsUploadingFotos] = useState(false);
    const [uploadProgressFotos, setUploadProgressFotos] = useState(0);

    const [stagedVideos, setStagedVideos] = useState([]);
    const [isUploadingVideos, setIsUploadingVideos] = useState(false);
    const [uploadProgressVideos, setUploadProgressVideos] = useState(0);

    useEffect(() => {
        const fetchAlbuns = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/albuns/');
                setAlbuns(response.data);
            } catch (error) {
                console.error("Erro ao buscar álbuns:", error);
            }
        };
        fetchAlbuns();
    }, []);

    const handlePhotoSubmit = async (e) => {
        e.preventDefault();
        if (fotoFiles.length === 0) {
            alert("Por favor, selecione pelo menos um ficheiro de foto.");
            return;
        }
        setIsUploadingFotos(true);
        setUploadProgressFotos(0);
        for (let i = 0; i < fotoFiles.length; i++) {
            const file = fotoFiles[i];
            setUploadProgressFotos(i + 1);
            const formData = new FormData();
            formData.append('album', selectedAlbum);
            formData.append('imagem', file);
            formData.append('preco', fotoPreco);
            formData.append('legenda', fotoLegenda);
            try {
                await axiosInstance.post('/fotos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } catch (error) {
                console.error(`Erro ao enviar a foto ${file.name}:`, error);
            }
        }
        setIsUploadingFotos(false);
        alert(`${fotoFiles.length} foto(s) enviada(s) com sucesso para processamento!`);
        // Limpa o input de ficheiro limpando o estado e resetando o form
        setFotoFiles([]);
        const photoForm = e.target;
        const fileInput = photoForm.querySelector('#photo-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleVideoSelect = (e) => {
        const files = Array.from(e.target.files);
        const newStagedVideos = files.map(file => ({ id: Date.now() + Math.random(), videoFile: file, titulo: '', preco: '50.00' }));
        setStagedVideos(prev => [...prev, ...newStagedVideos]);
    };

    const handleStagedVideoChange = (id, field, value) => {
        setStagedVideos(prev => prev.map(video => video.id === id ? { ...video, [field]: value } : video));
    };

    const removeStagedVideo = (id) => {
        setStagedVideos(prev => prev.filter(video => video.id !== id));
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        if (stagedVideos.length === 0) {
            alert("Nenhum vídeo selecionado para envio.");
            return;
        }
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
            formData.append('album', selectedAlbum);
            formData.append('titulo', video.titulo);
            formData.append('preco', video.preco);
            formData.append('arquivo_video', video.videoFile);
            try {
                await axiosInstance.post('/dashboard/videos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } catch (error) {
                console.error(`Erro ao enviar o vídeo ${video.videoFile.name}:`, error);
            }
        }
        setIsUploadingVideos(false);
        alert(`${stagedVideos.length} vídeo(s) enviados com sucesso!`);
        setStagedVideos([]);
        const videoUploadInput = document.getElementById('video-upload');
        if(videoUploadInput) videoUploadInput.value = '';
    };

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Upload de mídias</h2>
            </div>
            <div className="album-selector-wrapper">
                <label htmlFor="album-select">1. Selecione o álbum de destino:</label>
                <select id="album-select" value={selectedAlbum} onChange={(e) => setSelectedAlbum(e.target.value)}>
                    <option value="" disabled>-- Escolha um álbum --</option>
                    {albuns.map(album => (<option key={album.id} value={album.id}>{album.titulo}</option>))}
                </select>
            </div>
            {selectedAlbum && (
                <div className="upload-section">
                    <form onSubmit={handlePhotoSubmit} className="upload-form">
                        <h3>2. Adicionar novas fotos</h3>
                        <label htmlFor="photo-upload" className="custom-file-upload">Escolher ficheiros</label>
                        <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple />
                        {fotoFiles.length > 0 && <span className='file-name'>{fotoFiles.length} foto(s) selecionada(s)</span>}
                        <input type="text" placeholder="Legenda (será aplicada a todas)" onChange={(e) => setFotoLegenda(e.target.value)} />
                        <input type="number" step="0.01" placeholder="Preço (para todas as fotos)" value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required />
                        {isUploadingFotos && <p>Enviando foto {uploadProgressFotos} de {fotoFiles.length}...</p>}
                        <button type="submit" className="upload-submit-button" disabled={isUploadingFotos || fotoFiles.length === 0}>
                            {isUploadingFotos ? 'A enviar...' : `Enviar ${fotoFiles.length || 0} Foto(s)`}
                        </button>
                    </form>
                    <div className="upload-form">
                        <h3>2. Adicionar novos vídeos</h3>
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
                        <button onClick={handleVideoSubmit} className="upload-submit-button" disabled={isUploadingVideos || stagedVideos.length === 0}>
                            {isUploadingVideos ? 'A enviar...' : `Enviar ${stagedVideos.length} Vídeo(s)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardUploadPage;